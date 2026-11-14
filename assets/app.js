/* WiNDS Lab website — loads content from the Google Sheet (or assets/data.js) and draws it. */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var CACHE_KEY = 'winds-site-data';
  var NEWS_SHOWN = 5;      // news rows shown under the featured item
  var PUBS_SHOWN = 6;      // publications shown before "Show all"
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PEOPLE_GROUPS = { 'PhD': 'Doctoral researchers', "Master's": 'Master’s researchers', 'Intern': 'Interns' };
  // Alumni ("Alumni · PhD", "Alumni (MSc)", plain "Alumni", …) are shown last, grouped by degree in this order.
  var ALUMNI_DEGREES = { 'PhD': 'PhD', 'M.Tech': 'M.Tech', 'M.Sc': 'M.Sc', 'B.Tech': 'B.Tech' };
  var PUB_GROUPS = { 'Journal': 'Journals', 'Conference': 'Conferences', 'Patent': 'Patents', 'Book chapter': 'Book chapters' };
  var LINK_NAMES = {
    'ieeexplore.ieee.org': 'IEEE Xplore', 'doi.org': 'DOI', 'dx.doi.org': 'DOI', 'dl.acm.org': 'ACM DL',
    'arxiv.org': 'arXiv', 'link.springer.com': 'Springer', 'sciencedirect.com': 'ScienceDirect', 'scholar.google.com': 'Scholar'
  };

  /* ---------- icons ---------- */

  function stroke(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var ICON = {
    calendar: stroke('<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>'),
    building: stroke('<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M16 9h2a2 2 0 0 1 2 2v10"/><path d="M2 21h20M8 7h4M8 11h4M8 15h4"/>'),
    scheme: stroke('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.4"/>'),
    award: stroke('<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>'),
    external: stroke('<path d="M7 17 17 7M8 7h9v9"/>'),
    arrow: stroke('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    work: stroke('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'),
    zoom: stroke('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>')
  };
  // Two-tone line icons on a 48-unit grid. Classes: l = line, a = accent line, af = accent fill,
  // bg = filled with the tile colour (hides lines behind it). Animations live in style.css (.gi …).
  function glyph(name, extra) {
    return '<svg class="gi gi-' + name + (extra ? ' ' + extra : '') + '" viewBox="0 0 48 48" aria-hidden="true">' + GLYPH[name] + '</svg>';
  }
  var GLYPH = {
    iot:
      '<path class="a dash" d="M10.3 11.2L17 17M37.7 11.2L31 17M10.3 36.8L17 31M37.7 36.8L31 31"/>' +
      '<path class="l" d="M21.5 17v-3.5M26.5 17v-3.5M21.5 31v3.5M26.5 31v3.5M17 21.5h-3.5M17 26.5h-3.5M31 21.5h3.5M31 26.5h3.5"/>' +
      '<rect class="l bg" x="17" y="17" width="14" height="14" rx="3.5"/><circle class="af" cx="24" cy="24" r="2.6"/>' +
      '<circle class="l bg n" cx="8" cy="9" r="3.2"/><circle class="l bg n" cx="40" cy="9" r="3.2"/>' +
      '<circle class="l bg n" cx="8" cy="39" r="3.2"/><circle class="l bg n" cx="40" cy="39" r="3.2"/>',
    wireless:
      '<path class="a arc2" d="M16.2 9.2A11 11 0 0 0 16.2 24.8M31.8 9.2A11 11 0 0 1 31.8 24.8"/>' +
      '<path class="a arc1" d="M19.8 12.8A6 6 0 0 0 19.8 21.2M28.2 12.8A6 6 0 0 1 28.2 21.2"/>' +
      '<path class="l" d="M24 20L17.5 42M24 20L30.5 42M19.6 35H28.4M21.2 29.5H26.8M21.2 29.5L28.4 35M26.8 29.5L19.6 35M13 42H35"/>' +
      '<circle class="af" cx="24" cy="17" r="3"/>',
    perf:
      '<path class="l" d="M6 30A18 18 0 0 1 42 30"/><path class="a" d="M33 14.4A18 18 0 0 1 42 30"/>' +
      '<path class="l" d="M6 30h3.5M11.3 17.3l2.5 2.5M24 12v3.5M36.7 17.3l-2.5 2.5M42 30h-3.5M14 38.5h8M26 38.5h8"/>' +
      '<path class="a needle" d="M24 30V16"/><circle class="l bg" cx="24" cy="30" r="3.2"/><circle class="af" cx="24" cy="30" r="1.3"/>',
    congestion:
      '<path class="l" d="M5 11H17L27 19.5H43M5 37H17L27 28.5H43"/>' +
      '<g class="q"><rect class="l bg" x="8" y="15" width="6" height="6" rx="1.5"/><rect class="l bg" x="8" y="27" width="6" height="6" rx="1.5"/>' +
      '<rect class="l bg" x="15.5" y="21" width="6" height="6" rx="1.5"/></g>' +
      '<g class="pk"><rect class="af" x="29" y="21.5" width="5" height="5" rx="1.2"/><rect class="af" x="36" y="21.5" width="5" height="5" rx="1.2"/></g>',
    edge:
      '<path class="a dash" d="M24 19.5V26M18 35L11 40M24 35V39.5M30 35L37 40"/>' +
      '<path class="l bg" d="M15 19H33A4.6 4.6 0 0 0 33.5 9.85A7 7 0 0 0 20.5 9.3A5 5 0 0 0 15 19Z"/>' +
      '<rect class="l bg" x="15" y="26" width="18" height="9" rx="2.5"/><circle class="af" cx="19.5" cy="30.5" r="1.5"/><path class="l" d="M23.5 30.5H29"/>' +
      '<circle class="l bg n" cx="10" cy="41.5" r="2.4"/><circle class="l bg n" cx="24" cy="42" r="2.4"/><circle class="l bg n" cx="38" cy="41.5" r="2.4"/>',
    rl:
      '<g class="loop"><path class="a" d="M39 18.5A16 16 0 0 0 9 18.5M7.3 14.3L9 18.5L13 16.3"/>' +
      '<path class="a" d="M9 29.5A16 16 0 0 0 39 29.5M35 31.7L39 29.5L40.7 33.7"/></g>' +
      '<path class="l" d="M16 18L24 24L32 18M16 30L24 24L32 30"/>' +
      '<circle class="l bg" cx="16" cy="18" r="2.6"/><circle class="l bg" cx="16" cy="30" r="2.6"/>' +
      '<circle class="l bg" cx="32" cy="18" r="2.6"/><circle class="l bg" cx="32" cy="30" r="2.6"/><circle class="af" cx="24" cy="24" r="3.2"/>',
    funds:
      '<path class="l" d="M6 41H42"/><rect class="l bg" x="9" y="31" width="6" height="10" rx="1.5"/>' +
      '<rect class="l bg" x="19" y="25" width="6" height="16" rx="1.5"/><rect class="l bg" x="29" y="18" width="6" height="23" rx="1.5"/>' +
      '<path class="a" d="M8 23L17 15.5L23 19.5L37 8M31 8H37V14"/>',
    papers:
      '<path class="l bg" d="M12 6H28L36 14V42H12Z"/><path class="l" d="M28 6V14H36M17 20H31M17 26H31M17 32H24"/>' +
      '<circle class="af" cx="35" cy="37" r="7"/><path class="ck" d="M31.8 37.2L34.2 39.5L38.4 34.8"/>',
    patents:
      '<path class="l" d="M18 28.5L14 41.5L19.5 39L22.5 43.5M30 28.5L34 41.5L28.5 39L25.5 43.5"/>' +
      '<circle class="l bg" cx="24" cy="18" r="12"/><circle class="a" cx="24" cy="18" r="7.5"/><path class="a" d="M20.6 18.2L23 20.6L27.6 15.6"/>',
    people:
      '<path class="l" d="M12 21.5V31.5C12 35.5 36 35.5 36 31.5V21.5"/>' +
      '<path class="l bg" d="M4 17L24 8L44 17L24 26Z"/><path class="a" d="M40 18.8V31"/><circle class="af" cx="40" cy="33.5" r="2.4"/>',
    simulate:
      '<rect class="l bg" x="5" y="7" width="38" height="27" rx="3.5"/><path class="l" d="M18 41H30M24 34V41"/>' +
      '<path class="a draw" d="M10 27L16.5 19.5L22 23.5L28.5 14L34 18L38.5 12.5"/><circle class="af" cx="38.5" cy="12.5" r="1.8"/>',
    hardware:
      '<path class="a arc1" d="M31.5 5A5 5 0 0 0 31.5 12M38.5 5A5 5 0 0 1 38.5 12"/>' +
      '<path class="l" d="M35 20V11"/><circle class="af" cx="35" cy="8.5" r="2.2"/>' +
      '<rect class="l bg" x="6" y="20" width="36" height="21" rx="3.5"/><rect class="l" x="12" y="25.5" width="10" height="10" rx="2"/>' +
      '<path class="l" d="M27.5 27H36M27.5 33H32.5M15 25.5V23M19 25.5V23M15 35.5V38M19 35.5V38"/><circle class="af led" cx="37" cy="35" r="1.6"/>',
    learn:
      '<path class="l thin" d="M10 13L24 17M10 13L24 31M10 24L24 17M10 24L24 31M10 35L24 17M10 35L24 31M24 17L38 24M24 31L38 24"/>' +
      '<circle class="l bg" cx="10" cy="13" r="3.2"/><circle class="l bg" cx="10" cy="24" r="3.2"/><circle class="l bg" cx="10" cy="35" r="3.2"/>' +
      '<circle class="l bg" cx="24" cy="17" r="3.2"/><circle class="l bg" cx="24" cy="31" r="3.2"/><circle class="l bg" cx="38" cy="24" r="3.6"/>' +
      '<circle class="af lit d0" cx="10" cy="13" r="1.5"/><circle class="af lit d0" cx="10" cy="24" r="1.5"/><circle class="af lit d0" cx="10" cy="35" r="1.5"/>' +
      '<circle class="af lit d1" cx="24" cy="17" r="1.5"/><circle class="af lit d1" cx="24" cy="31" r="1.5"/><circle class="af lit d2" cx="38" cy="24" r="1.8"/>',
    read:
      '<path class="l" d="M24 14C20 11 13 10 7 11V37C13 36 20 37 24 40C28 37 35 36 41 37V11C35 10 28 11 24 14ZM24 14V40"/>',
    send:
      '<path class="l" d="M42 6L20 28M42 6L28 42L20 28L6 20Z"/>',
    apply:
      '<path class="l" d="M6 18L24 8L42 18ZM10 22V35M18 22V35M30 22V35M38 22V35M6 40H42M8 35.5H40"/>'
  };

  // Pick a research icon from the topic's name, so icons stay right when topics are renamed or reordered.
  function researchGlyph(title, i) {
    var t = String(title || '').toLowerCase();
    if (/congestion|queue|traffic|flow control/.test(t)) return 'congestion';
    if (/reinforcement|\brl\b|learning|\bai\b|\bml\b|neural|intelligen/.test(t)) return 'rl';
    if (/edge|fog|cloud/.test(t)) return 'edge';
    if (/performance|evaluation|benchmark|measure/.test(t)) return 'perf';
    if (/wireless|radio|5g|6g|wi-?fi|uav|lpwan|802\.11/.test(t)) return 'wireless';
    if (/iot|internet of things|sensor/.test(t)) return 'iot';
    return ['iot', 'wireless', 'perf', 'congestion', 'edge', 'rl'][i % 6];
  }

  /* ---------- device line-art (hero background + device cards without a photo) ---------- */

  var ART = {
    node: { box: '-36 -48 72 72', svg:
      '<path class="d-line" d="M10 -14V-34"/><circle class="d-acc" cx="10" cy="-37" r="2.8"/>' +
      '<rect class="d-body" x="-22" y="-14" width="44" height="30" rx="6"/><circle class="d-led" cx="-11" cy="1" r="3"/>' +
      '<path class="d-line" d="M-2 -3h14M-2 5h9"/>' },
    tower: { box: '-48 -46 96 222', svg:
      '<path class="d-sig" d="M-11.3 -19.3A16 16 0 0 0 -11.3 3.3M11.3 -19.3A16 16 0 0 1 11.3 3.3M-19.8 -27.8A28 28 0 0 0 -19.8 11.8M19.8 -27.8A28 28 0 0 1 19.8 11.8"/>' +
      '<path class="d-line" d="M0 10V-2M-26 170L-6 10M26 170L6 10M-6 10H6M-10 45H10M-15 85H15M-20 125H20M-25 160H25M-10 45L15 85M10 45L-15 85M-15 85L20 125M15 85L-20 125M-20 125L25 160M20 125L-25 160M-38 170H38"/>' +
      '<circle class="d-acc" cx="0" cy="-8" r="5.5"/>' },
    robot: { box: '-58 -64 116 94', svg:
      '<path class="d-line" d="M28 -24V-50"/><circle class="d-acc" cx="28" cy="-53" r="2.8"/>' +
      '<rect class="d-body" x="-18" y="-44" width="36" height="20" rx="6"/><circle class="d-led" cx="0" cy="-34" r="3.5"/>' +
      '<rect class="d-body" x="-46" y="-24" width="92" height="34" rx="10"/><path class="d-line" d="M-34 -10h24M-34 -2h14"/>' +
      '<g class="wh"><circle class="d-body" cx="-27" cy="14" r="12"/><path class="d-line" d="M-27 6V22M-35 14H-19"/></g>' +
      '<g class="wh"><circle class="d-body" cx="27" cy="14" r="12"/><path class="d-line" d="M27 6V22M19 14H35"/></g>' },
    arm: { box: '-46 -122 152 128', svg:
      '<rect class="d-body arm-upper" x="-6" y="-104" width="12" height="70" rx="6" transform="rotate(28 0 -34)"/>' +
      '<rect class="d-body arm-fore" x="-5" y="-56" width="10" height="56" rx="5" transform="translate(32.9 -95.8) rotate(105)"/>' +
      '<path class="d-body" d="M-20 -10L-14 -30H14L20 -10Z"/><rect class="d-body" x="-38" y="-10" width="76" height="10" rx="3"/>' +
      '<circle class="d-body" cx="0" cy="-34" r="9"/><circle class="d-led" cx="0" cy="-34" r="3"/>' +
      '<circle class="d-body arm-elbow" cx="32.9" cy="-95.8" r="7.5"/>' +
      '<g class="arm-grip" transform="translate(87 -81.3)"><circle class="d-body" cx="0" cy="0" r="5.5"/>' +
      '<path class="d-line" d="M0 5V12M-7 13H7M-7 13V24L-3 29M7 13V24L3 29"/></g>' },
    car: { box: '-40 -40 80 56', svg:
      '<path class="d-line" d="M6 -20V-31"/><circle class="d-acc" cx="6" cy="-33" r="2.6"/>' +
      '<path class="d-body" d="M-32 4V-6Q-32 -10 -28 -10H-18L-10 -20H12L20 -10H28Q32 -10 32 -6V4Z"/>' +
      '<path class="d-line" d="M-15 -11L-9.5 -18H0V-11ZM3 -18H11L16.5 -11H3Z"/><circle class="d-led" cx="28" cy="-4" r="2"/>' +
      '<g class="wh"><circle class="d-body" cx="-18" cy="5" r="7"/><path class="d-line" d="M-18 0V10M-23 5H-13"/></g>' +
      '<g class="wh"><circle class="d-body" cx="18" cy="5" r="7"/><path class="d-line" d="M18 0V10M13 5H23"/></g>' },
    drone: { box: '-72 -30 144 58', svg:
      '<path class="d-line" d="M-14 0H-46M14 0H46M-46 0V-8M46 0V-8M-9 8L-16 20M9 8L16 20M-21 20H-11M11 20H21"/>' +
      '<ellipse class="d-rotor" cx="-46" cy="-10" rx="21" ry="3.4"/><ellipse class="d-rotor" cx="46" cy="-10" rx="21" ry="3.4"/>' +
      '<rect class="d-body" x="-16" y="-8" width="32" height="16" rx="6"/><circle class="d-led" cx="0" cy="0" r="3"/>' },
    server: { box: '-40 -50 80 100', svg:
      '<rect class="d-body" x="-30" y="-40" width="60" height="80" rx="6"/><path class="d-line" d="M-30 -13H30M-30 13H30M-8 -27H20M-8 0H20M-8 26H20"/>' +
      '<circle class="d-led" cx="-18" cy="-27" r="2.8"/><circle class="d-led" cx="-18" cy="0" r="2.8"/><circle class="d-led" cx="-18" cy="26" r="2.8"/>' },
    sdr: { box: '-44 -52 88 76', svg:
      '<path class="d-line" d="M-16 -14V-40M16 -14V-40"/><circle class="d-acc" cx="-16" cy="-43" r="2.8"/><circle class="d-acc" cx="16" cy="-43" r="2.8"/>' +
      '<rect class="d-body" x="-34" y="-14" width="68" height="30" rx="6"/><circle class="d-led" cx="-22" cy="1" r="3"/><path class="d-line" d="M-10 -3h30M-10 5h22"/>' },
    chip: { box: '-44 -44 88 88', svg:
      '<path class="d-line" d="M-12 -24V-34M0 -24V-34M12 -24V-34M-12 24V34M0 24V34M12 24V34M-24 -12H-34M-24 0H-34M-24 12H-34M24 -12H34M24 0H34M24 12H34"/>' +
      '<rect class="d-body" x="-24" y="-24" width="48" height="48" rx="6"/><rect class="d-line" x="-10" y="-10" width="20" height="20" rx="3"/><circle class="d-led" cx="0" cy="0" r="3"/>' }
  };

  function artFor(category, name) {
    var s = (category + ' ' + name).toLowerCase();
    if (/arm|manipulator/.test(s)) return 'arm';
    if (/robot|rover|agv/.test(s)) return 'robot';
    if (/\bcars?\b|vehicle|iov|v2x/.test(s)) return 'car';
    if (/uav|drone|aerial/.test(s)) return 'drone';
    if (/gateway|router|base station|tower|access point/.test(s)) return 'tower';
    if (/server|edge|compute|cluster/.test(s)) return 'server';
    if (/sdr|radio|usrp/.test(s)) return 'sdr';
    if (/node|sensor|mote|iot/.test(s)) return 'node';
    return 'chip';
  }

  // Hero background. Coordinates are in "scene units"; the whole scene is drawn at 80% size.
  var SCENE = {
    towers: [[410, 120], [180, 360], [650, 330]],         // antenna tips: top, left, right (a triangle of cells)
    cell: 190,                                             // coverage radius drawn around each tower
    nodes: [[300, 70], [520, 60], [330, 160], [500, 150], [70, 330], [80, 450], [290, 400], [250, 460],
            [740, 160], [770, 300], [560, 410]],           // tiny sensor nodes
    crane: [775, 495],
    road: { y: 537, lanes: [521, 553], from: -60, to: 860 },
    cars: [{ lane: 0, dir: 1, speed: 52, offset: 0 }, { lane: 1, dir: -1, speed: 40, offset: 420 }],
    uavs: [{ c: [600, 240], r: [150, 45], w: 0.38, ph: 0 }, { c: [250, 250], r: [140, 40], w: -0.33, ph: 2 }],
    hysteresis: 0.88                                       // switch only when the new tower is 12% closer
  };
  var SVGNS = 'http://www.w3.org/2000/svg';

  function pt(a) { return a[0].toFixed(1) + ' ' + a[1].toFixed(1); }
  function nearestTower(a) {
    var best = 0, bd = Infinity;
    SCENE.towers.forEach(function (t, i) { var d = Math.hypot(t[0] - a[0], t[1] - a[1]); if (d < bd) { bd = d; best = i; } });
    return best;
  }

  function buildHeroScene() {
    var host = $('hero-scene');
    if (!host) return;
    var S = SCENE, R = S.road, n = 0;
    function place(name, x, y, scale, cls) {
      return '<g class="' + (cls || '') + '" transform="translate(' + x + ' ' + y + ')"><g transform="scale(' + scale + ')">' +
        '<g class="dev" style="--d:-' + ((n++ * 0.53) % 2.8).toFixed(2) + 's">' + ART[name].svg + '</g></g></g>';
    }
    var nodeAnchor = function (p) { return [p[0] + 4.5, p[1] - 16.6]; };
    var craneAnchor = [S.crane[0], S.crane[1] - 22];

    var cells = S.towers.map(function (t, i) {
      return '<circle class="cov" cx="' + t[0] + '" cy="' + t[1] + '" r="' + S.cell + '"/>' +
        '<circle class="pulse" cx="' + t[0] + '" cy="' + t[1] + '" r="34" style="animation-delay:' + (i * 1.7) + 's"/>';
    }).join('');
    var road = '<path class="road" d="M' + R.from + ' ' + (R.y - 32) + 'H' + R.to + 'M' + R.from + ' ' + (R.y + 32) + 'H' + R.to + '"/>' +
      '<path class="lane" d="M' + R.from + ' ' + R.y + 'H' + R.to + '"/>';
    var links = S.nodes.map(function (p) { var a = nodeAnchor(p); return '<path class="ln-node" d="M' + pt(a) + 'L' + pt(S.towers[nearestTower(a)]) + '"/>'; }).join('') +
      '<path class="ln-node" d="M' + pt(craneAnchor) + 'L' + pt(S.towers[nearestTower(craneAnchor)]) + '"/>' +
      S.cars.map(function (c, i) { return '<path class="ln-move ln-car-' + i + '"/>'; }).join('') +
      S.uavs.map(function (u, i) { return '<path class="ln-move ln-uav-' + i + '"/>'; }).join('');

    host.innerHTML =
      '<svg viewBox="' + sceneViewBox() + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g transform="translate(736 126) scale(.8)">' +
      cells + road + '<g class="links">' + links + '</g>' +
      S.towers.map(function (t) { return place('tower', t[0], t[1] + 4.8, 0.6); }).join('') +
      S.nodes.map(function (p) { return place('node', p[0], p[1], 0.45); }).join('') +
      place('arm', S.crane[0], S.crane[1], 0.65, 'mv-arm') +
      S.cars.map(function (c, i) { return place('car', R.from, R.lanes[c.lane], 0.7, 'mv-car mv-car-' + i); }).join('') +
      S.uavs.map(function (u, i) { return place('drone', u.c[0], u.c[1], 0.75, 'mv-uav mv-uav-' + i); }).join('') +
      '<g class="fx"></g></g></svg>';
    var svg = host.querySelector('svg');
    if (window.matchMedia) {
      var mq = window.matchMedia('(max-width: 960px)');
      var update = function () { svg.setAttribute('viewBox', sceneViewBox()); };
      if (mq.addEventListener) mq.addEventListener('change', update); else if (mq.addListener) mq.addListener(update);
    }
    animateScene(svg);
  }

  // The part of the drawing to show: everything on wide screens, the towers and traffic on phones.
  function sceneViewBox() {
    return window.matchMedia && window.matchMedia('(max-width: 960px)').matches ? '730 120 680 480' : '680 90 760 520';
  }

  // Moves the cars, UAVs and crane arm. Each car and UAV is served by the nearest tower;
  // when that changes, a handover is shown (new link flashes, old link fades, a short label appears).
  function animateScene(svg) {
    var S = SCENE, R = S.road, rad = Math.PI / 180, fx = svg.querySelector('.fx');
    var movers = [];
    S.cars.forEach(function (cfg, i) {
      var g = svg.querySelector('.mv-car-' + i);
      movers.push({ kind: 'car', cfg: cfg, g: g, wheels: g.querySelectorAll('.wh'), link: svg.querySelector('.ln-car-' + i), spin: 0, lastX: null, serving: -1 });
    });
    S.uavs.forEach(function (cfg, i) {
      movers.push({ kind: 'uav', cfg: cfg, g: svg.querySelector('.mv-uav-' + i), link: svg.querySelector('.ln-uav-' + i), serving: -1 });
    });
    var arm = svg.querySelector('.mv-arm');
    var upper = arm.querySelector('.arm-upper'), fore = arm.querySelector('.arm-fore');
    var elbow = arm.querySelector('.arm-elbow'), grip = arm.querySelector('.arm-grip');

    function add(tag, attrs, life, text) {
      var el = document.createElementNS(SVGNS, tag);
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
      if (text) el.textContent = text;
      fx.appendChild(el);
      setTimeout(function () { el.remove(); }, life);
      return el;
    }

    function handover(m, a, from, to) {
      var tt = S.towers[to];
      m.old = add('path', { 'class': 'old-link', d: 'M' + pt(a) + 'L' + pt(S.towers[from]) }, 1000);
      m.oldFrom = from;
      m.label = add('text', { 'class': 'ho-label', x: a[0].toFixed(1), y: (a[1] - 14).toFixed(1) }, 1800, 'HANDOVER');
      add('circle', { 'class': 'burst', cx: a[0].toFixed(1), cy: a[1].toFixed(1), r: 10 }, 1200);
      add('circle', { 'class': 'burst', cx: tt[0], cy: tt[1], r: 14 }, 1200);
      m.link.classList.add('ho');
      clearTimeout(m.hoTimer);
      m.hoTimer = setTimeout(function () { m.link.classList.remove('ho'); m.label = m.old = null; }, 1600);
    }

    function draw(t, quiet) {
      movers.forEach(function (m) {
        var a, jump = false, c = m.cfg;
        if (m.kind === 'car') {
          var span = R.to - R.from, d = ((c.offset + t * c.speed) % span + span) % span;
          var x = c.dir > 0 ? R.from + d : R.to - d, y = R.lanes[c.lane];
          jump = m.lastX !== null && Math.abs(x - m.lastX) > 100;           // wrapped around the road
          if (m.lastX !== null && !jump) m.spin += Math.abs(x - m.lastX) / 4.9 / rad;
          m.lastX = x;
          m.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y + ')' + (c.dir < 0 ? ' scale(-1 1)' : ''));
          m.wheels[0].setAttribute('transform', 'rotate(' + m.spin.toFixed(1) + ' -18 5)');
          m.wheels[1].setAttribute('transform', 'rotate(' + m.spin.toFixed(1) + ' 18 5)');
          a = [x + 4.2 * c.dir, y - 23.1];
        } else {
          var ang = c.ph + t * c.w;
          var ux = c.c[0] + c.r[0] * Math.sin(ang), uy = c.c[1] + c.r[1] * Math.sin(2 * ang);
          m.g.setAttribute('transform', 'translate(' + ux.toFixed(1) + ' ' + uy.toFixed(1) + ') rotate(' + (8 * Math.cos(ang) * (c.w > 0 ? 1 : -1)).toFixed(2) + ')');
          a = [ux, uy];
        }
        // serving tower, with hysteresis
        var best = nearestTower(a);
        if (m.serving < 0 || quiet || jump) {
          m.serving = best;
        } else if (best !== m.serving) {
          var dBest = Math.hypot(S.towers[best][0] - a[0], S.towers[best][1] - a[1]);
          var dCur = Math.hypot(S.towers[m.serving][0] - a[0], S.towers[m.serving][1] - a[1]);
          if (dBest < dCur * S.hysteresis) { handover(m, a, m.serving, best); m.serving = best; }
        }
        m.link.setAttribute('d', 'M' + pt(a) + 'L' + pt(S.towers[m.serving]));
        if (m.label) { m.label.setAttribute('x', a[0].toFixed(1)); m.label.setAttribute('y', (a[1] - 14).toFixed(1)); }
        if (m.old) m.old.setAttribute('d', 'M' + pt(a) + 'L' + pt(S.towers[m.oldFrom]));
      });

      // crane arm: shoulder and elbow swing; the gripper hangs from the wrist
      var a1 = 28 + 16 * Math.sin(t * 0.8), a2 = 105 + 22 * Math.sin(t * 0.8 + 1.2);
      var ex = 70 * Math.sin(a1 * rad), ey = -34 - 70 * Math.cos(a1 * rad);
      var wx = ex + 56 * Math.sin(a2 * rad), wy = ey - 56 * Math.cos(a2 * rad);
      upper.setAttribute('transform', 'rotate(' + a1.toFixed(2) + ' 0 -34)');
      fore.setAttribute('transform', 'translate(' + ex.toFixed(2) + ' ' + ey.toFixed(2) + ') rotate(' + a2.toFixed(2) + ')');
      elbow.setAttribute('cx', ex.toFixed(2));
      elbow.setAttribute('cy', ey.toFixed(2));
      grip.setAttribute('transform', 'translate(' + wx.toFixed(2) + ' ' + wy.toFixed(2) + ')');
    }

    var raf = 0, start = null, visible = true, resumed = false;
    function frame(now) {
      if (start === null) start = now;
      draw((now - start) / 1000, resumed);
      resumed = false;
      raf = visible ? requestAnimationFrame(frame) : 0;
    }

    draw(0, true);
    if (reduceMotion) return;
    raf = requestAnimationFrame(frame);
    if ('IntersectionObserver' in window) {           // pause while the hero is off screen
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !raf) { resumed = true; raf = requestAnimationFrame(frame); }
      }).observe(svg);
    }
  }

  /* ---------- helpers ---------- */

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Allows http(s), mailto and relative links; blocks things like javascript:
  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:)/i.test(u)) return u;
    return /^[a-z][a-z0-9+.-]*:/i.test(u) ? '' : u;
  }

  // Google Drive share links -> a direct image address (the file must be shared "Anyone with the link").
  function imageUrl(u) {
    u = safeUrl(u);
    var m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/);
    return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1600' : u;
  }

  // Tiny formatting: **bold** and [text](url). Everything else is shown as plain text.
  function md(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, url) {
        var href = safeUrl(url.replace(/&amp;/g, '&'));
        return href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + text + '</a>' : text;
      });
  }

  function link(html, url) {
    var href = safeUrl(url);
    return href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + html + '</a>' : html;
  }

  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function list(s) { return String(s || '').split(',').map(function (k) { return k.trim(); }).filter(Boolean); }

  function initials(name) {
    var parts = String(name || '').replace(/^(dr|prof)\.?\s+/i, '').trim().split(/\s+/);
    return ((parts[0] || '')[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
  }

  function hue(name) {
    var h = 0;
    for (var i = 0; i < String(name).length; i++) h = (h * 31 + String(name).charCodeAt(i)) % 360;
    return h;
  }

  function yearOf(text) {
    var m = String(text || '').match(/\b(19[5-9]\d|20\d\d)\b/);
    return m ? m[1] : '';
  }

  function linkLabel(href) {
    try {
      var host = new URL(href, location.href).hostname.replace(/^www\./, '');
      return LINK_NAMES[host] || 'View';
    } catch (e) { return 'View'; }
  }

  // Groups items by a field (or a function of the item), in the order of `known`, then any other values in order of appearance.
  function groupBy(items, field, known) {
    var groups = {}, order = Object.keys(known);
    items.forEach(function (it) {
      var key = (typeof field === 'function' ? field(it) : it[field]) || 'Other';
      if (!groups[key]) { groups[key] = []; if (order.indexOf(key) < 0) order.push(key); }
      groups[key].push(it);
    });
    return order.filter(function (k) { return groups[k]; }).map(function (k) {
      return { key: k, title: known[k] || k, items: groups[k] };
    });
  }

  // "₹60.12 L", "1.2 Cr", "45 lakh" -> amount in lakh (null if it can't be read)
  function lakhs(amount) {
    var m = String(amount || '').replace(/,/g, '').match(/([\d.]+)\s*(cr|crore|l|lakhs?|lacs?)\b/i);
    if (!m) return null;
    var n = parseFloat(m[1]);
    return /^c/i.test(m[2]) ? n * 100 : n;
  }

  function fundingTotal(grants) {
    var amounts = grants.map(function (g) { return g.amount; }).filter(Boolean);
    if (!amounts.length) return null;
    var total = 0;
    for (var i = 0; i < amounts.length; i++) {
      var v = lakhs(amounts[i]);
      if (v == null) return null;
      total += v;
    }
    return total >= 100
      ? { num: total / 100, dec: 2, unit: 'Cr' }
      : { num: total, dec: total % 1 ? 1 : 0, unit: 'L' };
  }

  function empty(msg) { return '<p class="muted">' + msg + '</p>'; }

  /* ---------- sections ---------- */

  var statsAnimated = false;
  function renderStats(data) {
    var grants = data.grants || [], pubs = data.publications || [], people = data.people || [];
    var patents = pubs.filter(function (p) { return /patent/i.test(p.category); });
    var granted = patents.filter(function (p) { return /granted/i.test(p.details); }).length;
    var fund = fundingTotal(grants);
    var stats = [
      fund ? { icon: 'funds', num: fund.num, dec: fund.dec, pre: '₹', unit: fund.unit, label: 'Research funding' }
           : { icon: 'funds', num: grants.length, label: 'Funded projects' },
      { icon: 'papers', num: pubs.length - patents.length, label: 'Recent publications' },
      { icon: 'patents', num: patents.length, label: 'Patents' + (granted ? ' · ' + granted + ' granted' : '') },
      { icon: 'people', num: people.filter(function (p) { return !isAlumni(p); }).length, label: 'Student researchers' }
    ];
    $('stats').innerHTML = stats.map(function (s) {
      var dec = s.dec || 0;
      return '<div class="stat"><span class="stat-icon">' + glyph(s.icon) + '</span><div><div class="stat-num">' + (s.pre || '') +
        '<span data-to="' + s.num + '" data-dec="' + dec + '">' + s.num.toFixed(dec) + '</span>' +
        (s.unit ? '<span class="unit">' + s.unit + '</span>' : '') + '</div>' +
        '<div class="stat-label">' + esc(s.label) + '</div></div></div>';
    }).join('');

    if (statsAnimated || reduceMotion) return;
    statsAnimated = true;
    $('stats').querySelectorAll('[data-to]').forEach(function (el) {
      var to = parseFloat(el.dataset.to), dec = +el.dataset.dec, start = null;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / 1200, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function renderNews(items) {
    var first = items[0], rest = items.slice(1), listEl = $('news-list'), more = $('news-more');
    var feature = $('news-feature');
    feature.hidden = !first;
    feature.innerHTML = first
      ? '<span class="news-latest">Latest</span>' +
        '<div class="news-feature-meta"><time>' + esc(first.date) + '</time>' + (first.tag ? '<span>' + esc(first.tag) + '</span>' : '') + '</div>' +
        '<p>' + md(first.text) + '</p>'
      : '';
    listEl.innerHTML = rest.map(function (n, i) {
      return '<li class="news-row' + (i >= NEWS_SHOWN ? ' extra' : '') + '">' +
        '<div class="news-when"><time>' + esc(n.date) + '</time>' +
        (n.tag ? '<span class="news-tag tag-' + slug(n.tag) + '">' + esc(n.tag) + '</span>' : '') + '</div>' +
        '<p>' + md(n.text) + '</p></li>';
    }).join('') || (first ? '' : '<li class="muted">No news yet.</li>');
    more.hidden = rest.length <= NEWS_SHOWN;
    more.textContent = listEl.classList.contains('show-all') ? 'Show less' : 'Show all ' + items.length + ' updates';
  }

  function renderResearch(items) {
    $('research-list').innerHTML = items.map(function (r, i) {
      var kw = list(r.keywords);
      return '<article class="feature">' +
        '<span class="feature-icon">' + glyph(researchGlyph(r.title, i)) + '</span>' +
        '<h3>' + esc(r.title) + '</h3>' +
        (r.description ? '<p>' + md(r.description) + '</p>' : '') +
        (kw.length ? '<div class="feature-tags">' + kw.map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('') + '</div>' : '') +
        '</article>';
    }).join('') || empty('Research directions will appear here.');
  }

  function renderDevices(items) {
    $('devices').hidden = !items.length;                           // section appears once a device is added
    document.querySelectorAll('a[href="#devices"]').forEach(function (a) { a.hidden = !items.length; });
    $('devices-list').innerHTML = items.map(function (d) {
      var img = imageUrl(d.image), specs = list(d.specs), a = ART[artFor(d.category, d.name)];
      var media = img
        ? '<img src="' + esc(img) + '" alt="' + esc(d.name) + '" loading="lazy">' +
          '<button class="device-zoom" type="button" data-src="' + esc(img) + '" data-caption="' + esc(d.name) + '" aria-label="View larger image of ' + esc(d.name) + '"><span class="zoom-ico">' + ICON.zoom + '</span></button>'
        : '<svg class="device-art" viewBox="' + a.box + '" aria-hidden="true">' + a.svg + '</svg>';
      return '<figure class="device">' +
        '<div class="device-media' + (img ? ' has-img' : '') + '">' + media +
        (d.category ? '<span class="device-cat">' + esc(d.category) + '</span>' : '') + '</div>' +
        '<figcaption class="device-body"><h3>' + esc(d.name) + '</h3>' +
        (d.description ? '<p>' + md(d.description) + '</p>' : '') +
        (specs.length ? '<div class="chips">' + specs.map(function (k) { return '<span class="chip">' + esc(k) + '</span>'; }).join('') + '</div>' : '') +
        '</figcaption></figure>';
    }).join('');
  }

  function isAlumni(p) { return /alum/i.test(p.group || ''); }

  // "Alumni · M.Tech", "Alumni (MTech)", "PhD alumni" -> "M.Tech" / "PhD"; plain "Alumni" -> ""
  function alumniDegree(p) {
    var rest = String(p.group || '').replace(/alum\w*/i, '').replace(/[·:()\-–—]/g, ' ').trim();
    var known = { phd: 'PhD', mtech: 'M.Tech', msc: 'M.Sc', btech: 'B.Tech' };
    return known[rest.toLowerCase().replace(/[^a-z]/g, '')] || rest;
  }

  // `degree` is set for alumni: shown on the card and used by the alumni filter.
  function personCard(p, degree) {
    var photo = imageUrl(p.photo);
    var now = /^now\b/i.test(p.note || '');                         // "Now at …" = where an alumnus is today
    var meta = [degree && degree !== 'Other' ? esc(degree) : '', esc(p.period)].filter(Boolean).join(' · ');
    return '<article class="person-card"' + (degree ? ' data-degree="' + esc(degree) + '"' : '') + '>' +
      '<div class="avatar" style="--h:' + hue(p.name) + '"><span>' + esc(initials(p.name)) + '</span>' +
      (photo ? '<img src="' + esc(photo) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.remove()">' : '') + '</div>' +
      '<h4 class="person-name">' + link(esc(p.name), p.link) + '</h4>' +
      (p.topic ? '<p class="person-topic">' + esc(p.topic) + '</p>' : '') +
      (p.note ? '<span class="' + (now ? 'now' : 'award') + '">' + (now ? ICON.work : ICON.award) + esc(p.note) + '</span>' : '') +
      (meta ? '<div class="person-meta">' + ICON.calendar + meta + '</div>' : '') +
      '</article>';
  }

  var OPEN_CARD = '<a class="person-card open" href="#join"><div class="avatar">+</div>' +
    '<h4 class="person-name">This could be you</h4>' +
    '<p class="person-topic">Open positions for motivated PhD and Master’s students.</p>' +
    '<div class="person-meta">How to join ' + ICON.arrow + '</div></a>';

  function renderPeople(items) {
    var current = groupBy(items.filter(function (p) { return !isAlumni(p); }), 'group', PEOPLE_GROUPS);
    var alumni = items.filter(isAlumni);
    var html = current.map(function (g, i) {
      return '<h3 class="group-title">' + esc(g.title) + '<span class="count">' + g.items.length + '</span></h3>' +
        '<div class="people-grid">' + g.items.map(function (p) { return personCard(p); }).join('') +
        (i === current.length - 1 ? OPEN_CARD : '') + '</div>';
    }).join('') || '<div class="people-grid" style="margin-top:28px">' + OPEN_CARD + '</div>';

    if (alumni.length) {
      // One grid, ordered PhD → M.Tech → M.Sc → B.Tech, with degree filter buttons when there is more than one degree.
      var degrees = groupBy(alumni, alumniDegree, ALUMNI_DEGREES);
      var tabs = [{ key: 'All', title: 'All', n: alumni.length }].concat(degrees.map(function (d) {
        return { key: d.title, title: d.title, n: d.items.length };
      }));
      html += '<h3 class="group-title">Alumni<span class="count">' + alumni.length + '</span></h3>' +
        (degrees.length > 1 ? '<div class="people-filters" id="alumni-filters" role="tablist" aria-label="Filter alumni by degree">' +
          tabs.map(function (t) {
            return '<button type="button" class="filter" role="tab" aria-selected="false" data-degree="' + esc(t.key) + '">' +
              esc(t.title) + '<span class="n">' + t.n + '</span></button>';
          }).join('') + '</div>' : '') +
        '<div class="people-grid" id="alumni-list">' + degrees.map(function (d) {
          return d.items.map(function (p) { return personCard(p, d.title); }).join('');
        }).join('') + '</div>';
    }
    $('people-list').innerHTML = html;
    filterAlumni(degrees && degrees.length > 1 && tabs.some(function (t) { return t.key === alumniFilter; }) ? alumniFilter : 'All');
  }

  var alumniFilter = 'All';
  function filterAlumni(degree) {
    alumniFilter = degree;
    document.querySelectorAll('#alumni-filters .filter').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-degree') === degree));
    });
    document.querySelectorAll('#alumni-list .person-card').forEach(function (c) {
      c.hidden = degree !== 'All' && c.getAttribute('data-degree') !== degree;
    });
  }

  var pubFilter = 'All', pubItems = [];
  function renderPublications(items) {
    pubItems = items;
    var groups = groupBy(items, 'category', PUB_GROUPS);
    if (pubFilter !== 'All' && !groups.some(function (g) { return g.key === pubFilter; })) pubFilter = 'All';

    var tabs = [{ key: 'All', title: 'All', n: items.length }].concat(groups.map(function (g) {
      return { key: g.key, title: g.title, n: g.items.length };
    }));
    $('pub-filters').innerHTML = items.length ? tabs.map(function (t) {
      return '<button type="button" class="filter" role="tab" aria-selected="' + (t.key === pubFilter) + '" data-cat="' + esc(t.key) + '">' +
        esc(t.title) + '<span class="n">' + t.n + '</span></button>';
    }).join('') : '';

    var me = CFG.highlightAuthor ? esc(CFG.highlightAuthor) : '';
    var shown = [];
    groups.forEach(function (g) { if (pubFilter === 'All' || pubFilter === g.key) shown = shown.concat(g.items); });

    var more = $('pub-more'), listEl = $('publications-list');
    more.hidden = shown.length <= PUBS_SHOWN;
    more.textContent = listEl.classList.contains('show-all') ? 'Show fewer' : 'Show all ' + shown.length + ' ' + (pubFilter === 'All' ? 'publications' : PUB_GROUPS[pubFilter] ? PUB_GROUPS[pubFilter].toLowerCase() : 'items');

    listEl.innerHTML = shown.map(function (p, i) {
      var authors = md(p.authors);
      if (me) authors = authors.split(me).join('<strong>' + me + '</strong>');
      var where = [p.venue ? '<em>' + esc(p.venue) + '</em>' : '', esc(p.details)].filter(Boolean).join(' · ');
      var year = yearOf(p.venue + ' ' + p.details);
      var href = safeUrl(p.link);
      var cat = p.category || 'Other';
      return '<li class="pub' + (i >= PUBS_SHOWN ? ' extra' : '') + '">' +
        '<div class="pub-side">' + (year ? '<span class="pub-year">' + year + '</span>' : '') +
        '<span class="pub-cat cat-' + slug(cat) + '">' + esc(cat) + '</span></div>' +
        '<div class="pub-body"><h3 class="pub-title">' + esc(p.title) + '</h3>' +
        (authors ? '<p class="pub-authors">' + authors + '</p>' : '') +
        (where ? '<p class="pub-venue">' + where + '</p>' : '') + '</div>' +
        (href ? '<a class="btn btn-outline btn-sm pub-link" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(linkLabel(href)) + ICON.external + '</a>' : '<span></span>') +
        '</li>';
    }).join('') || '<li class="pub muted">Publications will appear here.</li>';
  }

  var MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  // "Jun 2025 – Jun 2028" -> { status, pct, note } (null if the dates can't be read)
  function projectStatus(duration) {
    var m = String(duration || '').match(/([a-z]{3})[a-z]*\.?\s*(\d{4})\s*[–—-]+\s*([a-z]{3})[a-z]*\.?\s*(\d{4})/i);
    if (!m || MONTHS[m[1].toLowerCase()] == null || MONTHS[m[3].toLowerCase()] == null) return null;
    var start = new Date(+m[2], MONTHS[m[1].toLowerCase()], 1), end = new Date(+m[4], MONTHS[m[3].toLowerCase()] + 1, 0);
    var now = new Date();
    if (end <= start) return null;
    if (now < start) return { status: 'upcoming', label: 'Starts ' + m[1] + ' ' + m[2], pct: 0 };
    if (now > end) return { status: 'done', label: 'Completed', pct: 100 };
    var months = Math.max(1, Math.round((end - now) / 2629800000));
    return { status: 'ongoing', label: 'Ongoing · ' + months + (months === 1 ? ' month' : ' months') + ' left', pct: Math.round((now - start) / (end - start) * 100) };
  }

  function renderGrants(items) {
    var fund = fundingTotal(items);
    $('funding-total').innerHTML = fund
      ? '<div class="funding-banner"><div><div class="funding-amount">₹' + fund.num.toFixed(fund.dec) + '<small>' + fund.unit + '</small></div>' +
        '<div class="funding-label">Total research funding</div></div>' +
        '<p class="funding-text">Secured across ' + items.length + ' research project' + (items.length === 1 ? '' : 's') +
        ' from national agencies and institutional schemes, supporting students, hardware, and an IoT testbed.</p></div>'
      : '';

    function progress(st) {
      if (!st) return '';
      return '<div class="grant-progress gp-' + st.status + '"><div class="gp-head"><span>' + esc(st.label) + '</span>' +
        (st.status === 'ongoing' ? '<span>' + st.pct + '%</span>' : '') + '</div>' +
        '<div class="gp-bar"><span style="width:' + st.pct + '%"></span></div></div>';
    }
    $('grants-list').innerHTML = items.map(function (g) {
      var rows = [[ICON.building, g.sponsor], [ICON.scheme, g.scheme], [ICON.calendar, g.duration]].filter(function (r) { return r[1]; });
      return '<article class="grant">' +
        '<div class="grant-top">' + (g.amount ? '<span class="grant-amount">' + esc(g.amount) + '</span>' : '<span></span>') +
        (g.role ? '<span class="role">' + esc(g.role) + '</span>' : '') + '</div>' +
        '<h3>' + esc(g.title) + '</h3>' +
        (rows.length ? '<div class="grant-meta">' + rows.map(function (r) { return '<div>' + r[0] + '<span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>' : '') +
        progress(projectStatus(g.duration)) +
        '</article>';
    }).join('') || empty('Grants will appear here.');
  }

  // What the website shows. Once the Google Sheet is set up it is followed exactly. Until then (a tab is
  // missing, or the Sheet holds none of the built-in content), the built-in content from assets/data.js is
  // shown, with anything already added to the Sheet first, so connecting a new Sheet never empties the site.
  var SECTION_KEYS = ['news', 'research', 'devices', 'people', 'publications', 'grants'];
  var MAIN_FIELD = { news: 'text', research: 'title', devices: 'name', people: 'name', publications: 'title', grants: 'title' };
  function itemKey(k, it) { return String((it && it[MAIN_FIELD[k]]) || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }

  function sheetIsSetUp(data, builtIn) {
    var overlap = 0, total = 0;
    for (var i = 0; i < SECTION_KEYS.length; i++) {
      var k = SECTION_KEYS[i];
      if (!Array.isArray(data[k])) return false;
      var have = {};
      data[k].forEach(function (it) { have[itemKey(k, it)] = true; });
      (builtIn[k] || []).forEach(function (it) { total++; if (have[itemKey(k, it)]) overlap++; });
    }
    return total === 0 || overlap > 0;
  }

  function contentFrom(data) {
    var builtIn = window.SITE_DATA || {}, out = {};
    var setUp = data === builtIn || sheetIsSetUp(data, builtIn);
    SECTION_KEYS.forEach(function (k) {
      var live = Array.isArray(data[k]) ? data[k] : [], base = builtIn[k] || [];
      if (setUp) { out[k] = live; return; }
      var have = {};
      live.forEach(function (it) { have[itemKey(k, it)] = true; });
      out[k] = live.concat(base.filter(function (it) { return !have[itemKey(k, it)]; }));
    });
    return out;
  }

  function renderAll(data) {
    if (!data) return;
    var c = contentFrom(data);
    renderStats(c);
    renderNews(c.news);
    renderResearch(c.research);
    renderDevices(c.devices);
    renderPeople(c.people);
    renderPublications(c.publications);
    renderGrants(c.grants);
  }

  /* ---------- interactions ---------- */

  buildHeroScene();
  document.querySelectorAll('[data-glyph]').forEach(function (el) { el.innerHTML = glyph(el.getAttribute('data-glyph')); });
  $('year').textContent = new Date().getFullYear();

  $('news-more').addEventListener('click', function () {
    var listEl = $('news-list');
    listEl.classList.toggle('show-all');
    this.textContent = listEl.classList.contains('show-all') ? 'Show less' : 'Show all ' + (listEl.children.length + 1) + ' updates';
  });

  $('pub-more').addEventListener('click', function () {
    $('publications-list').classList.toggle('show-all');
    renderPublications(pubItems);
  });

  $('pub-filters').addEventListener('click', function (e) {
    var btn = e.target.closest('.filter');
    if (!btn) return;
    pubFilter = btn.getAttribute('data-cat');
    renderPublications(pubItems);
  });

  $('people-list').addEventListener('click', function (e) {
    var btn = e.target.closest('#alumni-filters .filter');
    if (btn) filterAlumni(btn.getAttribute('data-degree'));
  });

  // image viewer for device figures
  var lightbox = $('lightbox'), lastFocus = null;
  function openLightbox(src, caption) {
    lastFocus = document.activeElement;
    $('lightbox-img').src = src;
    $('lightbox-img').alt = caption;
    $('lightbox-caption').textContent = caption;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('lightbox-close').focus();
  }
  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $('devices-list').addEventListener('click', function (e) {
    var btn = e.target.closest('.device-zoom');
    if (btn) openLightbox(btn.getAttribute('data-src'), btn.getAttribute('data-caption'));
  });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox || e.target.closest('#lightbox-close')) closeLightbox(); });

  // navigation: background on scroll, mobile menu, current-section highlight
  var nav = $('nav'), menuBtn = $('menu-btn');
  var navLinks = [].slice.call(document.querySelectorAll('#nav-links a:not(.btn)'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var ticking = false;
  function onScroll() {
    ticking = false;
    nav.classList.toggle('scrolled', window.scrollY > 24);
    // highlight the section that crosses the upper part of the screen
    var line = window.innerHeight * 0.35, current = -1;
    sections.forEach(function (s, i) { if (s && !s.hidden && s.getBoundingClientRect().top <= line) current = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  onScroll();
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  function setMenu(open) {
    nav.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('menu-open')); });
  $('nav-links').addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeLightbox(); } });

  // replay the footer logo's animation the first time the footer scrolls into view
  var footerLogo = $('footer-logo');
  if (footerLogo && 'IntersectionObserver' in window && !reduceMotion) {
    var replay = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      replay.disconnect();
      footerLogo.src = footerLogo.getAttribute('src').split('?')[0] + '?play=' + Date.now();
    }, { threshold: 0.6 });
    replay.observe(footerLogo);
  }

  if ('IntersectionObserver' in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { reveal.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- load content ---------- */

  function isSiteData(d) { return !!d && typeof d === 'object' && !Array.isArray(d) && d.ok !== false && !d.error; }

  if (!CFG.scriptUrl) {
    renderAll(window.SITE_DATA);          // no Google Script yet: use assets/data.js
    return;
  }

  // Show the last copy this browser saw straight away, then refresh from the Google Sheet.
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch (e) {}
  if (isSiteData(cached)) renderAll(cached); else cached = null;

  var controller = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (controller) controller.abort(); }, 15000);

  fetch(CFG.scriptUrl, controller ? { signal: controller.signal } : {})
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (!isSiteData(data)) throw new Error((data && data.error) || 'Unexpected response');
      renderAll(data);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
    })
    .catch(function (err) {
      console.warn('Could not load live content, showing built-in copy.', err);
      if (!cached) renderAll(window.SITE_DATA);
    })
    .then(function () { clearTimeout(timer); });
})();
