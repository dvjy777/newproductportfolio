'use strict';
/* Wiring: taps, typing, file pickers, the presenter panel, and device scaling. */

const scrOf = (el) => el.closest('.scr');
async function typeInto(ta, text) {
  if (!ta || ta._typing) return;
  ta._typing = true;
  ta.focus({ preventScroll: true });
  for (let i = 2; i < text.length + 2; i += 2) {
    if (!ta.isConnected) return;
    ta.value = text.slice(0, i);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(RM ? 0 : 16);
  }
  ta._typing = false;
}
async function dictate(btn, ta, text) {
  if (!ta || btn.classList.contains('rec')) return;
  btn.classList.add('rec');
  toast('Listening…', 1100);
  await wait(RM ? 0 : 1000);
  await typeInto(ta, text);
  btn.classList.remove('rec');
}
function setCta(el, text) { const c = $('.cta', el); if (c) c.textContent = text; }
function needText(el, msg) {
  const c = $('.composer', el);
  if (c) { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); }
  toast(msg);
}

const ACT = {
  /* snap to know */
  openCamera(el) {
    const id = el.dataset.mode || 'snap';
    if (id === 'minion') { toast('Minion Buddy isn’t part of this prototype.'); return; }
    go('camera', { anim: 'iris', origin: originOf(el), data: { mode: id, gallery: !!el.dataset.gallery } });
  },
  tryPhoto(el) { go('camera', { anim: 'iris', origin: originOf(el), data: { mode: el.dataset.mode, scene: el.dataset.scene, auto: true } }); },
  tabHome() { const b = $('.body', cur().el); b?.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); if (cur().id !== 'home') backTo('home'); },
  tabCommunity() {
    if (cur().id === 'community') { $('.body', cur().el)?.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); return; }
    go('community', { anim: 'fade' });
  },
  tabProfile() { toast('Profile isn’t part of this prototype.'); },
  commFilter(el) { cur().data.filter = el.dataset.v; rerender(cur()); },
  trySkill(el) {
    const id = el.dataset.sk, sk = D.SHOWCASE[id];
    if (!sk) return;
    if (!S.tried.includes(id)) S.tried.unshift(id);
    const auto = !!el.dataset.auto;
    go('camera', { anim: 'iris', origin: originOf(el), data: { mode: id, scene: sk.scene, auto, gallery: !!sk.gallery && !auto } });
  },
  closeCam() { back(); },
  shutter(el) { runCapture(scrOf(el)); },
  mode(el) { setMode(scrOf(el), el.dataset.m); },
  gallery(el) { openGallery(scrOf(el)); },
  closeGallery(el) { closeGallery(scrOf(el)); },
  pickPhoto(el) { const s = scrOf(el); useScene(s, sceneObj(el.dataset.k)); },
  flash(el) { const s = scrOf(el); s._flash = !s._flash; el.classList.toggle('on', s._flash); el.setAttribute('aria-pressed', s._flash); toast(s._flash ? 'Flash on' : 'Flash off', 1000); },
  flip(el) { const s = scrOf(el); s.classList.remove('flipping'); void s.offsetWidth; s.classList.add('flipping'); setTimeout(() => s.classList.remove('flipping'), 650); },
  zoom(el) {
    const s = scrOf(el), z = el.dataset.z;
    $$('.zoom button', s).forEach((b) => b.classList.toggle('on', b === el));
    $('.zoomer', s).style.transform = z === '2' ? 'scale(1.6)' : '';
  },
  focus(el, e) {
    const s = scrOf(el);
    if (s._swiped || s._busy) { s._swiped = false; return; }
    const a = s.getBoundingClientRect(), k = a.width / s.offsetWidth || 1;
    const f = document.createElement('span');
    Object.assign(f.style, { position: 'absolute', zIndex: 7, width: '70px', height: '70px', margin: '-35px', left: `${(e.clientX - a.left) / k}px`, top: `${(e.clientY - a.top) / k}px`, border: '1.5px solid #fff', borderRadius: '14px', pointerEvents: 'none' });
    s.appendChild(f);
    f.animate([{ transform: 'scale(1.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: 0.4 }, { transform: 'scale(1)', opacity: 0 }], { duration: 900, easing: 'ease-out' }).finished.then(() => f.remove());
    placeBox(s, false);
    detectSoon(s);
  },
  closeSnap() {
    const snapIds = ['camera', 'learn', 'ask', 'rating', 'tarot', 'dot', 'palette'];
    let i = stack.length - 1;
    while (i > 0 && snapIds.includes(stack[i].id)) i--;
    if (i === stack.length - 1) return;
    backTo(stack[i].id);
  },
  seg(el) {
    const s = scrOf(el), v = el.dataset.v;
    if (el.classList.contains('on')) return;
    $$('.seg button', s).forEach((b) => b.classList.toggle('on', b === el));
    segKnob(s, el);
    setTimeout(() => (v === 'ask' ? go('ask', { anim: 'fade' }) : back()), RM ? 0 : 150);
  },
  openAsk() { go('ask', { anim: 'fade', data: { focus: true } }); },
  askQ(el) { go('ask', { anim: 'fade', data: { q: el.dataset.q } }); },
  askHere(el) { ask(scrOf(el), el.dataset.q); },
  readMore(el) {
    const more = $('.more', scrOf(el));
    more.hidden = !more.hidden;
    el.textContent = more.hidden ? 'Read more' : 'Show less';
    if (!more.hidden && !RM) more.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
  },
  store() { toast('The store page opens here in the live app.'); },
  heart(el) { const on = !el.classList.contains('on'); el.classList.toggle('on', on); el.setAttribute('aria-pressed', on); },
  saveAll(el) {
    const hs = $$('.heart', scrOf(el)), on = hs.some((h) => !h.classList.contains('on'));
    hs.forEach((h, i) => setTimeout(() => { h.classList.toggle('on', on); h.setAttribute('aria-pressed', on); }, i * 90));
    el.textContent = on ? 'Saved' : 'Save all';
  },
  snapAgain(el) { go('camera', { anim: 'fade', replace: true, data: { mode: el.dataset.mode } }); },
  saveToast(el) { toast(el.dataset.msg); },
  skillsFilter(el) { cur().data.filter = el.dataset.v; rerender(cur()); },
  dotStyle(el) {
    const s = scrOf(el);
    $$('[data-act=dotStyle]', s).forEach((b) => b.classList.toggle('on', b === el));
    drawDots($('canvas', s), cur().data.src, el.dataset.v);
  },
  async copyHex(el) {
    const v = el.dataset.v.toUpperCase();
    try { await navigator.clipboard.writeText(v); toast(`Copied ${v}`); } catch (e) { toast(`Hex code: ${v}`); }
  },

  /* create a skill */
  startCreate() { S.c.cat = 'fashion'; S.c.tool = 'rater'; go('interest', { anim: 'modal' }); },
  closeFlow() { backTo('home'); },
  pickCat(el) {
    S.c.cat = el.dataset.k;
    const s = scrOf(el);
    $$('[data-act=pickCat]', s).forEach((b) => b.classList.toggle('on', b.dataset.k === S.c.cat));
    setCta(s, `Continue with ${catLabel(S.c.cat)}`);
  },
  toTool() { S.c.tool = getCat().tools[0].id; go('tool'); },
  pickMatch(el) { S.c.cat = el.dataset.k; ACT.toTool(); },
  describeQ(el) { S.c.topicText = el.dataset.q; go('describe'); },
  pickTool(el) {
    S.c.tool = el.dataset.k;
    $$('[data-act=pickTool]', scrOf(el)).forEach((b) => b.classList.toggle('on', b === el));
  },
  createSkill() {
    const cat = getCat();
    const idea = S.c.tool.match(/^idea(\d)$/);
    S.draft = idea ? draftFromIdea(cat, cat.ideas[+idea[1]]) : draftFromTool(cat, cat.tools.find((t) => t.id === S.c.tool) || cat.tools[0]);
    go('building');
  },
  fillTopic(el) { typeInto($('#topic-text', scrOf(el)), el.dataset.v); },
  topicAI(el) { typeInto($('#topic-text', scrOf(el)), 'Vintage film cameras'); },
  topicMic(el) { dictate(el, $('#topic-text', scrOf(el)), 'Vintage film cameras'); },
  describeSend(el) {
    const s = scrOf(el), t = ($('#topic-text', s)?.value || '').trim();
    if (!t) { needText(s, 'Type a topic first, or tap Chance AI.'); return; }
    S.c.cat = 'custom';
    S.c.topic = tc(t.length > 26 ? `${t.slice(0, 25)}…` : t);
    S.c.topicImg = D.CAT_IMG[matchKeys(t)[0]] || '';
    ACT.toTool();
  },
  ownAI(el) { typeInto($('#own-text', scrOf(el)), ownExample(getCat().label)); },
  ownMic(el) { dictate(el, $('#own-text', scrOf(el)), ownExample(getCat().label)); },
  ownSend(el) {
    const s = scrOf(el);
    if (!S.c.own.text.trim()) { needText(s, 'Describe your skill first, or tap Chance AI to draft it.'); return; }
    go('review');
  },
  toggleOwnPhoto(el) {
    const k = el.dataset.k, ph = S.c.own.photos, i = ph.findIndex((p) => p.src === k);
    if (i >= 0) ph.splice(i, 1); else ph.push({ src: k });
    refreshOwn(scrOf(el));
  },
  removeOwnPhoto(el) {
    S.c.own.photos.splice(+el.dataset.i, 1);
    const s = scrOf(el);
    if (cur().id === 'edit') rerender(cur()); else refreshOwn(s);
  },
  editConfirm() {
    if (!S.c.own.text.trim()) { needText(cur().el, 'Your response can’t be empty.'); return; }
    back();
  },
  reviewConfirm() { S.draft = draftFromOwn(getCat()); go('building'); },
  tryDraft(el) { go('camera', { anim: 'iris', origin: originOf(el), data: { mode: S.draft.id } }); },
  improveDraft() { S.c.improve = ''; go('improve'); },
  improveSkill(el) {
    const sk = S.skills.find((s) => s.id === el.dataset.id) || (S.draft?.id === el.dataset.id ? S.draft : null);
    if (!sk) return;
    S.draft = { ...sk, updating: false };
    S.c.improve = '';
    go('improve');
  },
  confirmSkill() {
    const d = S.draft;
    const sk = { ...d, wasUpdate: !!d.updating, updating: false, fresh: true };
    const i = S.skills.findIndex((s) => s.id === d.id);
    if (i >= 0) S.skills[i] = sk; else S.skills.unshift(sk);
    S.draft = sk;
    go('added');
  },
  backToCreate() { if (lastIndex('interest') >= 0) backTo('interest'); else go('interest', { anim: 'modal' }); },
  appendImprove(el) {
    const ta = $('#imp-text', cur().el), v = el.dataset.v, cur = ta.value.trim().replace(/[.,]$/, '');
    ta.value = cur ? `${cur}, ${v[0].toLowerCase()}${v.slice(1)}` : v;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    el.classList.add('on');
  },
  improveAI() { typeInto($('#imp-text', cur().el), improveExample(S.draft)); },
  improveMic(el) { dictate(el, $('#imp-text', cur().el), improveExample(S.draft)); },
  improveSend() {
    if (!S.c.improve.trim()) { needText(cur().el, 'Tell Chance what to change, or tap one of the ideas.'); return; }
    go('changes');
  },
  changesConfirm() {
    const d = S.draft, ch = changesFrom(S.c.improve);
    const merged = [...d.changes.filter((c) => !ch.some((n) => n.k === c.k)), ...ch];
    S.draft = { ...d, updating: true, changes: merged, version: (d.version || 1) + 1, steps: ['Reading your request', ...ch.slice(0, 3).map((c) => `Adding ${lc(c.label)}`), 'Updating the result card'] };
    go('building', { anim: 'fade', popTo: 'ready', replace: true });
  },
};

const INP = {
  topicSearch(t) { const s = scrOf(t); $('.topic-grid', s).innerHTML = topicTiles(t.value); },
  topicText(t) {
    S.c.topicText = t.value;
    const s = scrOf(t), keys = matchKeys(t.value).join();
    const g = $('.match-grid', s);
    if (g.dataset.keys !== keys) { g.dataset.keys = keys; g.innerHTML = matchTiles(t.value); }
    $('.cta', s).classList.toggle('off', !t.value.trim());
  },
  ownText(t) { S.c.own.text = t.value; },
  improveText(t) { S.c.improve = t.value; },
  askInput(t) { t.closest('.abar').classList.toggle('has', !!t.value.trim()); },
};
const FILES = {
  async ownPhotos(files) {
    for (const f of Array.from(files).slice(0, 6)) {
      try { const { url } = await prepUpload(f); S.c.own.photos.push({ src: url }); } catch (e) { toast('That file isn’t a photo we can read.'); }
    }
    if (cur().id === 'edit') rerender(cur()); else refreshOwn(cur().el);
  },
  topicPhoto(files) { if (files.length) toast('Photo added. Chance will use it to suggest skills.'); },
  async snapUpload(files, input) {
    const s = scrOf(input), f = files[0];
    if (!f) return;
    try { const { url, blob } = await prepUpload(f); useScene(s, uploadScene(url, blob)); } catch (e) { toast('Couldn’t open that photo. Try a JPEG or PNG.'); closeGallery(s); }
  },
};

/* delegation */
let hintT;
function flashHints() { app.classList.add('hints'); clearTimeout(hintT); hintT = setTimeout(() => app.classList.remove('hints'), 650); }
app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act],[data-go],[data-back]');
  if (!t || !app.contains(t)) {
    if (!e.target.closest('input,textarea,label,form')) flashHints();
    return;
  }
  if (t.closest('.scr')?.hidden) return;
  if (t.hasAttribute('data-back')) { back(); return; }
  if (t.dataset.go) { go(t.dataset.go); return; }
  ACT[t.dataset.act]?.(t, e);
});
app.addEventListener('input', (e) => { const t = e.target.closest('[data-in]'); if (t) INP[t.dataset.in]?.(t, e); });
app.addEventListener('change', (e) => { const t = e.target; if (t.matches?.('input[type=file][data-file]')) { FILES[t.dataset.file]?.(t.files, t); setTimeout(() => { t.value = ''; }, 0); } });
app.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  if (f.dataset.form === 'ask') {
    const inp = $('input', f), q = inp.value.trim();
    if (!q) return;
    inp.value = '';
    f.classList.remove('has');
    ask(scrOf(f), q);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input,textarea')) return;
  if (e.key === 'Escape' || e.key === 'ArrowLeft') {
    const t = cur();
    if (t?.id === 'camera' && $('.gsheet.on', t.el)) { closeGallery(t.el); return; }
    if (stack.length > 1) back();
  }
  if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey) JUMP.home(true);
});

/* presenter panel */
function ensureWardrobe() {
  let sk = S.skills.find((s) => s.name === 'Wardrobe Analyzer');
  if (!sk) {
    const f = D.CATS.fashion;
    sk = { ...draftFromTool(f, f.tools[0]), fresh: false, wasUpdate: false, updating: false };
    S.skills.unshift(sk);
  }
  S.draft = sk;
  return sk;
}
function fashionDraft() { S.c.cat = 'fashion'; S.c.tool = 'rater'; const f = D.CATS.fashion; S.draft = draftFromTool(f, f.tools[0]); }
function demoOwn() {
  S.c.cat = 'fashion';
  if (!S.c.own.text) S.c.own.text = 'Make an outfit recommendation skill that matches your current outfit with a new outfit.';
  if (!S.c.own.photos.length) S.c.own.photos = ['coat', 'sneakers', 'desk', 'coffee'].map((src) => ({ src }));
}
const C0 = [['home'], ['interest'], ['tool']];
const JUMP = {
  home(wipe) {
    if (wipe) { S.skills = []; S.tried = []; S.draft = null; S.c = { cat: 'fashion', topic: '', topicImg: '', tool: 'rater', own: { text: '', photos: [] }, improve: '' }; S.snap = { mode: 'snap', learn: null, convo: [] }; }
    reset([['home']]);
  },
  camera() { reset([['home'], ['camera', { mode: 'snap' }]]); },
  analyzing() { reset([['home'], ['camera', { mode: 'snap', auto: true }]]); },
  learn() { S.snap = { mode: 'snap', learn: null, convo: [] }; snapL(); reset([['home'], ['learn']]); },
  ask() { S.snap = { mode: 'snap', learn: null, convo: [] }; snapL(); reset([['home'], ['learn'], ['ask', { q: 'How can I use this item daily?' }]]); },
  interest() { S.c.cat = 'fashion'; reset([['home'], ['interest']]); },
  tool() { fashionDraft(); reset(C0); },
  building() { fashionDraft(); reset([...C0, ['building']]); },
  ready() { fashionDraft(); reset([...C0, ['ready']]); },
  added() { fashionDraft(); ACT_confirmQuiet(); reset([...C0, ['ready'], ['added']]); },
  tryit() { const sk = ensureWardrobe(); reset([['home'], ['camera', { mode: sk.id }]]); },
  other() { reset([['home'], ['interest'], ['other']]); },
  describe() { reset([['home'], ['interest'], ['other'], ['describe']]); },
  own() { S.c.cat = 'fashion'; reset([...C0, ['own']]); },
  review() { demoOwn(); reset([...C0, ['own'], ['review']]); },
  edit() { demoOwn(); reset([...C0, ['own'], ['review'], ['edit']]); },
  improve() { ensureWardrobe(); S.c.improve = ''; reset([...C0, ['ready'], ['improve']]); },
  changes() { ensureWardrobe(); S.c.improve = improveExample(S.draft); reset([...C0, ['ready'], ['improve'], ['changes']]); },
  skills() { reset([['home'], ['skills']]); },
  community() { reset([['home'], ['community']]); },
};
function ACT_confirmQuiet() {
  const d = S.draft;
  if (!S.skills.some((s) => s.id === d.id)) S.skills.unshift({ ...d, fresh: true });
  S.draft = S.skills.find((s) => s.id === d.id);
}
const KEY_OF = { camera: 'camera', learn: 'learn', ask: 'ask', interest: 'interest', tool: 'tool', building: 'building', ready: 'ready', added: 'added', rating: 'tryit', tarot: 'tryit', dot: 'tryit', palette: 'tryit', other: 'other', describe: 'describe', own: 'own', review: 'review', edit: 'edit', improve: 'improve', changes: 'changes', skills: 'skills', community: 'community', home: 'home' };
window.onRoute = (t) => {
  let k = KEY_OF[t.id];
  if (t.id === 'camera' && t.el.classList.contains('captured')) k = 'analyzing';
  $$('.fl').forEach((b) => { const on = b.dataset.jump === k; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
};
window.onAI = () => {
  const n = $('#aiNote');
  if (!n) return;
  if (AI_IMG) { n.classList.add('live'); n.textContent = 'Live AI is on: upload your own photo from the camera’s photo button and Claude reads it. Typed questions in Ask get real answers.'; }
  else if (AI) { n.classList.add('live'); n.textContent = 'Live AI is on for typed questions in Ask.'; }
  else n.textContent = 'Demo content is scripted. Open this page on claude.ai to let Claude read your own photos.';
};
$('#panel').addEventListener('click', (e) => {
  const j = e.target.closest('[data-jump]');
  if (j) { if (!busy) JUMP[j.dataset.jump]?.(); return; }
  if (e.target.closest('#restart')) JUMP.home(true);
  const h = e.target.closest('#hotspots');
  if (h) { const on = h.getAttribute('aria-pressed') !== 'true'; h.setAttribute('aria-pressed', on); app.classList.toggle('hints-on', on); }
});

/* fit the phone to the window */
const device = $('#device'), wrap = $('#wrap');
function fit() {
  if (matchMedia('(max-width: 500px)').matches) { device.style.transform = ''; wrap.style.width = ''; wrap.style.height = ''; return; }
  const k = Math.min(1, (window.innerHeight - 40) / 868, (document.documentElement.clientWidth - 32) / 414);
  device.style.transform = `scale(${k})`;
  wrap.style.width = `${414 * k}px`;
  wrap.style.height = `${868 * k}px`;
}
window.addEventListener('resize', () => { fit(); const t = cur(); if (t?.id === 'camera' && !t.el._busy) placeBox(t.el, $('.bx', t.el)?.classList.contains('on')); });
fit();
window.onAI();
reset([['home']]);
