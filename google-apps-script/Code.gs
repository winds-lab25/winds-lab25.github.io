/**
 * WiNDS Lab website — Google Apps Script backend
 * ------------------------------------------------
 * The Google Sheet this script is attached to is the website's database.
 *
 *   GET  <web app URL>   -> public: returns all site content as JSON
 *   POST <web app URL>   -> admin:  add / update / delete / move / import / upload (needs the password)
 *
 * Each tab (News, Research, Devices, People, Publications, Grants) is one section of the site.
 * Images uploaded from the admin page are saved in the Drive folder "WiNDS Lab website images".
 *
 * Setup (once) — full steps are in README.md:
 *   1. Create a Google Sheet, then Extensions -> Apps Script, and paste this file.
 *   2. Project Settings (gear icon) -> Script properties -> add
 *        Property: ADMIN_PASSWORD     Value: <your password>
 *   3. Deploy -> New deployment -> Web app
 *        Execute as: Me      Who has access: Anyone
 *   4. Copy the Web app URL into assets/config.js on the website.
 *
 * After editing this file, publish the change with
 *   Deploy -> Manage deployments -> (pencil) Edit -> Version: New version -> Deploy
 * (this keeps the same URL).
 */

// Columns of each tab. The "id" column is added automatically as column A.
// To add a field: add a column header in the Sheet, and the same field in assets/config.js.
var SECTIONS = {
  news:         ['date', 'tag', 'text'],
  research:     ['title', 'description', 'keywords'],
  devices:      ['name', 'category', 'description', 'image', 'specs'],
  people:       ['name', 'group', 'topic', 'period', 'note', 'photo', 'link'],
  publications: ['category', 'authors', 'title', 'venue', 'details', 'link'],
  grants:       ['title', 'sponsor', 'scheme', 'duration', 'amount', 'role']
};

var IMAGE_FOLDER = 'WiNDS Lab website images';   // Drive folder for images uploaded from the admin page
var CACHE_KEY = 'site-data';
var CACHE_SECONDS = 300;   // public reads are cached for 5 minutes (cleared on every change)


/* ------------------------------------------------------------------ */
/*  Public read                                                        */
/* ------------------------------------------------------------------ */

function doGet() {
  try {
    var cache = CacheService.getScriptCache();
    var json = cache.get(CACHE_KEY);
    if (!json) {
      json = JSON.stringify(readAll_());
      try { cache.put(CACHE_KEY, json, CACHE_SECONDS); } catch (err) { /* too large to cache: fine */ }
    }
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

// Runs automatically when someone edits the Sheet by hand, so the website updates right away.
function onEdit() {
  try { CacheService.getScriptCache().remove(CACHE_KEY); } catch (err) {}
}


/* ------------------------------------------------------------------ */
/*  Admin write                                                        */
/* ------------------------------------------------------------------ */

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'Bad request.' });
  }

  var password = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!password) {
    return json_({ ok: false, error: 'ADMIN_PASSWORD is not set. In Apps Script open Project Settings -> Script properties and add it.' });
  }
  if (req.password !== password) {
    Utilities.sleep(1500);   // slow down password guessing
    return json_({ ok: false, error: 'Wrong password.' });
  }

  if (req.action === 'upload') {
    try {
      return json_({ ok: true, url: saveImage_(req) });
    } catch (err) {
      return json_({ ok: false, error: String(err && err.message || err) });
    }
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    switch (req.action) {
      case 'list':   ensureAllIds_(); break;
      case 'add':    addItem_(req.section, req.item, req.position); break;
      case 'update': updateItem_(req.section, req.id, req.item); break;
      case 'delete': deleteItem_(req.section, req.id); break;
      case 'move':   moveItem_(req.section, req.id, req.direction); break;
      case 'import': importAll_(req.data); break;
      default: throw new Error('Unknown action: ' + req.action);
    }
    CacheService.getScriptCache().remove(CACHE_KEY);
    return json_({ ok: true, data: readAll_() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function addItem_(section, item, position) {
  var sh = sheet_(section);
  var head = header_(sh);
  var row = head.map(function (h) { return h === 'id' ? newId_() : clean_(item && item[h]); });
  var r;
  if (position === 'bottom') {
    r = sh.getLastRow() + 1;
  } else {
    sh.insertRowAfter(1);
    r = 2;
  }
  sh.getRange(r, 1, 1, head.length).setNumberFormat('@').setFontWeight('normal').setValues([row]);
}

function updateItem_(section, id, item) {
  var sh = sheet_(section);
  var head = header_(sh);
  var r = findRow_(sh, id);
  var range = sh.getRange(r, 1, 1, head.length);
  var row = range.getValues()[0];
  head.forEach(function (h, i) {
    if (h !== 'id' && item && Object.prototype.hasOwnProperty.call(item, h)) row[i] = clean_(item[h]);
  });
  range.setNumberFormat('@').setValues([row]);
}

function deleteItem_(section, id) {
  var sh = sheet_(section);
  var r = findRow_(sh, id);
  if (sh.getMaxRows() - sh.getFrozenRows() <= 1) {
    sh.getRange(r, 1, 1, sh.getLastColumn()).clearContent();   // Sheets won't delete the last row
  } else {
    sh.deleteRow(r);
  }
}

function moveItem_(section, id, direction) {
  var sh = sheet_(section);
  var r = findRow_(sh, id);
  var other = direction === 'up' ? r - 1 : r + 1;
  if (other < 2 || other > sh.getLastRow()) return;   // already at the top / bottom
  var cols = sh.getLastColumn();
  var a = sh.getRange(r, 1, 1, cols), b = sh.getRange(other, 1, 1, cols);
  var av = a.getValues(), bv = b.getValues();
  a.setValues(bv);
  b.setValues(av);
}

// Replaces the content of every tab with `data` ({ news: [...], people: [...], ... }).
function importAll_(data) {
  if (!data || typeof data !== 'object') throw new Error('Nothing to import.');
  Object.keys(SECTIONS).forEach(function (section) {
    var items = data[section];
    if (!Array.isArray(items)) return;
    var sh = sheet_(section);
    var head = header_(sh);
    var last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, sh.getLastColumn()).clearContent();
    if (!items.length) return;
    var rows = items.map(function (item) {
      return head.map(function (h) { return h === 'id' ? (clean_(item.id) || newId_()) : clean_(item[h]); });
    });
    sh.getRange(2, 1, rows.length, head.length).setNumberFormat('@').setFontWeight('normal').setValues(rows);
  });
}


// Saves an uploaded image to Google Drive, shares it as "anyone with the link can view",
// and returns an address the website can show.
function saveImage_(req) {
  var type = String(req.mimeType || '');
  if (!/^image\/(png|jpeg|gif|webp)$/.test(type)) throw new Error('Please choose a PNG, JPG, GIF or WebP image.');
  var bytes = Utilities.base64Decode(String(req.data || ''));
  if (!bytes.length) throw new Error('The image is empty.');
  if (bytes.length > 10 * 1024 * 1024) throw new Error('The image is too large (10 MB max).');
  var name = String(req.filename || 'image').replace(/[^\w.\- ]+/g, '_').slice(0, 80);

  var folders = DriveApp.getFoldersByName(IMAGE_FOLDER);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(IMAGE_FOLDER);
  var file = folder.createFile(Utilities.newBlob(bytes, type, name));
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    file.setTrashed(true);
    throw new Error('Google Drive would not share the image publicly (your Google Workspace may block this). ' +
      'Put the image in the website\'s assets/img folder and type its path instead.');
  }
  return 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600';
}


/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function readAll_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = {};
  Object.keys(SECTIONS).forEach(function (section) {
    var sh = ss.getSheetByName(sheetName_(section));
    // A tab that doesn't exist yet is left out, so the website keeps showing its built-in copy of that section.
    if (sh) out[section] = readSheet_(sh);
  });
  return out;
}

function readSheet_(sh) {
  var rows = sh.getLastRow(), cols = sh.getLastColumn();
  if (rows < 2 || cols < 1) return [];
  var values = sh.getRange(1, 1, rows, cols).getDisplayValues();
  var head = values[0].map(function (h) { return String(h).trim(); });
  return values.slice(1)
    .filter(function (row) { return row.some(function (c, i) { return head[i] !== 'id' && String(c).trim() !== ''; }); })
    .map(function (row) {
      var item = {};
      head.forEach(function (h, i) { if (h) item[h] = String(row[i]).trim(); });
      return item;
    });
}

// Gets the tab for a section, creating it (with headers) if it doesn't exist yet.
function sheet_(section) {
  if (!Object.prototype.hasOwnProperty.call(SECTIONS, section)) throw new Error('Unknown section: ' + section);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = sheetName_(section);
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    var head = ['id'].concat(SECTIONS[section]);
    sh.getRange(1, 1, sh.getMaxRows(), head.length).setNumberFormat('@');   // keep "Oct 2026" as text
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function sheetName_(section) {
  return section.charAt(0).toUpperCase() + section.slice(1);   // news -> News
}

function header_(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
}

function findRow_(sh, id) {
  var last = sh.getLastRow();
  if (id && last >= 2) {
    var ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) return i + 2;
    }
  }
  throw new Error('Item not found — it may have been changed in the Sheet. Reload and try again.');
}

// Rows typed directly into the Sheet have no id yet; give them one so the admin page can edit them.
function ensureAllIds_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SECTIONS).forEach(function (section) {
    var sh = ss.getSheetByName(sheetName_(section));
    if (!sh || sh.getLastRow() < 2) return;
    var range = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn());
    var values = range.getValues();
    var changed = false;
    values.forEach(function (row) {
      var hasContent = row.slice(1).some(function (c) { return String(c).trim() !== ''; });
      if (hasContent && String(row[0]).trim() === '') { row[0] = newId_(); changed = true; }
    });
    if (changed) sh.getRange(2, 1, values.length, 1).setValues(values.map(function (r) { return [r[0]]; }));
  });
}

function clean_(value) {
  var s = value == null ? '' : String(value).trim().slice(0, 5000);
  return /^[=+]/.test(s) ? "'" + s : s;   // never let text become a spreadsheet formula
}

function newId_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 10);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
