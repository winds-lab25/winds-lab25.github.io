# How to edit the WiNDS Lab site

The site is now organized so each thing lives in one predictable place.

## File map
```
index.html          Home page  (clean, commented — edit content here)
research.html       Research directions
people.html         PI + students
publications.html   Papers & patents
grants.html         Funding
news.html           Full news log
join.html           How to join
assets/
  site.css          ALL styling (colours, fonts, spacing) — edit the look here, once
  site.js           ALL behavior (menu, animations, counters) — rarely touched
  img/
    logo.png            <- drop your logo here
    people/alakesh.jpg  <- drop your photo here
    students/*.jpg      <- drop student photos here (rakesh.jpg, ashish.jpg, ...)
```

## Common edits

### Change a colour or font (affects every page)
Open `assets/site.css`. The palette is at the very top in `:root{ ... }`.
e.g. `--signal:#0FA99B;` is the teal accent — change it and every page updates.

### Update the homepage
Open `index.html`. Every block starts with a big comment like
`<!-- STAT BAND · edit the four numbers -->`. Find the block, change the text.
- Stats: edit the number inside `data-count="4"` (data-dec = how many decimals show).
- Latest news preview: copy one `news-item` block, put it at the top, edit date + text.
  Tag classes: nt-pub (paper) · nt-grant (grant) · nt-award (award) · nt-misc (other).

### Add a news item (full list)
Open `news.html`, copy one `news-item` block, paste at the top, edit it.

### Add a paper
Open `publications.html`, copy one `pub` block inside the right section, edit it.

### Add a student
Open `people.html`, copy one `scard` block, change the name/topic, and (optionally)
add their photo to `assets/img/students/<name>.jpg`. Until a photo exists, initials show.

### After editing on your computer
Upload the changed file(s) to your GitHub repo (Add file → Upload files → commit).
Only the files you changed need re-uploading.
