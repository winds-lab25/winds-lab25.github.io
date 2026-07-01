# WiNDS Lab website

Modern, multi-page site for the WiNDS Lab (Wireless Networks & Distributed Systems),
IIT (ISM) Dhanbad. Plain HTML/CSS/JS — no build step, no server needed.

Pages: index.html (home), research.html, people.html, publications.html,
grants.html, news.html, join.html.

------------------------------------------------------------------------
CREATE A NEW GITHUB REPOSITORY AND GO LIVE
------------------------------------------------------------------------

STEP 1 — Create the repository
  1. Go to https://github.com/new  (or click the "+" at top-right of GitHub -> New repository).
  2. Owner: alakesh-kalita.
  3. Repository name:  winds-lab      (this becomes part of your URL).
  4. Set it to Public.
  5. Leave "Add a README" UNCHECKED (this project already has one).
  6. Click "Create repository".

STEP 2 — Upload the site
  1. On the new empty repo page, click "uploading an existing file"
     (or  Add file -> Upload files).
  2. Extract this zip on your computer, open the folder, and select ALL the files and
     folders INSIDE it — index.html, the other .html files, README.md, and the assets
     folder — then drag them into the upload area.
     (Upload the CONTENTS, so index.html sits at the repository root.)
  3. Write a commit message and click "Commit changes".

STEP 3 — Turn on GitHub Pages
  1. In the repo, go to  Settings -> Pages.
  2. Under "Build and deployment" -> Source, choose  "Deploy from a branch".
  3. Branch: main   Folder: / (root)   -> click Save.
  4. Wait about 1-2 minutes. The page will show your live URL:

     https://alakesh-kalita.github.io/winds-lab/

STEP 4 (optional) — Link it from your personal site
  On your personal site, point the lab link to:
     https://alakesh-kalita.github.io/winds-lab/

------------------------------------------------------------------------
ADD YOUR LOGO (drop-in, no code editing)
------------------------------------------------------------------------
Save your logo as:  assets/img/logo.png   (square PNG, transparent background best).
It appears automatically in the header and footer. Until then, the built-in glyph shows.

------------------------------------------------------------------------
ADD PHOTOS (drop-in, no code editing)
------------------------------------------------------------------------
Your photo:            assets/img/people/alakesh.jpg
Students (assets/img/students/):
  rakesh.jpg    -> Rakesh Pradhan
  ashish.jpg    -> Ashish Singh
  saket.jpg     -> Saket Tudu
  anindita.jpg  -> Anindita Sarkar
  aman.jpg      -> Aman Shaw
  punam.jpg     -> Punam Khilari
Each photo replaces the coloured monogram automatically; missing photos keep the initials.
Square-ish JPG/PNG, ~400x400, works best.

To add photos later on GitHub: open the folder in the repo (e.g. assets/img/students),
click "Add file -> Upload files", drag the images in, commit.

------------------------------------------------------------------------
ADD YOUR EMAIL (optional)
------------------------------------------------------------------------
The "Get in touch / Email your CV" buttons link to your personal website. To make them
open an email instead, edit the .html files and replace https://alakesh-kalita.github.io/
on those buttons with  mailto:youraddress@iitism.ac.in
