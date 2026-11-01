'use strict';
/* Core: helpers, state, router, Claude (sample) hookup. Screens live in screens.js, wiring in actions.js. */
const D = window.CHANCE_DATA;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IMG = (n) => (!n ? '' : /^(blob:|data:|img\/)/.test(n) ? n : `img/${n}.jpg`);
const ic = (n, c = '') => `<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const lc = (s) => String(s).toLowerCase();
const tc = (s) => String(s).replace(/\S+/g, (w) => w[0].toUpperCase() + w.slice(1));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(.32,.72,0,1)';
const SYS = '<svg viewBox="0 0 78 13" aria-hidden="true"><path fill="currentColor" d="M2.2 8H1a1 1 0 0 0-1 1v2.5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm5-2.5H6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1Zm5-2.5H11a1 1 0 0 0-1 1v7.5a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm5-2.5H16a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.2a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1ZM30.5 3.4c2.2 0 4.2.9 5.7 2.3l1.1-1.1a9.5 9.5 0 0 0-13.6 0l1.1 1.1c1.5-1.4 3.5-2.3 5.7-2.3Zm0 3.4c1.3 0 2.5.5 3.4 1.3L35 7a6.4 6.4 0 0 0-9 0l1.1 1.1c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6 1.8-1.8a2.6 2.6 0 0 0-3.6 0l1.8 1.8Z"/><rect x="49.5" y=".5" width="24" height="12" rx="3.6" fill="none" stroke="currentColor" stroke-opacity=".35"/><rect x="51.5" y="2.5" width="20" height="8" rx="2" fill="currentColor"/><path fill="currentColor" fill-opacity=".4" d="M75 4.5v4a1.9 1.9 0 0 0 0-4Z"/></svg>';
const SB = (cls = '') => `<div class="sbar ${cls}"><span>9:41</span>${SYS}</div>`;

/* ---------- state ---------- */
const S = {
  skills: [],
  tried: [],
  c: { cat: 'fashion', topic: '', topicImg: '', tool: 'rater', own: { text: '', photos: [] }, improve: '' },
  draft: null,
  snap: { mode: 'snap', photo: IMG('bottle'), pos: '50% 50%', learn: null, convo: [] },
};
let uid = 0;

const toastEl = () => $('#toast');
let toastT;
function toast(msg, ms = 2400) {
  const t = toastEl();
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), ms);
}

/* ---------- Claude, through the artifact's sample capability ---------- */
let AI = null;
let AI_IMG = false;
(async () => {
  try {
    const s = await window.claude?.use?.('sample');
    if (s) {
      AI = s;
      try { AI_IMG = !!(await s.limits())?.images; } catch (e) { AI_IMG = false; }
    }
  } catch (e) { AI = null; }
  window.onAI?.();
})();
function aiErr(e) {
  const c = e?.code;
  if (c === 'not_granted') return 'Chance needs your OK to use Claude. Allow it and try again.';
  if (c === 'rate_limited') return 'Chance is busy right now. Try again in a minute.';
  if (c === 'images_unavailable' || c === 'image_rejected') return 'This photo can’t be read here. Try a JPEG or PNG.';
  return 'Couldn’t read that photo. Try another one.';
}
const str = (v, d = '', n = 160) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : d);
async function aiLearn(blob) {
  const prompt = [
    'You are Chance, the visual assistant inside a phone app called Chance AI. Look at the photo and identify its main subject.',
    'Reply with only a JSON object with these keys:',
    '"name": the object or product name, at most 6 words. Use a brand only if you can read it in the photo.',
    '"meta": three short facts joined with " · ", like "Glass · 500 ml · screw cap".',
    '"price": a typical price range like "$20–40", or "" if people don’t buy it.',
    '"match": "Exact match" if you are sure of the specific product, otherwise "Close match".',
    '"noun": one lowercase word for it, like "bottle" or "lamp".',
    '"pills": three follow-up questions a curious person would tap, each under 6 words.',
    '"headline": a 2 to 5 word title about one interesting design detail you can see.',
    '"body": two plain sentences, under 38 words in total, explaining that detail.',
    '"more": two more sentences with a related fact or tip.',
  ].join('\n');
  const r = await AI.json(prompt, { images: blob, modelTier: 'default' });
  const pills = Array.isArray(r?.pills) ? r.pills.filter((p) => typeof p === 'string' && p.trim()).slice(0, 3).map((p) => p.trim().slice(0, 42)) : [];
  return {
    name: str(r?.name, 'Your photo', 60), meta: str(r?.meta, '', 80), price: str(r?.price, '', 24),
    match: /exact/i.test(r?.match || '') ? 'Exact match' : 'Close match', noun: lc(str(r?.noun, 'photo', 16)),
    pills: pills.length ? pills : ['What is this?', 'Where is it from?', 'How do I care for it?'],
    eyebrow: 'Seeing the Unseen', headline: str(r?.headline, 'A closer look', 60), body: str(r?.body, '', 320), more: str(r?.more, '', 320), qa: {}, ai: true,
  };
}
async function aiRating(blob, m) {
  const prompt = [
    `You are ${m.name}, a skill in the Chance AI phone app. What the skill does: ${m.skill?.desc || m.name}.`,
    'Look at the photo and rate it for this skill. Reply with only a JSON object:',
    '"score": a number from 1 to 10 with one decimal,',
    '"verdict": a 2 or 3 word summary,',
    '"summary": one sentence under 22 words about what you see,',
    '"bars": exactly three objects like {"label": "Fit", "value": 8} with one or two word labels and whole numbers 1 to 10,',
    '"tips": three tips, each under 18 words, specific to this photo.',
  ].join('\n');
  const r = await AI.json(prompt, { images: blob, modelTier: 'default' });
  const score = Math.max(1, Math.min(10, Math.round((Number(r?.score) || 7.5) * 10) / 10));
  const bars = (Array.isArray(r?.bars) ? r.bars : []).slice(0, 3).map((b) => [str(b?.label, 'Overall', 14), Math.max(1, Math.min(10, Math.round(Number(b?.value) || 7)))]);
  const tips = (Array.isArray(r?.tips) ? r.tips : []).filter((t) => typeof t === 'string').slice(0, 3);
  return {
    eyebrow: 'Your photo', score, verdict: str(r?.verdict, 'Looking good', 40), summary: str(r?.summary, '', 160),
    bars: bars.length === 3 ? bars : [['Overall', 8], ['Detail', 7], ['Style', 8]],
    tips: tips.length ? tips : ['Try a closer shot so details come through.', 'Use window light for truer colors.', 'Snap a second angle to compare.'],
  };
}
function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
async function srcBlob(src) { const r = await fetch(src); return r.blob(); }
async function prepUpload(file) {
  const raw = URL.createObjectURL(file);
  try {
    const img = await loadImg(raw);
    const k = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
    return { url: URL.createObjectURL(blob), blob };
  } finally { URL.revokeObjectURL(raw); }
}

/* ---------- skills, modes, categories ---------- */
function modeFromSkill(s) {
  return { id: s.id, label: s.name, name: s.name, icon: s.icon, kind: s.kind, result: s.result, scene: s.scene, skill: s };
}
function modes() {
  const mine = S.skills.map(modeFromSkill);
  if (S.draft && !S.skills.some((s) => s.id === S.draft.id)) mine.unshift(modeFromSkill(S.draft));
  const tried = S.tried.map((id) => D.SHOWCASE[id]).filter((s) => s && !mine.some((m) => m.name === s.name)).map(modeFromSkill);
  return [D.MODES[0], ...mine, ...tried, ...D.MODES.slice(1)];
}
const modeById = (id) => modes().find((m) => m.id === id) || D.MODES[0];
const catLabel = (k) => (k === 'custom' ? S.c.topic || 'My topic' : D.LABELS[k] || tc(k));
function sceneForImg(img) { return Object.keys(D.SCENES).find((k) => D.SCENES[k].img === img) || 'desk'; }
function genericCat(label, img) {
  const L = label;
  const l = lc(L);
  const scene = sceneForImg(img);
  return {
    label: L, img, generic: true, ideas: [`${L} Journal`, `${L} Finder`, `${L} Tips`],
    tools: [
      { id: 'spot', name: `${L} Spotter`, desc: 'Photo → what it is and why it matters', icon: 'bulb', img,
        skill: { name: `${L} Spotter`, desc: `Snap anything ${l} and learn what it is and the story behind it.`, short: 'Photo → what it is', kind: 'learn', scene, steps: [`Learning about ${l}`, 'Designing the explainer card', 'Writing quick facts', 'Finalizing result page'] } },
      { id: 'rate', name: `${L} Rater`, desc: 'Photo → a score and quick tips', icon: 'spark', img,
        skill: { name: `${L} Coach`, desc: `Rate any ${l} photo and get quick tips to make it better.`, short: 'Photo → score & tips', kind: 'rating', result: '', scene, steps: ['Setting rating criteria', 'Designing the result card', 'Writing quick tips', 'Finalizing result page'] } },
    ],
  };
}
function getCat(k = S.c.cat) {
  const C = D.CATS;
  if (C[k]) return C[k];
  if (k === 'coffee') return { ...C.food, label: 'Coffee', img: 'coffee', tools: [C.food.tools[1], C.food.tools[0]], ideas: ['Bean Finder', 'Latte Art Coach', 'Café Log'] };
  if (k === 'design') return { ...C.interiors, label: 'Design', tools: [C.interiors.tools[1], C.interiors.tools[0]], ideas: ['Era Guesser', 'Maker Finder', 'Material Check'] };
  if (k === 'custom') return genericCat(S.c.topic || 'My topic', S.c.topicImg || '');
  return genericCat(catLabel(k), D.CAT_IMG[k] ?? '');
}
function posFromBox(b) { return b ? `${Math.round((b[0] + b[2] / 2) * 100)}% ${Math.round((b[1] + b[3] / 2) * 100)}%` : '50% 50%'; }
function sceneObj(key) {
  const s = D.SCENES[key] || D.SCENES.bottle;
  return { key: D.SCENES[key] ? key : 'bottle', src: IMG(s.img), label: s.label, box: s.box, pos: posFromBox(s.box) };
}
const uploadScene = (url, blob) => ({ key: 'upload', src: url, label: 'Your photo', box: [0.2, 0.25, 0.6, 0.5], pos: '50% 50%', blob, upload: true });
function mySkills() {
  const coatTaken = S.skills.some((s) => s.img === 'coat');
  return [
    ...S.skills.map((s) => ({ id: s.id, name: s.name, img: s.img, pos: s.pos || '50% 45%', fresh: s.fresh })),
    ...D.HOME_SKILLS.map((s) => (s.id === 'ootd' && coatTaken ? { ...s, img: 'sneakers', pos: '42% 60%' } : s)),
  ];
}

/* ---------- router ---------- */
const app = $('#app');
const SCREENS = {};
const stack = [];
let busy = false;
const DEFAULT_ANIM = { community: 'fade', interest: 'modal', camera: 'iris', ask: 'fade', learn: 'fade', rating: 'fade', tarot: 'fade', dot: 'fade', palette: 'fade', building: 'push' };
const cur = () => stack[stack.length - 1];
const lastIndex = (id) => { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].id === id) return i; return -1; };

function mountScreen(id, data = {}, doMount = true) {
  const def = SCREENS[id];
  const el = document.createElement('section');
  el.className = `scr ${def.cls || ''}`;
  el.dataset.id = id;
  el.setAttribute('aria-label', def.title || id);
  el.innerHTML = def.render(data);
  app.appendChild(el);
  if (doMount) def.mount?.(el, data);
  return el;
}
function rerender(e) {
  const def = SCREENS[e.id];
  def.leave?.(e.el);
  e.el.innerHTML = def.render(e.data);
  def.mount?.(e.el, e.data);
}
const dur = (ms) => (RM ? 1 : ms);
function animIn(el, from, anim, origin) {
  const o = { duration: dur(440), easing: EASE };
  const ps = [];
  if (anim === 'push') {
    el.classList.add('entering');
    ps.push(el.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], o).finished.then(() => el.classList.remove('entering')));
    if (from) ps.push(from.animate([{ transform: 'none', filter: 'brightness(1)' }, { transform: 'translateX(-28%)', filter: 'brightness(.94)' }], o).finished);
  } else if (anim === 'modal') {
    ps.push(el.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { ...o, duration: dur(520) }).finished);
    if (from) ps.push(from.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(.82)' }], o).finished);
  } else if (anim === 'iris') {
    const W = app.offsetWidth, H = app.offsetHeight;
    const { x, y } = origin || { x: W / 2, y: H - 60 };
    const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
    ps.push(el.animate([{ clipPath: `circle(24px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)` }], { duration: dur(580), easing: EASE }).finished);
  } else if (anim === 'fade') {
    ps.push(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur(300), easing: 'ease-out' }).finished);
  }
  return Promise.all(ps).catch(() => {});
}
function animOut(el, to, anim, origin) {
  const o = { duration: dur(400), easing: EASE, fill: 'forwards' };
  const ps = [];
  if (anim === 'push') {
    el.classList.add('entering');
    ps.push(el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], o).finished);
    if (to) ps.push(to.animate([{ transform: 'translateX(-28%)', filter: 'brightness(.94)' }, { transform: 'none', filter: 'brightness(1)' }], { duration: dur(400), easing: EASE }).finished);
  } else if (anim === 'modal') {
    ps.push(el.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], { ...o, duration: dur(460) }).finished);
    if (to) ps.push(to.animate([{ filter: 'brightness(.82)' }, { filter: 'brightness(1)' }], { duration: dur(460), easing: EASE }).finished);
  } else if (anim === 'iris') {
    const W = app.offsetWidth, H = app.offsetHeight;
    const { x, y } = origin || { x: W / 2, y: H - 60 };
    const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
    ps.push(el.animate([{ clipPath: `circle(${R}px at ${x}px ${y}px)`, opacity: 1 }, { clipPath: `circle(24px at ${x}px ${y}px)`, opacity: 0.6 }], { ...o, duration: dur(460) }).finished);
  } else {
    ps.push(el.animate([{ opacity: 1 }, { opacity: 0 }], { ...o, duration: dur(260) }).finished);
  }
  return Promise.all(ps).catch(() => {});
}
function dropEntry(e) { SCREENS[e.id].leave?.(e.el); e.el.remove(); }

async function go(id, opt = {}) {
  if (busy) return;
  busy = true;
  try {
    const from = cur();
    const data = opt.data || {};
    const anim = opt.anim || DEFAULT_ANIM[id] || 'push';
    const el = mountScreen(id, data);
    await animIn(el, from?.el, anim, opt.origin);
    let removed = [];
    if (opt.popTo) {
      const i = lastIndex(opt.popTo);
      if (i >= 0) removed = stack.splice(opt.replace ? i : i + 1);
    } else if (opt.replace && from) removed = [stack.pop()];
    removed.forEach(dropEntry);
    if (from && !removed.includes(from)) from.el.hidden = true;
    const keepAnim = opt.replace && removed.length ? removed[0].anim : anim;
    stack.push({ id, el, data, anim: opt.exitAnim || (opt.replace ? keepAnim : anim), origin: opt.origin || removed[0]?.origin });
  } finally { busy = false; afterRoute(); }
}
async function back() {
  if (busy || stack.length < 2) return;
  busy = true;
  try {
    const t = stack.pop();
    const p = cur();
    p.el.hidden = false;
    rerender(p);
    await animOut(t.el, p.el, t.anim, t.origin);
    dropEntry(t);
  } finally { busy = false; afterRoute(); }
}
async function backTo(id) {
  const i = lastIndex(id);
  if (i < 0) { reset([[id]]); return; }
  if (i === stack.length - 1 || busy) return;
  busy = true;
  try {
    const t = cur();
    const gone = stack.splice(i + 1);
    gone.filter((e) => e !== t).forEach(dropEntry);
    const p = stack[i];
    p.el.hidden = false;
    rerender(p);
    const anim = gone.some((e) => e.anim === 'modal') ? 'modal' : t.anim;
    await animOut(t.el, p.el, anim, t.origin);
    dropEntry(t);
  } finally { busy = false; afterRoute(); }
}
function reset(chain) {
  stack.splice(0).forEach(dropEntry);
  chain.forEach(([id, data = {}], i) => {
    const last = i === chain.length - 1;
    const el = mountScreen(id, data, last);
    stack.push({ id, el, data, anim: i === 0 ? 'fade' : DEFAULT_ANIM[id] || 'push' });
    if (!last) el.hidden = true;
  });
  if (!RM) cur().el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
  afterRoute();
}
function afterRoute() {
  const t = cur();
  if (!t) return;
  $('#homeInd').classList.toggle('light', t.el.classList.contains('dark'));
  window.onRoute?.(t);
}
function originOf(el) {
  const a = app.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = a.width / app.offsetWidth || 1;
  return { x: (r.left + r.width / 2 - a.left) / k, y: (r.top + r.height / 2 - a.top) / k };
}
