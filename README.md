# WiNDS Lab website

A simple one-page website for the WiNDS Lab (Wireless Networks & Distributed Systems), IIT (ISM) Dhanbad.
The **News, Research, Devices, People, Publications and Grants** lists are stored in a **Google Sheet** and managed
from the **admin page** (`admin.html`). A small **Google Apps Script** connects them.
It's plain HTML, CSS and JavaScript, with no build step.

```
index.html                  The website (About, PI and Join text are edited directly here)
admin.html                  Admin page: add / edit / delete / reorder items
assets/config.js            Settings: Google Script URL + the fields of each section
assets/data.js              Built-in copy of the content (offline fallback + first-time import)
assets/app.js               Draws the website from the data
assets/admin.js             Admin page logic
assets/style.css            All styling (colours at the top)
google-apps-script/Code.gs  The Google Apps Script (paste it into Google, not served by the site)
```

Until a Script URL is set, the website simply shows the content in `assets/data.js`.

---

## One-time setup (about 10 minutes)

### 1. Create the Google Sheet and the script
1. Go to <https://sheets.new> and name the sheet, for example **WiNDS Lab website**.
2. In the sheet: **Extensions → Apps Script**.
3. Delete the sample code, paste the whole contents of `google-apps-script/Code.gs`, and click **Save**.

### 2. Set the admin password
1. In Apps Script, click **Project Settings** (gear icon, left side).
2. Under **Script properties**, click **Add script property**.
3. Property: `ADMIN_PASSWORD`, Value: a password of your choice. Click **Save script properties**.

The password is stored only inside your Google script. It never appears in the website's files.

### 3. Deploy the script as a web app
1. Click **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
3. Click **Deploy**, then **Authorize access** and choose your Google account. Google asks for access to your
   Sheets and Drive; Drive is used to store images you upload from the admin page.
   If Google shows "Google hasn't verified this app", click **Advanced → Go to … (unsafe)**.
   This is normal for your own scripts.
4. Copy the **Web app URL** (it ends with `/exec`).

### 4. Connect the website
Open `assets/config.js` and paste the URL:
```js
scriptUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec',
```

### 5. Sign in once
Open `admin.html` (double-click it locally, or visit `…/admin.html` on the live site) and sign in.
The first time, the admin page copies the website's existing content into the Sheet by itself
(it creates the News, Research, Devices, People, Publications and Grants tabs). Anything you already
added is kept.

Done. From now on, use the admin page to make changes.

Until that first sign-in, the website keeps showing its built-in content for any section the Sheet
doesn't have yet, so connecting a new Sheet never empties the site.

---

## Everyday use

Open **`https://<your-site>/admin.html`** and sign in.

- **Add:** pick a tab, fill the form, click **Add**. News, publications and grants go on top; research, devices and people go at the bottom.
- **Edit:** click **Edit** on an item, change it, then click **Save changes**.
- **Delete:** click **Delete** and confirm.
- **Reorder:** use **↑ ↓**. The website shows items in exactly this order.

Changes appear on the website within a few seconds. You can also edit the Google Sheet directly;
each row is one item. Leave the `id` column alone (new rows get an id automatically).

Text formatting in news and research descriptions: `**bold**` and `[link text](https://…)`.
In publications, the name set in `highlightAuthor` (`A. Kalita`) is bolded automatically.

**Device figures and people photos:** in the *Figure / photo* (or *Photo*) field, click **Upload image…**,
pick the file, then click **Add** / **Save changes**. Large photos are shrunk automatically and saved in the
Google Drive folder *WiNDS Lab website images*, shared as "anyone with the link can view".
You can also paste a Google Drive share link (the file must be shared "Anyone with the link"),
any image URL, or the path of an image in this repo (e.g. `assets/img/devices/robot.jpg`).
Without a photo, devices show a line drawing that matches their category, and people show their initials.
Click a device photo on the website to view it full size.

If **Upload image** reports that Drive would not share the image, your Google Workspace (e.g. an
institute account) blocks public links. Either host the Sheet under a personal Google account, or put
the images in `assets/img/` in this repo and type the path.

**Devices section:** the four starter entries (IoT sensor nodes, gateway, mobile robots, UAV) are
placeholders. Edit them with your real devices and photos, or delete them. The section and its menu link hide
automatically when the Devices tab is empty.

PI photo: put it at `assets/img/people/alakesh.jpg`.

**Backups:** *Download backup (data.js)* on the admin page saves all content. Replacing
`assets/data.js` with it keeps the website's offline copy up to date.

**Restore built-in content** (admin page, bottom) adds back any item from `assets/data.js` that is
missing from the Sheet. It never deletes or changes anything, so it is always safe to press.

---

## Publish on GitHub Pages
1. Upload everything in this folder to the repository, with `index.html` at the root.
2. **Settings → Pages →** Source: *Deploy from a branch*, Branch: `main`, Folder: `/ (root)` → **Save**.
3. After a minute or two the site is live at `https://<user>.github.io/<repo>/`.

After the first upload you only need to re-upload a file when you change it by hand
(e.g. `index.html` text or `assets/config.js`). Content edits made through the admin page
do **not** need any upload.

## Changing things later
- **About / PI / Join text:** edit `index.html` directly.
- **Colours:** top of `assets/style.css`.
- **Updating the script** (for example after replacing it with a newer `Code.gs`): paste the new code,
  click **Save**, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
  The URL stays the same. If Google asks for permission again (e.g. for Drive), allow it.
- **Hero background:** a small cellular network: three towers in a triangle, tiny sensor nodes, two cars on a
  road, two UAVs and a crane arm. Each car and UAV is served by its nearest tower, and when that changes a
  handover is shown. It is drawn by `buildHeroScene()` and animated by `animateScene()` in `assets/app.js`.
  Positions, speeds, flight paths and the handover hysteresis are all in `SCENE` just above them.
  Animation stops for visitors who turn on "reduce motion".
- **Adding a field** (e.g. a "DOI" for publications): add a column header in that Sheet tab, and the same
  `name` to the section's `fields` in `assets/config.js`. To display it, also update the matching
  `render…` function in `assets/app.js`.
- **Forgot the password:** change `ADMIN_PASSWORD` in Apps Script → Project Settings → Script properties.
