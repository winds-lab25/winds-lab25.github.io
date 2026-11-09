/* WiNDS Lab — admin page. Talks to the Google Apps Script (google-apps-script/Code.gs). */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var SECTIONS = window.SECTIONS || {};
  var PW_KEY = 'winds-admin-password';     // kept for this browser tab only
  var SITE_CACHE = 'winds-site-data';       // same key the public site uses

  var state = { password: '', data: null, section: Object.keys(SECTIONS)[0], editingId: null };

  function $(id) { return document.getElementById(id); }

  // Small DOM helper: el('button', { class: 'btn', onclick: fn }, 'Text')
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), v);
      else if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v === true ? '' : v);
    });
    [].concat(children || []).forEach(function (c) {
      if (c != null) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  var toastTimer;
  function toast(msg, bad) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'toast' + (bad ? ' bad' : ''); }, bad ? 6000 : 2500);
  }

  /* ---------- talking to Google Apps Script ---------- */

  // Sent as text/plain on purpose: Apps Script can't answer the CORS pre-check a JSON request would trigger.
  function api(action, extra) {
    var body = Object.assign({ action: action, password: state.password }, extra || {});
    return fetch(CFG.scriptUrl, { method: 'POST', body: JSON.stringify(body) })
      .then(function (res) {
        return res.text();
      })
      .then(function (text) {
        var out;
        try { out = JSON.parse(text); } catch (e) {
          throw new Error('The Google Script did not answer properly. Check the URL in assets/config.js and that the deployment has access “Anyone”.');
        }
        if (!out.ok) throw new Error(out.error || 'Something went wrong.');
        if (out.data) {
          state.data = out.data;
          try { localStorage.setItem(SITE_CACHE, JSON.stringify(out.data)); } catch (e) {}
        }
        return out;
      }, function (err) {
        if (err instanceof TypeError) throw new Error('Could not reach the Google Script. Check your internet connection and the URL in assets/config.js.');
        throw err;
      });
  }

  // Runs an API call with the whole page locked, then redraws.
  function run(action, extra, okMessage) {
    $('app').disabled = true;
    toast('Saving…');
    return api(action, extra)
      .then(function () { render(); if (okMessage) toast(okMessage); return true; })
      .catch(function (err) { toast(err.message, true); return false; })
      .then(function (ok) { $('app').disabled = false; return ok; });
  }

  /* ---------- sign in / out ---------- */

  function showLogin(message) {
    $('app').hidden = true;
    $('logout').hidden = true;
    $('login-form').hidden = false;
    $('login-error').textContent = message || '';
    $('password').focus();
  }

  function signIn(password) {
    state.password = password;
    $('login-btn').disabled = true;
    $('login-error').textContent = '';
    return api('list')
      .then(function () {
        try { sessionStorage.setItem(PW_KEY, password); } catch (e) {}
        $('login-form').hidden = true;
        $('app').hidden = false;
        $('logout').hidden = false;
        render();
        // First sign-in on a Sheet that isn't set up yet (a tab is missing, or the Sheet holds none of the
        // website's existing content): copy that content in automatically. Your own items are kept.
        if (needsSetup()) restoreBuiltIn(true);
      })
      .catch(function (err) {
        try { sessionStorage.removeItem(PW_KEY); } catch (e) {}
        showLogin(err.message);
      })
      .then(function () { $('login-btn').disabled = false; });
  }

  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    signIn($('password').value);
  });

  $('logout').addEventListener('click', function (e) {
    e.preventDefault();
    try { sessionStorage.removeItem(PW_KEY); } catch (err) {}
    state.password = '';
    state.data = null;
    $('password').value = '';
    showLogin();
  });

  /* ---------- drawing ---------- */

  function items() { return (state.data && state.data[state.section]) || []; }
  function conf() { return SECTIONS[state.section]; }

  function render() {
    renderTabs();
    renderEditor();
    renderList();
    var total = Object.keys(SECTIONS).reduce(function (n, k) { return n + ((state.data && state.data[k]) || []).length; }, 0);
    $('empty-note').hidden = total > 0;
  }

  function renderTabs() {
    var tabs = $('tabs');
    tabs.textContent = '';
    Object.keys(SECTIONS).forEach(function (key) {
      var count = ((state.data && state.data[key]) || []).length;
      tabs.appendChild(el('button', {
        type: 'button', role: 'tab', 'aria-selected': String(key === state.section),
        onclick: function () { state.section = key; state.editingId = null; render(); }
      }, [SECTIONS[key].label, el('span', { class: 'count', text: String(count) })]));
    });
  }

  function renderEditor() {
    var c = conf();
    var editing = state.editingId && items().filter(function (it) { return it.id === state.editingId; })[0];
    if (state.editingId && !editing) state.editingId = null;

    $('editor-title').textContent = editing ? 'Edit ' + singular(c.label) : 'Add ' + singular(c.label);
    $('editor-submit').textContent = editing ? 'Save changes' : 'Add';
    $('editor-cancel').hidden = !editing;

    var box = $('editor-fields');
    box.textContent = '';
    c.fields.forEach(function (f) {
      var value = editing ? (editing[f.name] || '') : '';
      var input;
      if (f.type === 'select') {
        var options = f.options.slice();
        if (value && options.indexOf(value) < 0) options.push(value);   // keep unusual existing values
        input = el('select', { name: f.name }, options.map(function (o) {
          return el('option', { value: o, selected: o === value }, o);
        }));
      } else if (f.type === 'textarea') {
        input = el('textarea', { name: f.name, placeholder: f.placeholder, required: f.required, rows: 3 });
        input.value = value;
      } else if (f.type === 'image') {
        input = imageField(f, value);
      } else {
        input = el('input', { name: f.name, type: f.type === 'url' ? 'url' : 'text', placeholder: f.placeholder, required: f.required });
        input.value = value;
      }
      var wide = f.type === 'textarea' || f.type === 'image' || f.help;
      box.appendChild(el(f.type === 'image' ? 'div' : 'label', { class: 'field' + (wide ? ' wide' : '') }, [
        el('span', { text: f.label + (f.required ? ' *' : '') }),
        input,
        f.help ? el('small', { text: f.help }) : null
      ]));
    });
  }

  /* ---------- image fields: paste a link or upload a file (saved to Google Drive) ---------- */

  // Google Drive share links -> a direct image address (same rule as the website).
  function toImageUrl(u) {
    u = String(u || '').trim();
    var m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/);
    return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1600' : u;
  }

  function imageField(f, value) {
    var input = el('input', { name: f.name, type: 'text', placeholder: f.placeholder, 'aria-label': f.label });
    input.value = value;
    var preview = el('img', { class: 'img-preview', alt: '', hidden: true });
    function show() {
      var v = input.value.trim();
      preview.hidden = !v;
      if (v) preview.src = toImageUrl(v);
    }
    preview.addEventListener('error', function () { preview.hidden = true; });
    input.addEventListener('input', show);
    show();

    var file = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp', hidden: true });
    var btn = el('button', { type: 'button', class: 'btn btn-ghost', onclick: function () { file.click(); } }, 'Upload image…');
    file.addEventListener('change', function () {
      var chosen = file.files[0];
      file.value = '';
      if (!chosen) return;
      var submit = $('editor-submit');
      btn.disabled = submit.disabled = true;
      btn.textContent = 'Uploading…';
      toast('Uploading image…');
      prepareImage(chosen)
        .then(function (img) { return api('upload', img); })
        .then(function (out) {
          input.value = out.url;
          show();
          toast('Image uploaded. Click “' + submit.textContent + '” to save.');
        })
        .catch(function (err) { toast(err.message, true); })
        .then(function () { btn.disabled = submit.disabled = false; btn.textContent = 'Upload image…'; });
    });
    return el('div', {}, [el('div', { class: 'image-field' }, [input, btn, file]), preview]);
  }

  // Shrinks big photos (longest side 1600 px) before uploading; small images are sent as they are.
  function prepareImage(file) {
    var MAX = 1600;
    return new Promise(function (resolve, reject) {
      if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) { reject(new Error('Please choose a PNG, JPG, GIF or WebP image.')); return; }
      var url = URL.createObjectURL(file), img = new Image();
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('That file could not be opened as an image.')); };
      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth, h = img.naturalHeight, scale = Math.min(1, MAX / Math.max(w, h));
        if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
          var reader = new FileReader();
          reader.onerror = function () { reject(new Error('Could not read the image.')); };
          reader.onload = function () { resolve({ filename: file.name, mimeType: file.type, data: String(reader.result).split(',')[1] }); };
          reader.readAsDataURL(file);
          return;
        }
        function encode(type) {
          var c = document.createElement('canvas'), ctx = c.getContext('2d');
          c.width = Math.round(w * scale);
          c.height = Math.round(h * scale);
          if (type === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
          ctx.drawImage(img, 0, 0, c.width, c.height);
          return c.toDataURL(type, 0.88);
        }
        var type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        var data = encode(type);
        if (type === 'image/png' && data.length > 4e6) { type = 'image/jpeg'; data = encode(type); }   // very large PNG photo
        var base = file.name.replace(/\.[^.]+$/, '') || 'image';
        resolve({ filename: base + (type === 'image/png' ? '.png' : '.jpg'), mimeType: type, data: data.split(',')[1] });
      };
      img.src = url;
    });
  }

  function renderList() {
    var c = conf(), list = items(), ul = $('items');
    $('list-title').textContent = c.label + ' (' + list.length + ')';
    $('list-hint').textContent = list.length ? 'Shown on the website in this order. Use ↑ ↓ to reorder.' : '';
    ul.textContent = '';
    if (!list.length) { ul.appendChild(el('li', { class: 'muted', text: 'Nothing here yet. Add the first one above.' })); return; }

    list.forEach(function (it, i) {
      var meta = c.meta.map(function (m) { return it[m]; }).filter(Boolean).join(' · ');
      var label = plain(it[c.main]) || '(untitled)';
      ul.appendChild(el('li', { class: it.id === state.editingId ? 'editing' : '' }, [
        el('div', { class: 'item-main' }, [el('strong', { text: label, title: label }), el('span', { class: 'small muted', text: meta })]),
        el('div', { class: 'item-actions' }, [
          el('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0,
            onclick: function () { run('move', { section: state.section, id: it.id, direction: 'up' }); } }, '↑'),
          el('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Move down', 'aria-label': 'Move down', disabled: i === list.length - 1,
            onclick: function () { run('move', { section: state.section, id: it.id, direction: 'down' }); } }, '↓'),
          el('button', { class: 'btn btn-ghost btn-sm', type: 'button',
            onclick: function () { state.editingId = it.id; render(); $('editor').scrollIntoView({ behavior: 'smooth' }); } }, 'Edit'),
          el('button', { class: 'btn btn-danger btn-sm', type: 'button',
            onclick: function () {
              if (!confirm('Delete this item?\n\n' + label)) return;
              if (state.editingId === it.id) state.editingId = null;
              run('delete', { section: state.section, id: it.id }, 'Deleted');
            } }, 'Delete')
        ])
      ]));
    });
  }

  // "**bold** and [link](url)" -> "bold and link" for the list view
  function plain(s) {
    return String(s || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1');
  }

  function singular(label) { return label === 'News' ? 'news item' : label === 'People' ? 'person' : label.replace(/s$/, '').toLowerCase(); }

  /* ---------- add / edit ---------- */

  $('editor').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target;
    if (!form.reportValidity()) return;
    var item = {};
    conf().fields.forEach(function (f) { item[f.name] = form.elements[f.name].value.trim(); });

    if (state.editingId) {
      var id = state.editingId;
      run('update', { section: state.section, id: id, item: item }, 'Saved').then(function (ok) {
        if (ok) { state.editingId = null; render(); }
      });
    } else {
      run('add', { section: state.section, item: item, position: conf().addTo }, 'Added');
    }
  });

  $('editor-cancel').addEventListener('click', function () { state.editingId = null; render(); });

  /* ---------- tools ---------- */

  $('backup-btn').addEventListener('click', function () {
    var data = {};
    Object.keys(SECTIONS).forEach(function (k) { data[k] = (state.data && state.data[k]) || []; });
    var text = '/* WiNDS Lab website content — backup from the admin page, ' + new Date().toISOString().slice(0, 10) + ' */\n' +
      'window.SITE_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
    var a = el('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/javascript' })), download: 'data.js' });
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Adds every built-in item (assets/data.js) that the Sheet doesn't have yet. Nothing is deleted or overwritten:
  // the Sheet's own items stay first, in their order, and the missing built-in ones are added after them.
  function sameKey(section, item) {
    return String(item[SECTIONS[section].main] || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }
  function needsSetup() {
    var builtIn = window.SITE_DATA || {}, overlap = 0, total = 0;
    var missingTab = Object.keys(SECTIONS).some(function (k) { return !Array.isArray(state.data && state.data[k]); });
    if (missingTab) return true;
    Object.keys(SECTIONS).forEach(function (k) {
      var have = {};
      state.data[k].forEach(function (it) { have[sameKey(k, it)] = true; });
      (builtIn[k] || []).forEach(function (it) { total++; if (have[sameKey(k, it)]) overlap++; });
    });
    return total > 0 && overlap === 0;
  }

  function restoreBuiltIn(auto) {
    var builtIn = window.SITE_DATA;
    if (!builtIn) { toast('assets/data.js is missing.', true); return Promise.resolve(false); }
    var merged = {}, added = 0, missingTabs = 0;
    Object.keys(SECTIONS).forEach(function (k) {
      var current = Array.isArray(state.data && state.data[k]) ? state.data[k] : null;
      if (!current) { missingTabs++; current = []; }
      var have = {};
      current.forEach(function (it) { have[sameKey(k, it)] = true; });
      var extra = (builtIn[k] || []).filter(function (it) { return !have[sameKey(k, it)]; });
      added += extra.length;
      merged[k] = current.concat(extra);
    });
    if (!added && !missingTabs) { toast('Everything from the built-in content is already in the Google Sheet.'); return Promise.resolve(true); }
    if (!auto && !confirm('Add the ' + added + ' built-in item' + (added === 1 ? '' : 's') + ' that are missing from the Google Sheet?\n\nNothing is deleted. Your own items and edits are kept.')) return Promise.resolve(false);
    state.editingId = null;
    return run('import', { data: merged }, auto
      ? 'Your Google Sheet now has the website’s existing content (' + added + ' items added, your own items kept).'
      : 'Restored ' + added + ' item' + (added === 1 ? '' : 's') + '.');
  }

  $('import-btn').addEventListener('click', function () { restoreBuiltIn(false); });

  /* ---------- start ---------- */

  if (!CFG.scriptUrl) {
    $('setup-note').hidden = false;
    return;
  }
  var saved = null;
  try { saved = sessionStorage.getItem(PW_KEY); } catch (e) {}
  if (saved) signIn(saved); else showLogin();
})();
