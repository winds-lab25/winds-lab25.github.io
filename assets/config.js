/* =====================================================================
   WiNDS Lab website — settings
   ===================================================================== */

window.SITE_CONFIG = {
  // Paste the Web app URL of your Google Apps Script here (it ends with /exec).
  // Leave it empty to show the built-in content from assets/data.js.
  scriptUrl: 'https://script.google.com/macros/s/AKfycbzirpZI6llg8jOiTt-8iOGDaS9oB1wuqKGSXol0Hl_xZ1szDyQkqrRC8YdIGPkJpHnb/exec',

  // This name is shown in bold in publication author lists.
  highlightAuthor: 'A. Kalita',
};

/* The editable sections. The admin page builds its forms from this list.
   Each `name` must match a column header in that section's Google Sheet tab.
   type: 'text' (default) | 'textarea' | 'select' | 'url' | 'image' (adds an Upload button) */
window.SECTIONS = {
  news: {
    label: 'News',
    addTo: 'top',              // new items appear first
    main: 'text',              // shown as the item's title in the admin list
    meta: ['date', 'tag'],
    fields: [
      { name: 'date', label: 'Date', placeholder: 'Oct 2026', required: true },
      { name: 'tag', label: 'Type', type: 'select', options: ['Paper', 'Grant', 'Award', 'Milestone', 'Talk', 'Event', 'Lab'] },
      { name: 'text', label: 'Text', type: 'textarea', required: true,
        help: 'Use **double asterisks** for bold and [text](https://…) for a link.' },
    ],
  },

  research: {
    label: 'Research',
    addTo: 'bottom',
    main: 'title',
    meta: ['keywords'],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'keywords', label: 'Keywords', placeholder: 'RPL, 6TiSCH, DSME', help: 'Separate with commas.' },
    ],
  },

  devices: {
    label: 'Devices',
    addTo: 'bottom',
    main: 'name',
    meta: ['category'],
    fields: [
      { name: 'name', label: 'Name', placeholder: 'Mobile robot', required: true },
      { name: 'category', label: 'Category', type: 'select',
        options: ['IoT node', 'Gateway', 'Robot', 'Robotic arm', 'UAV', 'Vehicle', 'Edge server', 'Radio / SDR', 'Other'] },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What it is and what you use it for.' },
      { name: 'image', label: 'Figure / photo', type: 'image', placeholder: 'Upload, or paste an image link',
        help: 'Landscape (4:3) photos look best. Without a photo, a drawing matching the category is shown.' },
      { name: 'specs', label: 'Key specs', placeholder: 'IEEE 802.15.4, 2.4 GHz, Contiki-NG', help: 'Separate with commas.' },
    ],
  },

  people: {
    label: 'People',
    addTo: 'bottom',
    main: 'name',
    meta: ['group', 'topic'],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'group', label: 'Group', type: 'select',
        options: ['PhD', "Master's", 'Intern', 'Alumni · PhD', 'Alumni · M.Tech', 'Alumni · M.Sc', 'Alumni · B.Tech'] },
      { name: 'topic', label: 'Research topic / programme', placeholder: 'Adaptive cell scheduling in 6TiSCH networks' },
      { name: 'period', label: 'Period', placeholder: 'Since Jul 2025' },
      { name: 'note', label: 'Award / note', placeholder: 'IndiaAI PhD Fellowship',
        help: 'For alumni, start with "Now" to show where they are, e.g. Now at Samsung R&D.' },
      { name: 'photo', label: 'Photo', type: 'image', placeholder: 'Upload, or paste an image link',
        help: 'Optional. A square photo works best. Initials show if blank.' },
      { name: 'link', label: 'Profile link', type: 'url', placeholder: 'https://…' },
    ],
  },

  publications: {
    label: 'Publications',
    addTo: 'top',
    main: 'title',
    meta: ['category', 'venue'],
    fields: [
      { name: 'category', label: 'Category', type: 'select', options: ['Journal', 'Conference', 'Patent', 'Book chapter'] },
      { name: 'authors', label: 'Authors', placeholder: 'P. Joshi, A. Kalita, and M. Gurusamy', required: true },
      { name: 'title', label: 'Title', type: 'textarea', required: true },
      { name: 'venue', label: 'Venue', placeholder: 'IEEE Internet of Things Journal' },
      { name: 'details', label: 'Details', placeholder: 'vol. 20, pp. 1–10 · 2026 · Accepted' },
      { name: 'link', label: 'Link', type: 'url', placeholder: 'https://doi.org/…' },
    ],
  },

  grants: {
    label: 'Grants',
    addTo: 'top',
    main: 'title',
    meta: ['sponsor', 'amount'],
    fields: [
      { name: 'title', label: 'Project title', required: true },
      { name: 'sponsor', label: 'Sponsor', placeholder: 'ANRF, Govt. of India' },
      { name: 'scheme', label: 'Scheme', placeholder: 'PM-ECRG' },
      { name: 'duration', label: 'Duration', placeholder: 'Jun 2025 – Jun 2028' },
      { name: 'amount', label: 'Amount', placeholder: '₹60.12 L' },
      { name: 'role', label: 'Role', type: 'select', options: ['PI', 'Co-PI'] },
    ],
  },
};
