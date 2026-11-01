'use strict';
/* Home, Visual skills, and the Snap to know camera (new: viewfinder, detection, analyzing). */

const skAvatar = (s) => `<button class="sk ${s.fresh ? 'fresh' : ''}" data-act="openCamera" data-mode="${s.id}"><span class="sk-av"><img src="${IMG(s.img)}" style="object-position:${s.pos}" alt=""></span><span class="sk-l">${esc(s.name)}</span></button>`;
/* Figma "Oct 30 Home Screen Redesign + Community Tab": floating tab bar, left to right Home, Camera, Community, Profile. */
const TAB_IC = (n) => `<span class="ic24"><img src="img/${n}.svg" alt=""></span>`;
const tabbar = (on) => `<nav class="tabbar" aria-label="Tabs">
  <button class="tab ${on === 'home' ? 'on' : ''}" data-act="tabHome" aria-label="Home"${on === 'home' ? ' aria-current="page"' : ''}>${TAB_IC(on === 'home' ? 'tab-home-on' : 'tab-home')}</button>
  <button class="tab" data-act="openCamera" data-mode="snap" aria-label="Camera">${TAB_IC('tab-camera')}</button>
  <button class="tab ${on === 'community' ? 'on' : ''}" data-act="tabCommunity" aria-label="Community"${on === 'community' ? ' aria-current="page"' : ''}>${TAB_IC(on === 'community' ? 'tab-community-on' : 'tab-community')}</button>
  <button class="tab" data-act="tabProfile" aria-label="Profile">${TAB_IC('tab-profile')}</button></nav>`;
const logoHdr = () => `<div class="pad-top"></div><header class="hdr"><span class="logo-c" role="img" aria-label="Chance AI">C</span></header>`;
const likesRow = (n, sz = 12) => `<span class="likes"><span class="hz hz${sz}"><img src="img/icon-heart-${sz}.svg" alt=""></span>${esc(n)}<span class="vh"> likes</span></span>`;

function homeRecents() {
  const made = S.skills.map((s) => ({ name: s.name, thumb: IMG(s.img), when: s.fresh ? 'Just made' : 'Your skill', act: `data-act="openCamera" data-mode="${s.id}"`, fresh: s.fresh }));
  const usual = D.HOME_RECENTS.map((r) => ({ name: D.SHOWCASE[r.sk].name, thumb: IMG(r.thumb), when: r.when, act: `data-act="trySkill" data-sk="${r.sk}"` }));
  const seen = new Set();
  return [...made, ...usual].filter((r) => !seen.has(r.name) && seen.add(r.name)).slice(0, 2);
}
const rankCard = (t, i) => `<button class="rcard" data-act="trySkill" data-sk="${t.sk}">
  <span class="rcard-img"><img src="${IMG(t.img)}" alt=""><span class="rank">#${i + 1}</span></span>
  <span class="rcard-meta"><img class="av" src="${t.av}" width="30" height="30" alt=""><span class="rcard-tx"><span class="rcard-n">${esc(D.SHOWCASE[t.sk].name)}</span>${likesRow(t.likes)}</span></span></button>`;

SCREENS.home = {
  title: 'Home',
  render() {
    const shot = D.HOME_RECENT_SHOT;
    return `${SB('solid')}<div class="body">${logoHdr()}
      <div class="home-main">
        <div class="recents">
          <button class="rshot" data-act="trySkill" data-sk="${shot.sk}" data-auto="1" aria-label="Recent shot: open its ${esc(D.SHOWCASE[shot.sk].name)} result"><img src="${IMG(shot.img)}" alt=""><span class="tagpill">Recent shot</span></button>
          <div class="rskills">${homeRecents().map((r) => `<button class="rskill ${r.fresh ? 'fresh' : ''}" ${r.act}>
            <span class="rskill-top"><img src="${r.thumb}" alt=""><span class="rskill-k">Recent skill</span></span>
            <span class="rskill-tx"><span class="rskill-n">${esc(r.name)}</span><span class="rskill-s">${esc(r.when)}</span></span></button>`).join('')}</div>
        </div>
        <div class="actions">
          <button class="abtn dark" data-act="openCamera" data-mode="snap"><span class="abtn-ic"><span class="ic20"><img src="img/icon-camera-white.svg" alt=""></span></span>Snap to Know</button>
          <button class="abtn blue" data-act="startCreate"><span class="abtn-ic"><span class="ic20"><img src="img/icon-plus-white.svg" alt=""></span></span>Create visual skill</button>
        </div>
        <section class="top4">
          <h2 class="top4-h">Top 4 skills for college students</h2>
          <div class="rank-grid">${D.TOP_SKILLS.map(rankCard).join('')}</div>
        </section>
      </div>
    </div>${tabbar('home')}`;
  },
  mount() {
    S.skills.forEach((s) => { s.fresh = false; });
  },
};

const gCard = (c) => `<button class="gcard" style="height:${c.h}px" data-act="trySkill" data-sk="${c.sk}" aria-label="@${esc(c.user)} made this with ${esc(D.SHOWCASE[c.sk].name)}. Try the skill.">
  <img class="gimg" src="${IMG(c.img)}" alt="">
  <span class="creator"><span class="ava" style="background:${c.color}">${esc(c.init)}</span>@${esc(c.user)}</span>
  <span class="used"><img class="th" src="${IMG(c.thumb)}" alt=""><span class="used-tx"><span class="used-n">${esc(D.SHOWCASE[c.sk].name)}</span>${likesRow(String(c.likes), 11)}</span></span></button>`;
function communityCols(f) {
  if (f === 'For you') return [0, 1].map((k) => D.COMMUNITY.filter((c) => c.col === k));
  let list = D.COMMUNITY.filter((c) => f === 'Trending' || c.tags.includes(f));
  if (f === 'Trending') list = [...list].sort((a, b) => b.likes - a.likes);
  const cols = [[], []], h = [0, 0];
  list.forEach((c) => { const k = h[0] <= h[1] ? 0 : 1; cols[k].push(c); h[k] += c.h + 12; });
  return cols;
}

SCREENS.community = {
  title: 'Community',
  render(d) {
    const f = d.filter || 'For you';
    const cols = communityCols(f);
    return `${SB('solid')}<div class="body">${logoHdr()}
      <div class="comm-main">
        <div class="comm-title"><h1>Community</h1><p>A gallery of what people are making with visual skills.</p></div>
        <div class="cchips" role="group" aria-label="Filter">${D.COMMUNITY_FILTERS.map((x) => `<button class="cchip ${x === f ? 'on' : ''}" data-act="commFilter" data-v="${x}" aria-pressed="${x === f}">${x}</button>`).join('')}</div>
        ${cols[0].length + cols[1].length ? `<div class="masonry">${cols.map((col) => `<div class="mcol">${col.map(gCard).join('')}</div>`).join('')}</div>` : '<p class="empty-note">Nothing here yet.</p>'}
      </div>
    </div>${tabbar('community')}`;
  },
  mount(el) {
    const on = $('.cchip.on', el), row = $('.cchips', el);
    if (on && row) row.scrollLeft = Math.max(0, on.offsetLeft - 20);
  },
};

const tagFor = (s) => ({ Fashion: 'Style', Sneakers: 'Style', Food: 'Food', Coffee: 'Food', Interiors: 'Design', Design: 'Design', Art: 'Design' }[s.cat] || 'Just for fun');
const vsCard = (c) => `<div class="scard"><div class="ph"><img src="${IMG(c.img)}" alt=""></div>${c.pro ? '<span class="protag">Pro</span>' : ''}${c.fresh ? '<span class="newtag">New</span>' : ''}
  <span class="sicon">${ic(c.icon)}</span><div class="tx"><span class="nm">${esc(c.name)}</span><span class="ds">${esc(c.desc)}</span></div>
  <div class="act"><button class="pill-dark" data-act="openCamera" data-mode="${c.id}">${ic('camera')}Try it</button></div></div>`;
const vsRow = (c) => `<div class="srow"><div class="srow-ph"><img src="${IMG(c.img)}" alt=""><span class="mini">${ic(c.icon)}</span></div>
  <div class="srow-tx"><span class="nm">${esc(c.name)}</span><span class="ds">${esc(c.desc)}</span></div>
  <button class="pill-line" data-act="openCamera" data-mode="${c.id}">${ic('camera')}Try it</button></div>`;

SCREENS.skills = {
  title: 'Visual skills',
  render(d) {
    const f = d.filter || 'All';
    const mine = S.skills.map((s) => ({ id: s.id, name: s.name, desc: s.short, img: s.img, icon: s.icon, tag: tagFor(s), fresh: true }));
    const cards = [...mine, ...D.CATALOG].filter((c) => f === 'All' || c.tag === f);
    const more = D.MORE_SKILLS.filter((c) => f === 'All' || c.tag === f);
    return `${SB('solid')}<div class="body"><div class="pad-top"></div>
      <div class="nav"><button class="ib" data-back aria-label="Back">${ic('chevL')}</button><button class="ib" aria-label="Search skills">${ic('search')}</button></div>
      <div class="title" style="padding:14px 20px 18px; gap:4px"><h1 class="h1">Visual skills</h1><p class="sub">Snap something. Get something back.</p></div>
      <div class="vs-chips">${['All', 'Style', 'Food', 'Design', 'Just for fun'].map((x) => `<button class="chip ${x === f ? 'on' : ''}" data-act="skillsFilter" data-v="${x}">${x}</button>`).join('')}</div>
      <div class="vs-grid">${cards.map(vsCard).join('') || (more.length ? '' : '<p class="empty-note">No skills in this group yet.</p>')}</div>
      ${more.length ? `<div class="vs-more"><h2 class="h3">More skills</h2>${more.map(vsRow).join('')}</div>` : '<div style="height:130px"></div>'}
    </div>${tabbar('home')}`;
  },
};

/* ---------- camera ---------- */
function hintFor(m) {
  if (m.kind === 'rating') {
    if (m.result === 'plate') return 'Fit the whole bowl in the frame, then tap.';
    if (m.result === 'room') return 'Frame a corner of your room, then tap.';
    if (m.result === 'wardrobe' || m.result === 'ootd') return 'Frame the whole outfit, then tap.';
    return 'Center your subject, then tap.';
  }
  if (m.kind === 'tarot') return 'Snap anything to draw today’s card.';
  if (m.kind === 'dot') return 'Snap anything to turn it into dot art.';
  if (m.kind === 'palette') return 'Fill the frame with color, then tap.';
  return 'Point at anything, then tap to know more.';
}
const gallerySheet = () => `<div class="grab"></div>
  <div class="gs-h"><h2 class="h3">Recent photos</h2><button class="link" data-act="closeGallery">Cancel</button></div>
  <p class="gs-sub">Pick a photo to run it through the current skill.</p>
  <div class="gs-grid">
    <label class="gs-up" data-file-label hidden><input type="file" accept="image/*" data-file="snapUpload" hidden>${ic('image')}<span>Your own photo<br><small>Read live by Claude</small></span></label>
    ${D.GALLERY.map((k) => `<button class="gs-ph" data-act="pickPhoto" data-k="${k}"><img src="${IMG(D.SCENES[k].img)}" alt="${esc(D.SCENES[k].label)}"></button>`).join('')}
  </div>`;

SCREENS.camera = {
  title: 'Camera',
  cls: 'cam dark',
  render(d) {
    const m = modeById(d.mode || 'snap');
    const sc = sceneObj(d.scene || m.scene);
    return `<div class="vf" data-act="focus"><div class="zoomer"><div class="drift">
        <img class="scene" src="${sc.src}" alt="Camera view">
        <div class="bx"><i></i><i></i><i></i><i></i><div class="bx-clip"><div class="scanline"></div></div><span class="det"><span class="pulse"></span><span class="det-t">${esc(sc.label)}</span></span></div>
      </div></div></div>
      <div class="flash"></div>
      ${SB('light')}
      <div class="cam-top"><button class="gbtn" data-act="closeCam" aria-label="Close camera">${ic('x')}</button>
        <span class="cam-skill">${ic(m.icon)}<span>${esc(m.name)}</span></span>
        <button class="gbtn" data-act="flash" aria-label="Flash" aria-pressed="false">${ic('zap')}</button></div>
      <p class="cam-hint">${esc(hintFor(m))}</p>
      <div class="zoom"><button class="on" data-act="zoom" data-z="1">1×</button><button data-act="zoom" data-z="2">2</button></div>
      <div class="cam-bot">
        <div class="modes" role="tablist" aria-label="Skills">${modes().map((x) => `<button class="mode ${x.id === m.id ? 'on' : ''}" data-act="mode" data-m="${x.id}" role="tab" aria-selected="${x.id === m.id}">${esc(x.label)}</button>`).join('')}</div>
        <div class="ctrl"><button class="gal" data-act="gallery" aria-label="Choose a photo"><img src="${IMG('coffee')}" alt=""></button>
          <button class="shutter" data-act="shutter" aria-label="Take photo"><span>${ic('target')}</span></button>
          <button class="flip" data-act="flip" aria-label="Flip camera">${ic('flip')}</button></div>
      </div>
      <div class="an-card" aria-live="polite"><span class="an-ic">${ic(m.icon)}</span><div class="an-tx"><b class="an-t">Looking closely…</b><span class="an-s">${esc(m.name)}</span></div><span class="an-spin"></span><i class="an-bar"></i></div>
      <div class="scrim" data-act="closeGallery"></div>
      <div class="gsheet" role="dialog" aria-label="Recent photos">${gallerySheet()}</div>`;
  },
  mount(el, d) {
    el._timers = [];
    el._mode = modeById(d.mode || 'snap').id;
    el._scene = sceneObj(d.scene || modeById(el._mode).scene);
    S.snap.mode = el._mode;
    requestAnimationFrame(() => centerMode(el, false));
    const img = $('.scene', el);
    const ready = () => {
      placeBox(el, false);
      if (d.auto) later(el, () => runCapture(el, { quiet: true }), 420);
      else detectSoon(el);
    };
    if (img.complete && img.naturalWidth) requestAnimationFrame(ready);
    else img.addEventListener('load', ready, { once: true });
    if (d.gallery) later(el, () => openGallery(el), 560);
    const vf = $('.vf', el);
    let sx = null;
    vf.addEventListener('pointerdown', (e) => { sx = e.clientX; el._swiped = false; });
    vf.addEventListener('pointerup', (e) => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) < 50 || el._busy) return;
      el._swiped = true;
      const ms = modes();
      const i = ms.findIndex((x) => x.id === el._mode);
      const n = ms[Math.max(0, Math.min(ms.length - 1, i + (dx < 0 ? 1 : -1)))];
      if (n) setMode(el, n.id);
    });
  },
  leave(el) { el._dead = true; clearTimeout(el._dt); (el._timers || []).forEach(clearTimeout); },
};

function later(el, fn, ms) { const t = setTimeout(() => { if (!el._dead) fn(); }, ms); el._timers.push(t); return t; }
function detectSoon(el) { clearTimeout(el._dt); el._dt = setTimeout(() => { if (!el._dead && !el._busy) placeBox(el, true); }, 800); }
function centerMode(el, smooth) {
  const row = $('.modes', el), on = row && $('.mode.on', row);
  if (on) row.scrollTo({ left: on.offsetLeft - row.clientWidth / 2 + on.offsetWidth / 2, behavior: smooth && !RM ? 'smooth' : 'auto' });
}
function placeBox(el, on) {
  const img = $$('.scene', el).pop(), bx = $('.bx', el), drift = $('.drift', el);
  if (!img || !bx || !drift) return;
  const dw = drift.clientWidth, dh = drift.clientHeight, vh = el.clientHeight;
  const off = (dh - vh) / 2;
  let x, y, w, h;
  if (on) {
    const nw = img.naturalWidth || 1, nh = img.naturalHeight || 1;
    const k = Math.max(dw / nw, dh / nh), rw = nw * k, rh = nh * k;
    const b = el._scene.box;
    x = b[0] * rw - (rw - dw) / 2; y = b[1] * rh - (rh - dh) / 2; w = b[2] * rw; h = b[3] * rh;
    const x2 = Math.min(dw - 16, x + w), y2 = Math.min(off + vh - 286, y + h);
    x = Math.max(16, x); y = Math.max(off + 104, y);
    w = Math.max(90, x2 - x); h = Math.max(90, y2 - y);
  } else { x = dw * 0.14; y = off + vh * 0.2; w = dw * 0.72; h = vh * 0.44; }
  Object.assign(bx.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  bx.classList.toggle('on', on);
}
function swapScene(el, instant) {
  return new Promise((resolve) => {
    const old = $$('.scene', el).pop();
    $('.bx', el).classList.remove('on');
    clearTimeout(el._dt);
    $('.det-t', el).textContent = el._scene.label;
    const nx = document.createElement('img');
    nx.className = 'scene';
    nx.alt = 'Camera view';
    const done = () => {
      $$('.scene', el).filter((s) => s !== nx).forEach((s) => (instant || RM ? s.remove() : setTimeout(() => s.remove(), 450)));
      if (!instant && !RM) nx.animate([{ opacity: 0, filter: 'blur(14px)', transform: 'scale(1.05)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 440, easing: 'ease-out' });
      placeBox(el, false);
      if (!instant) detectSoon(el);
      resolve();
    };
    nx.addEventListener('load', done, { once: true });
    nx.addEventListener('error', () => resolve(), { once: true });
    old.after(nx);
    nx.src = el._scene.src;
  });
}
function setMode(el, id) {
  if (el._busy || id === el._mode) return;
  el._mode = id;
  S.snap.mode = id;
  const m = modeById(id);
  el._scene = sceneObj(m.scene);
  $$('.mode', el).forEach((b) => { const on = b.dataset.m === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
  centerMode(el, true);
  $('.cam-hint', el).textContent = hintFor(m);
  $('.cam-skill', el).innerHTML = `${ic(m.icon)}<span>${esc(m.name)}</span>`;
  $('.an-ic', el).innerHTML = ic(m.icon);
  $('.an-s', el).textContent = m.name;
  swapScene(el, false);
}
function openGallery(el) {
  if (el._busy) return;
  const m = modeById(el._mode);
  const local = ['dot', 'palette', 'tarot'].includes(m.kind);
  const up = $('.gs-up', el);
  up.hidden = !(AI_IMG || local);
  $('small', up).textContent = local ? 'Stays on this device' : 'Read live by Claude';
  $('.scrim', el).classList.add('on');
  $('.gsheet', el).classList.add('on');
}
function closeGallery(el) { $('.scrim', el)?.classList.remove('on'); $('.gsheet', el)?.classList.remove('on'); }
async function useScene(el, scene) {
  if (el._busy) return;
  el._scene = scene;
  closeGallery(el);
  await swapScene(el, true);
  runCapture(el, { quiet: true });
}

/* capture → analyzing → result */
function resolveResult(m, sc) {
  if (m.kind === 'dot') return { type: 'dot' };
  if (m.kind === 'tarot') return { type: 'tarot' };
  if (m.kind === 'palette') return { type: 'palette' };
  if (sc.upload) return { type: m.kind === 'rating' ? 'ai-rating' : 'ai-learn' };
  const S0 = D.SCENES[sc.key] || {};
  if (m.kind === 'rating') {
    if (m.scene === sc.key && D.RATING[m.result]) return { type: 'rating', key: m.result };
    if (S0.rating) return { type: 'rating', key: S0.rating };
    if (AI_IMG) return { type: 'ai-rating' };
    if (m.scene === sc.key) return { type: 'rating', key: '' };
  }
  if (S0.learn) return { type: 'learn', key: S0.learn };
  if (S0.rating) return { type: 'rating', key: S0.rating };
  if (AI_IMG) return { type: 'ai-learn' };
  return { type: 'tarot' };
}
function messagesFor(r, sc) {
  if (r.type === 'learn') {
    if (sc.key === 'bottle') return ['Looking closely…', 'Reading the logo', 'Matching 1,200+ bottles', 'Exact match found'];
    return ['Looking closely…', 'Finding the main object', 'Checking design details', D.LEARN[r.key]?.match === 'Exact match' ? 'Exact match found' : 'Close match found'];
  }
  if (r.type === 'rating' || r.type === 'ai-rating') return ['Looking closely…', 'Spotting each piece', 'Scoring what works', 'Your rating is ready'];
  if (r.type === 'tarot') return ['Shuffling the deck…', 'Reading your photo', 'Drawing a card', 'Your card is ready'];
  if (r.type === 'dot') return ['Sampling colors…', 'Placing dots', 'Smoothing edges', 'Dot art ready'];
  if (r.type === 'palette') return ['Reading colors…', 'Grouping shades', 'Finding pairings', 'Palette ready'];
  return ['Looking closely…', 'Working out what this is', 'Writing your card', 'Ready'];
}
async function jobFor(r, m, sc) {
  if (r.type === 'ai-learn') return aiLearn(sc.blob || (await srcBlob(sc.src)));
  if (r.type === 'ai-rating') return aiRating(sc.blob || (await srcBlob(sc.src)), m);
  if (r.type === 'palette') return extractPalette(sc.src);
  if (r.type === 'dot') { await loadImg(sc.src); return null; }
  return null;
}
function sprinkle(el) {
  const bx = $('.bx', el);
  for (let k = 0; k < 7; k++) {
    const p = document.createElement('span');
    p.className = 'pt';
    p.style.left = `${18 + Math.random() * 64}%`;
    p.style.top = `${14 + Math.random() * 72}%`;
    p.style.animationDelay = `${200 + k * 230}ms`;
    bx.appendChild(p);
  }
}
function uncapture(el) {
  el.classList.remove('captured');
  $('.an-card', el).classList.remove('done');
  $('.an-bar', el).style.width = '0';
  $$('.pt', el).forEach((p) => p.remove());
  el._busy = false;
  window.onRoute?.(cur());
  detectSoon(el);
}
async function runCapture(el, { quiet = false } = {}) {
  if (el._busy) return;
  el._busy = true;
  clearTimeout(el._dt);
  closeGallery(el);
  const m = modeById(el._mode), sc = el._scene;
  if (!RM) {
    if (quiet) $('.zoomer', el).animate([{ transform: 'scale(1.08)', filter: 'brightness(1.3)' }, { transform: 'none', filter: 'none' }], { duration: 420, easing: EASE });
    else $('.flash', el).animate([{ opacity: 0 }, { opacity: el._flash ? 1 : 0.85 }, { opacity: 0 }], { duration: 380, easing: 'ease-out' });
  }
  placeBox(el, true);
  el.classList.add('captured');
  window.onRoute?.(cur());
  sprinkle(el);
  const route = resolveResult(m, sc);
  const msgs = messagesFor(route, sc);
  const t0 = Date.now();
  const tEl = $('.an-t', el), bar = $('.an-bar', el);
  const say = (s) => { tEl.textContent = s; tEl.style.animation = 'none'; void tEl.offsetWidth; tEl.style.animation = ''; };
  let i = 0;
  say(msgs[0]);
  bar.style.width = '8%';
  const tick = setInterval(() => { if (i < msgs.length - 2) { i++; say(msgs[i]); bar.style.width = `${Math.min(86, 10 + i * 30)}%`; } }, 720);
  let data = null;
  try { data = await jobFor(route, m, sc); } catch (e) {
    clearInterval(tick);
    if (el._dead) return;
    toast(aiErr(e), 3200);
    uncapture(el);
    return;
  }
  const left = 2350 - (Date.now() - t0);
  if (left > 0) await wait(left);
  clearInterval(tick);
  if (el._dead) return;
  say(msgs[msgs.length - 1]);
  $('.an-card', el).classList.add('done');
  bar.style.width = '100%';
  await wait(560);
  if (el._dead) return;
  showResult(route, m, sc, data);
}
function ratingFor(m, key) {
  const base = D.RATING[key] || {
    eyebrow: 'Your photo', score: 8.0, verdict: 'Strong start', summary: `${m.name} looked at the main subject in your photo.`,
    bars: [['Overall', 8], ['Detail', 7], ['Light', 8]], tips: ['Get a little closer so the details come through.', 'Shoot near a window for truer colors.', 'Snap a second angle to compare.'],
  };
  const ch = new Set((m.skill?.changes || []).map((c) => c.k));
  const bars = base.bars.map(([l, v]) => ({ l, v }));
  if (ch.has('shoes') && base.extra?.shoes) bars.push({ l: base.extra.shoes[0], v: base.extra.shoes[1], fresh: true });
  if (ch.has('acc') && base.extra?.acc) bars.push({ l: base.extra.acc[0], v: base.extra.acc[1], fresh: true });
  const tips = (ch.has('short') && base.short ? base.short : base.tips).map((t) => ({ t }));
  if (ch.has('casual') && base.casual) tips.unshift({ t: base.casual, fresh: true });
  if (ch.has('shoes') && base.shoeTip) tips.push({ t: base.shoeTip, fresh: true });
  if (ch.has('acc') && base.accTip) tips.push({ t: base.accTip, fresh: true });
  if (ch.has('season') && base.season) tips.push({ t: base.season, fresh: true });
  return { ...base, bars, tips };
}
function showResult(r, m, sc, data) {
  const common = { mode: m.id, src: sc.src, pos: sc.pos };
  if (r.type === 'learn' || r.type === 'ai-learn') {
    const L = r.type === 'learn' ? D.LEARN[r.key] : data;
    const eyebrow = m.kind === 'learn' && m.id !== 'snap' ? m.name : L.eyebrow;
    S.snap = { mode: m.id, photo: sc.src, pos: sc.pos, learn: { ...L, eyebrow, thumb: L.thumb ? IMG(L.thumb) : sc.src }, convo: [] };
    go('learn', { anim: 'fade', replace: true });
  } else if (r.type === 'rating' || r.type === 'ai-rating') {
    const R = r.type === 'rating' ? ratingFor(m, r.key) : { ...data, bars: data.bars.map(([l, v]) => ({ l, v })), tips: data.tips.map((t) => ({ t })) };
    go('rating', { anim: 'fade', replace: true, data: { ...common, r: R } });
  } else {
    go(r.type, { anim: 'fade', replace: true, data: { ...common, pal: data } });
  }
}
