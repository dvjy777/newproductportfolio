'use strict';
/* Create a skill: pick interest → choose tool → building → ready → added, plus the branch screens. */

const navBack = () => `<div class="nav"><button class="ib" data-back aria-label="Back">${ic('chevL')}</button></div>`;
const navClose = () => `<div class="nav"><button class="ib" data-act="closeFlow" aria-label="Close">${ic('x')}</button></div>`;
const page = (inner, foot = '') => `${SB('solid')}<div class="body"><div class="pad-top"></div>${inner}</div>${foot ? `<div class="foot">${foot}</div>` : ''}`;
const tileHTML = (k, on, act = 'pickCat') => {
  const img = D.CAT_IMG[k];
  return `<button class="tile ${on ? 'on' : ''}" data-act="${act}" data-k="${k}">${img ? `<img src="${IMG(img)}" alt="">` : ''}<span class="lab">${esc(catLabel(k))}</span><span class="check">${ic('check')}</span></button>`;
};
const composer = (o) => `<div class="composer">${o.thumbs != null ? `<div class="cthumbs">${o.thumbs}</div>` : ''}
  <textarea id="${o.id}" rows="2" data-in="${o.inp}" placeholder="${esc(o.ph)}" aria-label="${esc(o.label || o.ph)}">${esc(o.val || '')}</textarea>
  <div class="tb"><label class="r36" data-file-label aria-label="Add photos" style="cursor:pointer"><input type="file" accept="image/*" multiple data-file="${o.file || 'ownPhotos'}" hidden>${ic('plus')}</label>
  <button class="ai-pill" data-act="${o.ai}">${ic('spark')}Chance AI</button><span class="grow"></span>
  <button class="r36" data-act="${o.mic}" aria-label="Dictate">${ic('mic')}</button><button class="r36 dark" data-act="${o.send}" aria-label="Send">${ic('up')}</button></div></div>`;
const thumbOf = (d) => (d.img ? `<img src="${IMG(d.img)}" alt="">` : `<div class="ph-empty">${ic(d.icon)}</div>`);
const skillRow = (d, sub, extra = '') => `<div class="srow"><div class="srow-ph">${thumbOf(d)}<span class="mini">${ic(d.icon)}</span></div>
  <div class="srow-tx"><span class="nm">${esc(d.name)}</span><span class="ds">${esc(sub)}</span></div>${extra}</div>`;

SCREENS.interest = {
  title: 'Pick an interest',
  render() {
    const sel = S.c.cat;
    return page(`${navClose()}<div class="main">
      <div class="title"><h1 class="h1">Create a visual skill</h1><p class="sub">Start from what you’re into. Pick one to build a skill around.</p></div>
      <section class="sec"><h2 class="h3">Your latest interests</h2><div class="tiles">${D.INTERESTS.map((k) => tileHTML(k, k === sel)).join('')}</div></section>
      <section class="sec"><h2 class="h3">Are you interested in any of these?</h2><div class="chips">
        ${D.MORE_INTERESTS.map((k) => `<button class="chip ${k === sel ? 'on' : ''}" data-act="pickCat" data-k="${k}">${esc(catLabel(k))}</button>`).join('')}
        <button class="chip" data-go="other">${ic('plus')}Other</button></div></section>
    </div>`, `<button class="btn btn-primary cta" data-act="toTool">Continue with ${esc(catLabel(sel))}</button>`);
  },
};

function topicTiles(q) {
  const list = q ? D.ALL_TOPICS.filter((k) => lc(catLabel(k)).includes(lc(q.trim()))) : D.TOPICS;
  if (!list.length) return `<div class="empty-note">No topics match “${esc(q)}”.<br><button class="link" style="margin-top:10px; color:var(--blue)" data-act="describeQ" data-q="${esc(q)}">Describe “${esc(q)}” instead${ic('chevR')}</button></div>`;
  return list.map((k) => tileHTML(k, k === S.c.cat)).join('');
}
SCREENS.other = {
  title: 'Other topics',
  render() {
    if (!D.TOPICS.includes(S.c.cat)) S.c.cat = 'art';
    return page(`${navBack()}<div class="main"><h1 class="h1">What else are you into?</h1>
      <label class="search">${ic('search')}<input id="topic-q" data-in="topicSearch" placeholder="Search topics" autocomplete="off" aria-label="Search topics"></label>
      <div class="tiles sm topic-grid">${topicTiles('')}</div></div>`,
    `<button class="btn btn-text" data-go="describe">Can’t find it? Describe your topic</button><button class="btn btn-primary cta" data-act="toTool">Continue with ${esc(catLabel(S.c.cat))}</button>`);
  },
};

function matchKeys(t) {
  const s = lc(t);
  for (const [re, ks] of D.TOPIC_WORDS) if (re.test(s)) return ks;
  return ['design', 'gadgets'];
}
const matchTiles = (t) => matchKeys(t).map((k) => tileHTML(k, false, 'pickMatch')).join('');
SCREENS.describe = {
  title: 'Describe your topic',
  render() {
    const t = S.c.topicText || '';
    return page(`${navBack()}<div class="main">
      <div class="title"><h1 class="h1">Describe your topic</h1><p class="sub">What are you into? A few words is enough, and we’ll suggest skills you could make.</p></div>
      ${composer({ id: 'topic-text', ph: 'e.g. vintage film cameras', val: t, inp: 'topicText', ai: 'topicAI', mic: 'topicMic', send: 'describeSend', label: 'Your topic', file: 'topicPhoto' })}
      <section class="sec"><h2 class="h3">Try something like</h2><div class="chips">${['Vintage cameras', 'Houseplants', 'Street signs', 'Watches', 'Birdwatching'].map((x) => `<button class="chip" data-act="fillTopic" data-v="${x}">${x}</button>`).join('')}</div></section>
      <section class="sec"><h2 class="h3">Matching topics</h2><div class="tiles sm match-grid">${matchTiles(t)}</div></section>
    </div>`, `<button class="btn btn-primary cta ${t.trim() ? '' : 'off'}" data-act="describeSend">Continue with my topic</button>`);
  },
};

const toolCard = (t, on) => `<button class="scard ${on ? 'on' : ''}" data-act="pickTool" data-k="${t.id}"><span class="ph">${t.img ? `<img src="${IMG(t.img)}" alt="">` : `<span class="ph-empty">${ic(t.icon)}</span>`}</span>
  <span class="sicon">${ic(t.icon)}</span><span class="check">${ic('check')}</span><span class="tx"><span class="nm">${esc(t.name)}</span><span class="ds">${esc(t.desc)}</span></span></button>`;
SCREENS.tool = {
  title: 'Choose a tool',
  render() {
    const cat = getCat(), L = cat.label;
    if (!cat.tools.some((t) => t.id === S.c.tool) && !/^idea\d$/.test(S.c.tool)) S.c.tool = cat.tools[0].id;
    const sel = S.c.tool;
    return page(`${navBack()}<div class="main">
      <div class="title"><p class="eyebrow">${esc(L)}</p><h1 class="h2">What ${esc(lc(L))} tool do you want to create today?</h1></div>
      <div class="cards2">${cat.tools.map((t) => toolCard(t, t.id === sel)).join('')}</div>
      <section class="sec"><h2 class="h3">More ${esc(lc(L))} ideas</h2><div class="chips">${cat.ideas.map((x, i) => `<button class="chip ${sel === `idea${i}` ? 'on' : ''}" data-act="pickTool" data-k="idea${i}">${esc(x)}</button>`).join('')}</div></section>
    </div>`, `<button class="btn btn-secondary" data-go="own">${ic('pencil')}Make my own ${esc(lc(L))} skill</button><button class="btn btn-primary" data-act="createSkill">${ic('spark')}Create Skill</button>`);
  },
};

/* make my own */
const ownExample = (L) => (L === 'Fashion' ? 'Make an outfit recommendation skill that matches your current outfit with a new outfit.' : `Make a ${lc(L)} skill that looks at my photo and suggests what to try next.`);
const ownThumbs = () => S.c.own.photos.map((p, i) => `<span class="cthumb"><img src="${IMG(p.src)}" alt=""><button data-act="removeOwnPhoto" data-i="${i}" aria-label="Remove photo">${ic('x')}</button></span>`).join('');
SCREENS.own = {
  title: 'Make my own skill',
  render() {
    const L = getCat().label, o = S.c.own;
    const pick = (cap) => `<input type="file" accept="image/*" ${cap ? 'capture="environment"' : 'multiple'} data-file="ownPhotos" hidden>`;
    return page(`${navBack()}<div class="main">
      <div class="title"><h1 class="h2">Make my own ${esc(lc(L))} skill</h1><p class="sub">Describe what your new ${esc(lc(L))} skill could do. More detail, the better.</p></div>
      ${composer({ id: 'own-text', ph: L === 'Fashion' ? 'e.g. Rate my outfit and suggest what to swap for a dinner date…' : `e.g. Look at my ${lc(L)} photo and tell me what to try next…`, val: o.text, inp: 'ownText', ai: 'ownAI', mic: 'ownMic', send: 'ownSend', label: 'Describe your skill', thumbs: ownThumbs() })}
      <div class="attach"><label class="att" data-file-label>${pick(true)}${ic('camera')}Camera</label><label class="att" data-file-label>${pick(false)}${ic('image')}Photos</label><label class="att" data-file-label>${pick(false)}${ic('file')}Files</label></div>
      <section class="sec"><div class="sec-h"><h2 class="h3">Your photos</h2><label class="link" data-file-label style="cursor:pointer">${pick(false)}Select more${ic('chevR')}</label></div>
        <div class="pgrid">${D.OWN_PHOTOS.map((p) => `<button class="pg ${o.photos.some((x) => x.src === p) ? 'on' : ''}" data-act="toggleOwnPhoto" data-k="${p}" aria-pressed="${o.photos.some((x) => x.src === p)}"><img src="${IMG(p)}" alt=""><span class="check">${ic('check')}</span></button>`).join('')}</div></section>
    </div>`);
  },
};
function refreshOwn(el) {
  const th = $('.cthumbs', el);
  if (th) th.innerHTML = ownThumbs();
  $$('.pg', el).forEach((b) => { const on = S.c.own.photos.some((x) => x.src === b.dataset.k); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
}
function buildChips(text, cat) {
  const t = lc(text);
  const noun = { Fashion: 'Outfit', Sneakers: 'Sneaker', Food: 'Meal', Coffee: 'Coffee', Interiors: 'Room', Design: 'Design', Art: 'Art' }[cat.label] || cat.label;
  const map = [[/recommend|suggest|match|pair/, 'recommender'], [/rate|score|rating|grade/, 'rater'], [/colou?r|palette/, 'color matcher'], [/plan|week|closet|schedule/, 'planner'], [/find|where|buy|shop/, 'finder'], [/explain|story|learn|history|what is/, 'explainer']];
  const hit = map.find(([re]) => re.test(t));
  return [`${noun} ${hit ? hit[1] : 'helper'}`, cat.label];
}
SCREENS.review = {
  title: 'Check your request',
  render() {
    const cat = getCat(), o = S.c.own, ph = o.photos;
    const shown = ph.length > 3 ? ph.slice(0, 2) : ph;
    return page(`${navBack()}<div class="main">
      <div class="title"><h1 class="h2">Make my own ${esc(lc(cat.label))} skill</h1><p class="sub">Check your request before we build it.</p></div>
      <section class="sec"><h2 class="h3">Your response</h2><div class="resp"><p>${esc(o.text)}</p>${ph.length ? `<div class="rthumbs">${shown.map((p) => `<span><img src="${IMG(p.src)}" alt=""></span>`).join('')}${ph.length > 3 ? `<span class="more">+${ph.length - 2}</span>` : ''}</div>` : ''}</div></section>
      <section class="sec"><h2 class="h3">What we’ll build</h2><div class="chips">${buildChips(o.text, cat).map((c, i) => `<span class="chip blue new" style="animation-delay:${i * 0.09}s">${i ? '' : ic('spark')}${esc(c)}</span>`).join('')}</div></section>
    </div>`, `<button class="btn btn-secondary" data-go="edit">${ic('pencil')}Edit my response</button><button class="btn btn-primary" data-act="reviewConfirm">Confirm</button>`);
  },
};
SCREENS.edit = {
  title: 'Edit your request',
  render() {
    const L = getCat().label, o = S.c.own;
    return page(`${navBack()}<div class="main">
      <div class="title"><h1 class="h2">Make my own ${esc(lc(L))} skill</h1><p class="sub">Change your photos or wording, then confirm.</p></div>
      <section class="sec"><h2 class="h3">Your images</h2><div class="eimgs">${o.photos.map((p, i) => `<div class="eimg"><div class="ph"><img src="${IMG(p.src)}" alt=""></div><button class="minus" data-act="removeOwnPhoto" data-i="${i}" aria-label="Remove photo">${ic('minus')}</button></div>`).join('')}
        <label class="eadd" data-file-label aria-label="Add photos"><input type="file" accept="image/*" multiple data-file="ownPhotos" hidden>${ic('plus')}</label></div></section>
      <section class="sec"><h2 class="h3">Your response</h2><textarea class="etext" id="edit-text" data-in="ownText" rows="3" aria-label="Your response">${esc(o.text)}</textarea></section>
      <p class="tip-note">Tip: mention the occasion or style you’re going for.</p>
    </div>`, `<button class="btn btn-primary" data-act="editConfirm">Confirm</button>`);
  },
};

/* drafts */
function draftFromTool(cat, t) {
  const k = t.skill;
  return { id: `u${++uid}`, name: k.name, desc: k.desc, short: k.short, cat: cat.label, icon: t.icon, img: t.img || cat.img || '', kind: k.kind, result: k.result || '', scene: k.scene, steps: k.steps, version: 1, changes: [] };
}
function draftFromIdea(cat, name) {
  const base = cat.tools.find((t) => t.skill.kind === 'rating') || cat.tools[0];
  return { ...draftFromTool(cat, base), name, desc: `${name} for your ${lc(cat.label)} photos. Snap one to see it work.`, short: `Photo → ${lc(name)}`, steps: [`Planning ${name}`, 'Designing the result card', 'Writing the tips', 'Finalizing result page'] };
}
function draftFromOwn(cat) {
  const text = S.c.own.text.trim();
  const main = buildChips(text, cat)[0];
  const kind = /color/.test(main) ? 'palette' : /explainer|finder/.test(main) ? 'learn' : 'rating';
  const base = cat.tools.find((t) => t.skill.kind === kind) || cat.tools[0];
  const ph = S.c.own.photos[0];
  return {
    ...draftFromTool(cat, base), name: tc(main), desc: text.length > 120 ? `${text.slice(0, 117)}…` : text, short: 'Your own skill',
    img: ph ? ph.src : base.img || cat.img || '',
    steps: ['Reading your request', ...(S.c.own.photos.length ? ['Studying your photos'] : []), 'Designing the result card', 'Finalizing result page'],
  };
}
function changesFrom(text) {
  const t = lc(text);
  const out = D.CHANGES.filter(([re]) => re.test(t)).map(([, label, k]) => ({ label, k }));
  return out.length ? out : [{ label: 'Tuned tips', k: 'tuned' }];
}

SCREENS.building = {
  title: 'Building',
  render() {
    const d = S.draft;
    return page(`<div class="nav"><button class="ib" data-back aria-label="Cancel">${ic('x')}</button></div>
      <div class="bld-img">${thumbOf(d)}<div class="shine"></div><span class="bld-pill">${ic('spark')}${d.updating ? 'Updating…' : 'Building…'}</span></div>
      <div class="main"><div class="title"><h1 class="h2">${d.updating ? `Updating ${esc(d.name)}` : `Building your ${esc(d.name)}`}</h1><p class="sub">This usually takes under a minute.</p></div>
      <div class="steps">${d.steps.map((s) => `<div class="step"><span class="dot">${ic('check')}</span><span>${esc(s)}</span></div>`).join('')}</div></div>`,
    '<button class="btn btn-text" data-back>Cancel</button>');
  },
  mount(el) {
    const steps = $$('.step', el);
    let i = 0;
    el._t = [];
    const finish = () => { if (cur()?.el !== el) return; if (busy) { el._t.push(setTimeout(finish, 200)); return; } go('ready', { anim: 'fade', replace: true }); };
    const tick = () => {
      steps.forEach((s, j) => { s.classList.toggle('done', j < i); s.classList.toggle('run', j === i); });
      if (i < steps.length) { i++; el._t.push(setTimeout(tick, i === 1 ? 650 : 820)); } else el._t.push(setTimeout(finish, 520));
    };
    tick();
  },
  leave(el) { (el._t || []).forEach(clearTimeout); },
};

SCREENS.ready = {
  title: 'Your skill is ready',
  render() {
    const d = S.draft, upd = d.updating;
    return page(`${navBack()}<div class="main">
      <div class="title"><p class="eyebrow">${upd ? 'Updated' : 'Ready'}</p><h1 class="h1">${upd ? 'Your skill is updated' : 'Your skill is ready'}</h1></div>
      <div class="rcard"><div class="ph">${thumbOf(d)}</div><span class="sicon">${ic(d.icon)}</span>
        <div class="tx"><h2>${esc(d.name)}${d.version > 1 ? `<span class="vtag">v${d.version}</span>` : ''}</h2><p class="ds">${esc(d.desc)}</p>
        ${d.changes.length ? `<div class="chips">${d.changes.map((c) => `<span class="chip blue">${ic('spark')}${esc(c.label)}</span>`).join('')}</div>` : ''}
        <button class="pill-dark" data-act="tryDraft">${ic('camera')}Try it</button></div></div>
    </div>`, `<button class="btn btn-secondary" data-act="improveDraft">${ic('pencil')}Improve</button><button class="btn btn-primary" data-act="confirmSkill">Confirm</button>`);
  },
};

SCREENS.added = {
  title: 'Added to my skills',
  render() {
    const d = S.draft, upd = d.wasUpdate;
    return page(`${navClose()}<div class="main center">
      <div class="success">${ic('check')}</div>
      <div class="title tc"><h1 class="h2">${upd ? `${esc(d.name)} is updated` : 'Added to My visual skills'}</h1><p class="sub">${upd ? 'Your changes show up the next time you snap.' : 'Find it anytime on Home, next to your other skills.'}</p></div>
      ${skillRow(d, `${d.cat} · ${d.short}`, `<button class="pill-line" data-act="tryDraft">${ic('camera')}Try it</button>`)}
      <section class="sec w100"><h2 class="h3">My visual skills</h2><div class="skills-row">${mySkills().map((s) => skAvatar({ ...s, fresh: s.id === d.id })).join('')}</div></section>
    </div>`, '<button class="btn btn-primary" data-act="tryDraft">Try it now</button><button class="btn btn-text" data-act="backToCreate">Back to Create</button>');
  },
};

const improveIdeas = (d) => (d.cat === 'Fashion' || d.cat === 'Sneakers' ? ['Make it more casual', 'Rate shoes too', 'Shorter tips', 'Add seasonal advice'] : ['Shorter tips', 'Add seasonal advice', 'More color advice', 'Tips for a dinner party']);
const improveExample = (d) => (d.cat === 'Fashion' ? 'Suggest more casual outfits for weekends, and rate my shoes and accessories too.' : 'Make the tips shorter and add seasonal advice.');
SCREENS.improve = {
  title: 'Improve',
  render() {
    const d = S.draft;
    return page(`${navBack()}<div class="main">
      <h1 class="h2">How would you like to improve ${esc(d.name)}?</h1>
      ${skillRow(d, d.desc)}
      <section class="sec"><h2 class="h3">Try asking</h2><div class="chips">${improveIdeas(d).map((x) => `<button class="chip" data-act="appendImprove" data-v="${x}">${x}</button>`).join('')}</div></section>
    </div>`, composer({ id: 'imp-text', ph: 'Tell Chance what to change…', val: S.c.improve, inp: 'improveText', ai: 'improveAI', mic: 'improveMic', send: 'improveSend', label: 'What to change', file: 'topicPhoto' }));
  },
};
SCREENS.changes = {
  title: 'Check your changes',
  render() {
    const d = S.draft;
    return page(`${navBack()}<div class="main">
      <div class="title"><p class="eyebrow">Improve</p><h1 class="h1">Check your changes</h1><p class="sub">We’ll update ${esc(d.name)} with this.</p></div>
      <section class="sec"><h2 class="h3">Your skill</h2>${skillRow(d, `${d.cat} · ${d.short}`)}</section>
      <section class="sec"><h2 class="h3">Your request</h2><div class="req">${esc(S.c.improve)}</div></section>
      <section class="sec"><h2 class="h3">What will change</h2><div class="chips">${changesFrom(S.c.improve).map((c, i) => `<span class="chip blue new" style="animation-delay:${i * 0.09}s">${ic('spark')}${esc(c.label)}</span>`).join('')}</div></section>
    </div>`, `<button class="btn btn-secondary" data-back>${ic('pencil')}Edit my response</button><button class="btn btn-primary" data-act="changesConfirm">Confirm</button>`);
  },
};
