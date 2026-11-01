'use strict';
/* Results: Learn, Ask, skill ratings, tarot, dot art, palette. */

function snapL() {
  if (!S.snap.learn) S.snap = { mode: 'snap', photo: IMG('bottle'), pos: '50% 50%', learn: { ...D.LEARN.bottle, thumb: IMG('bottle-thumb') }, convo: [] };
  return S.snap.learn;
}
const SEG = (a) => `<div class="seg" role="tablist" aria-label="View"><span class="knob"></span>
  <button class="${a === 'learn' ? 'on' : ''}" data-act="seg" data-v="learn" role="tab" aria-selected="${a === 'learn'}">Learn</button>
  <button class="${a === 'ask' ? 'on' : ''}" data-act="seg" data-v="ask" role="tab" aria-selected="${a === 'ask'}">Ask</button></div>`;
function segKnob(el, btn) {
  const seg = $('.seg', el);
  if (!seg) return;
  const on = btn || $('button.on', seg), k = $('.knob', seg);
  k.style.left = `${on.offsetLeft}px`;
  k.style.width = `${on.offsetWidth}px`;
}

SCREENS.learn = {
  title: 'Results · Learn',
  render() {
    const L = snapL(), P = S.snap;
    return `<div class="body lr">
      <div class="lr-bg"><img src="${P.photo}" style="object-position:${P.pos}" alt=""></div>
      <div class="lr-hero"><img src="${P.photo}" style="object-position:${P.pos}" alt="${esc(L.name)}"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i></div>
      <div class="idcard">
        <div class="id-top"><div class="id-th"><img src="${L.thumb || P.photo}" alt=""></div><div class="id-tx"><h1>${esc(L.name)}</h1>${L.meta ? `<p>${esc(L.meta)}</p>` : ''}</div></div>
        <div class="id-row">${L.price ? `<b class="price">${esc(L.price)}</b>` : '<span class="price"></span>'}${L.store ? '<button class="pill" data-act="store">Store ↗</button>' : ''}<span class="pill soft">${ic('check')}${esc(L.match)}</span></div>
      </div>
      <div class="pills-scroll">${L.pills.map((p) => `<button class="pill" data-act="askQ" data-q="${esc(p)}">${esc(p)}</button>`).join('')}</div>
      <article class="story"><span class="ey">${esc(L.eyebrow)} ›</span><h2>${esc(L.headline)}</h2><p>${esc(L.body)}</p>${L.more ? `<p class="more" hidden>${esc(L.more)}</p><button class="readmore" data-act="readMore">Read more</button>` : ''}</article>
      ${L.similar?.length ? `<section class="similar"><div class="sec-h"><h2 style="font-weight:700;font-size:17px">Similar vibe</h2><button style="font-weight:600;font-size:14px" data-act="saveAll">Save all</button></div>
        <div class="sim-row">${L.similar.map((s) => `<div class="sim"><div class="ph"><img src="${IMG(s.img)}" alt=""></div><button class="heart" data-act="heart" aria-label="Save ${esc(s.name)}" aria-pressed="false">${ic('heart')}</button><span>${esc(s.name)}</span></div>`).join('')}</div></section>` : ''}
      <div class="lr-end"></div>
    </div>
    ${SB()}
    <button class="glass-c lr-back" data-act="closeSnap" aria-label="Back">${ic('chevL')}</button>
    ${SEG('learn')}
    <button class="askbar" data-act="openAsk"><span class="cb">${ic('target')}</span><span>Ask about this ${esc(L.noun || 'photo')}…</span></button>`;
  },
  mount(el) { requestAnimationFrame(() => segKnob(el)); },
};

/* ---------- Ask ---------- */
function fmtAns(text, streaming) {
  const lines = String(text).split('\n').map((s) => s.trim()).filter(Boolean);
  let html = '';
  let list = [];
  const flush = () => { if (list.length) { html += `<ul>${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`; list = []; } };
  lines.forEach((l) => {
    const m = l.match(/^(?:[•*]|-(?=\s)|\d+[.)])\s*(.*)$/);
    const clean = (s) => s.replace(/\*\*/g, '');
    if (m) list.push(clean(m[1]));
    else { flush(); html += `<p>${esc(clean(l))}</p>`; }
  });
  flush();
  if (streaming) html = html ? html.replace(/(<\/li><\/ul>|<\/p>)$/, '<span class="caret"></span>$1') : '<span class="caret"></span>';
  return html;
}
async function streamText(ans, text, scroller) {
  for (let i = 3; i < text.length + 3; i += 3) {
    if (!ans.isConnected) return;
    ans.innerHTML = fmtAns(text.slice(0, i), i < text.length);
    scroller.scrollTop = scroller.scrollHeight;
    await wait(16);
  }
}
const qaHTML = (e) => `<div class="qa"><p class="you">You asked</p><h3 class="q">${esc(e.q)}</h3>
  <div class="who"><span class="av">${ic('target')}</span>Chance</div>
  <div class="ans">${e.a ? fmtAns(e.a.text) : '<span class="thinking">Looking at your photo…</span>'}</div>${e.a?.src ? `<span class="src">${esc(e.a.src)}</span>` : ''}</div>`;
function suggList(L) {
  const asked = new Set(S.snap.convo.map((c) => c.q));
  return (L.asks || L.pills).filter((q) => !asked.has(q));
}
function refreshSugg(el) {
  const L = snapL();
  $('.sugg', el).innerHTML = suggList(L).map((q) => `<button class="sug" data-act="askHere" data-q="${esc(q)}">${esc(q)}</button>`).join('');
}
function askPrompt(L, q) {
  const hist = S.snap.convo.filter((c) => c.a && c.q !== q).slice(-3).map((c) => `Q: ${c.q}\nA: ${c.a.text}`).join('\n\n');
  return `You are Chance, the visual assistant in the Chance AI phone app. The user just photographed: ${L.name}${L.meta ? ` (${L.meta})` : ''}${L.price ? `, usually ${L.price}` : ''}. ${L.body || ''}
${hist ? `Earlier in this chat:\n${hist}\n` : ''}
New question: ${q}

Answer in two or three short lines, each starting with "• ". Plain text only: no markdown, no headings, under 70 words. If you aren't sure of a fact, say so briefly.`;
}
async function ask(el, q) {
  const L = snapL();
  const entry = { q, a: null };
  S.snap.convo.push(entry);
  const convo = $('.convo', el);
  $('.ask-empty', convo)?.remove();
  convo.insertAdjacentHTML('beforeend', qaHTML(entry));
  const block = convo.lastElementChild, ans = $('.ans', block);
  convo.scrollTo({ top: convo.scrollHeight, behavior: RM ? 'auto' : 'smooth' });
  refreshSugg(el);
  const canned = L.qa?.[q];
  try {
    if (canned) {
      const t = canned.b.map((b) => `• ${b}`).join('\n');
      await wait(700);
      await streamText(ans, t, convo);
      entry.a = { text: t, src: canned.src };
    } else if (AI) {
      const res = await AI(askPrompt(L, q), { cache: false, modelTier: 'quick', onText: ({ text }) => { if (ans.isConnected) { ans.innerHTML = fmtAns(text, true); convo.scrollTop = convo.scrollHeight; } } });
      entry.a = { text: res.text, src: 'Answered live by Claude' };
    } else {
      const t = '• In the full app, Chance answers this from your photo and the product page.\n• For this demo, tap one of the suggested questions below.';
      await wait(600);
      await streamText(ans, t, convo);
      entry.a = { text: t, src: 'Prototype answer' };
    }
  } catch (e) {
    entry.a = { text: e?.code === 'not_granted' ? '• I need your OK to answer new questions. Allow Claude, then ask again.' : '• I couldn’t answer that just now. Try again in a moment.', src: '' };
  }
  if (!block.isConnected) return;
  ans.innerHTML = fmtAns(entry.a.text);
  if (entry.a.src) ans.insertAdjacentHTML('afterend', `<span class="src">${esc(entry.a.src)}</span>`);
  convo.scrollTo({ top: convo.scrollHeight, behavior: RM ? 'auto' : 'smooth' });
}

SCREENS.ask = {
  title: 'Ask',
  render() {
    const L = snapL(), P = S.snap;
    const meta = [...(L.meta ? L.meta.split(' · ').slice(0, 2) : []), L.price].filter(Boolean).join(' · ');
    return `<div class="ask-photo"><img src="${P.photo}" style="object-position:${P.pos}" alt="${esc(L.name)}"></div>
      ${SB()}
      <button class="glass-c ask-close" data-act="closeSnap" aria-label="Close">${ic('x')}</button>
      ${SEG('ask')}
      <div class="ask-sheet">
        <div class="prod"><img class="prod-th" src="${P.photo}" style="object-position:${P.pos}" alt=""><div class="prod-tx"><b>${esc(L.name)}</b><span>${esc(meta)}</span></div><span class="pill soft sm">${ic('check')}${esc(L.match)}</span></div>
        <div class="convo">${S.snap.convo.length ? S.snap.convo.map(qaHTML).join('') : `<div class="ask-empty"><p class="you">Ask Chance</p><h3 class="q">What do you want to know about this ${esc(L.noun || 'photo')}?</h3></div>`}</div>
        <div class="sugg"></div>
        <form class="abar" data-form="ask"><span>${ic('plus')}</span><input id="ask-in" data-in="askInput" placeholder="Ask about this photo" autocomplete="off" aria-label="Ask about this photo"><button class="ab-send" type="submit" aria-label="Send">${ic('up')}</button></form>
      </div>`;
  },
  mount(el, d) {
    refreshSugg(el);
    requestAnimationFrame(() => segKnob(el));
    const convo = $('.convo', el);
    convo.scrollTop = convo.scrollHeight;
    if (d.q && !d.asked) { d.asked = true; setTimeout(() => ask(el, d.q), 260); }
    else if (d.focus && !d.focused) { d.focused = true; setTimeout(() => $('#ask-in', el)?.focus(), 420); }
  },
};

/* ---------- skill results ---------- */
function countUp(n) {
  if (!n) return;
  const to = Number(n.dataset.to), t0 = performance.now(), dms = RM ? 1 : 1100;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dms), e = 1 - Math.pow(1 - p, 3);
    n.textContent = (to * e).toFixed(1);
    if (p < 1 && n.isConnected) requestAnimationFrame(step);
  };
  setTimeout(() => requestAnimationFrame(step), 300);
}
const resTop = (m, light) => `${SB(light ? 'light' : '')}<button class="glass-c res-close" data-act="closeSnap" aria-label="Close">${ic('x')}</button><span class="res-skill">${ic(m.icon)}${esc(m.name)}</span>`;

SCREENS.rating = {
  title: 'Skill result',
  render(d) {
    const m = modeById(d.mode), R = d.r;
    return `<div class="res-photo"><img src="${d.src}" style="object-position:${d.pos}" alt="Your photo"></div>
      ${resTop(m)}
      <div class="res-sheet">
        <div class="score"><div class="ring"><svg viewBox="0 0 88 88" aria-hidden="true"><circle class="rt" cx="44" cy="44" r="38"/><circle class="rp" cx="44" cy="44" r="38" style="--p:${R.score / 10}"/></svg>
          <b><span class="cnt" data-to="${R.score}">${RM ? R.score.toFixed(1) : '0.0'}</span><small>out of 10</small></b></div>
          <div class="vd"><p class="eyebrow">${esc(R.eyebrow || 'Your photo')}</p><h1>${esc(R.verdict)}</h1>${R.summary ? `<p>${esc(R.summary)}</p>` : ''}</div></div>
        <div class="bars">${R.bars.map((b, i) => `<div class="bar"><span class="lbl">${esc(b.l)}${b.fresh ? '<em>New</em>' : ''}</span><span class="track"><span class="fill" style="width:${b.v * 10}%; animation-delay:${0.4 + i * 0.08}s"></span></span><span class="v">${b.v}</span></div>`).join('')}</div>
        <h2 class="tips-h">Quick tips</h2>
        ${R.tips.map((t) => `<div class="tip ${t.fresh ? 'fresh' : ''}"><span class="n">${ic('spark')}</span><p>${esc(t.t)}</p></div>`).join('')}
      </div>
      <div class="res-foot">${m.skill ? `<button class="btn btn-secondary" data-act="improveSkill" data-id="${m.id}">${ic('pencil')}Improve</button>` : '<button class="btn btn-secondary" data-act="saveToast" data-msg="Saved to your looks">Save look</button>'}
        <button class="btn btn-primary" data-act="snapAgain" data-mode="${m.id}">${ic('target')}Snap again</button></div>`;
  },
  mount(el) { countUp($('.cnt', el)); },
};

SCREENS.tarot = {
  title: 'Daily Tarot',
  render(d) {
    const m = modeById(d.mode);
    return `<div class="tr-stage"><div class="card3d"><div class="face back">${ic('moon')}</div><div class="face front" role="img" aria-label="The Sun tarot card"></div></div></div>
      ${resTop(m, true)}
      <div class="res-sheet tr-sheet" style="color:var(--ink)">
        <p class="eyebrow">Today’s card</p><h1 class="h2" style="margin-top:4px">The Sun</h1><p class="tr-kw">Warmth · clarity · good news</p>
        <p class="tr-read">A bright card for today. Say yes to the thing you’ve been circling, and let people see the work while it’s still rough.</p>
        <div class="tr-meta"><span><b>Do</b>Start the small version today.</span><span><b>Skip</b>Waiting for perfect timing.</span></div>
      </div>
      <div class="res-foot"><button class="btn btn-secondary" data-act="saveToast" data-msg="Card saved to your journal">Save card</button><button class="btn btn-primary" data-act="snapAgain" data-mode="${m.id}">${ic('target')}Snap again</button></div>`;
  },
  mount(el) { setTimeout(() => $('.card3d', el)?.classList.add('flipped'), RM ? 0 : 650); },
};

/* dot art, drawn from the photo on a canvas */
async function drawDots(canvas, src, style) {
  const img = await loadImg(src);
  const N = 34, SZ = canvas.width, cell = SZ / N;
  const sm = document.createElement('canvas');
  sm.width = N; sm.height = N;
  const sx = sm.getContext('2d', { willReadFrequently: true });
  const k = Math.max(N / img.naturalWidth, N / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
  sx.drawImage(img, (N - w) / 2, (N - h) / 2, w, h);
  const px = sx.getImageData(0, 0, N, N).data;
  const x = canvas.getContext('2d');
  const token = (canvas._tok = (canvas._tok || 0) + 1);
  x.fillStyle = style === 'ink' ? '#f7f4ee' : style === 'blue' ? '#1631f3' : '#f3f1ed';
  x.fillRect(0, 0, SZ, SZ);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const p = (j * N + i) * 4, r = px[p], g = px[p + 1], b = px[p + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      let rad = cell * 0.44, col = `rgb(${r},${g},${b})`;
      if (style === 'ink') { rad = (1 - lum) * cell * 0.58 + 0.8; col = '#0b0b0d'; }
      if (style === 'blue') { rad = lum * cell * 0.52 + 0.8; col = '#ffffff'; }
      x.beginPath(); x.arc(i * cell + cell / 2, j * cell + cell / 2, rad, 0, Math.PI * 2); x.fillStyle = col; x.fill();
    }
    if (!RM && j % 2) { await new Promise(requestAnimationFrame); if (canvas._tok !== token) return; }
  }
}
SCREENS.dot = {
  title: 'Dot Your Photo',
  render(d) {
    const m = modeById(d.mode);
    return `${SB('solid')}<div class="body"><div class="pad-top"></div>
      <div class="nav"><button class="ib" data-act="closeSnap" aria-label="Close">${ic('x')}</button><span class="pill soft" style="cursor:default">${ic(m.icon)}${esc(m.name)}</span></div>
      <div class="dot-wrap" style="padding-top:14px">
        <div class="title"><p class="eyebrow">Your remix</p><h1 class="h2">Made of 1,156 dots</h1></div>
        <div class="dot-canvas"><canvas width="700" height="700" aria-label="Dot art version of your photo"></canvas></div>
        <div class="chips">${[['color', 'Color'], ['ink', 'Ink'], ['blue', 'Blueprint']].map(([k, l], i) => `<button class="chip ${i ? '' : 'on'}" data-act="dotStyle" data-v="${k}">${l}</button>`).join('')}</div>
        <p class="sub">Each dot is one patch of your photo. Pick a style, then save it.</p>
      </div><div style="height:24px"></div></div>
      <div class="foot" style="flex-direction:row"><button class="btn btn-secondary" style="flex:1" data-act="saveToast" data-msg="Saved to Photos">${ic('download')}Save</button><button class="btn btn-primary" style="flex:1" data-act="snapAgain" data-mode="${m.id}">${ic('target')}Snap again</button></div>`;
  },
  mount(el, d) { drawDots($('canvas', el), d.src, d.style || 'color').catch(() => toast('Couldn’t draw that photo.')); },
};

/* palette: real color extraction from the photo */
function hexOf(r, g, b) { return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`; }
function hslOf(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const dd = mx - mn, s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
  const h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
  return [h * 60, s, l];
}
function hslHex(h, s, l) {
  const f = (n) => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); };
  return hexOf(f(0), f(8), f(4));
}
function colorName(hex) {
  const [h, s, l] = hslOf(hex);
  if (s < 0.14 || (s < 0.24 && (l > 0.86 || l < 0.14))) {
    if (l > 0.9) return 'White';
    if (l > 0.7) return h > 20 && h < 70 && s > 0.06 ? 'Cream' : 'Light grey';
    if (l > 0.45) return h > 15 && h < 60 && s > 0.06 ? 'Stone' : 'Grey';
    return l > 0.2 ? 'Charcoal' : 'Black';
  }
  let n;
  if (h < 15 || h >= 345) n = l < 0.35 ? 'Burgundy' : 'Red';
  else if (h < 40) n = l < 0.4 ? 'Brown' : s < 0.55 ? 'Camel' : 'Orange';
  else if (h < 65) n = l < 0.42 ? 'Olive' : s < 0.5 ? 'Sand' : 'Mustard';
  else if (h < 160) n = s < 0.3 ? 'Sage' : l < 0.35 ? 'Forest green' : 'Green';
  else if (h < 200) n = 'Teal';
  else if (h < 250) n = l < 0.32 ? 'Navy' : s < 0.38 ? 'Denim' : 'Blue';
  else if (h < 290) n = 'Purple';
  else n = l > 0.7 ? 'Blush' : 'Pink';
  return l > 0.8 && !/Blush|Sand/.test(n) ? `Pale ${lc(n)}` : n;
}
async function extractPalette(src) {
  const img = await loadImg(src);
  const W = 80, H = Math.max(1, Math.round((80 * img.naturalHeight) / img.naturalWidth));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, B = new Map();
  for (let i = 0; i < d.length; i += 4) {
    const k = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
    const b = B.get(k) || [0, 0, 0, 0];
    b[0] += d[i]; b[1] += d[i + 1]; b[2] += d[i + 2]; b[3]++;
    B.set(k, b);
  }
  const cands = [...B.values()].map((b) => { const hex = hexOf(b[0] / b[3], b[1] / b[3], b[2] / b[3]); return { hex, rgb: [b[0] / b[3], b[1] / b[3], b[2] / b[3]], w: b[3] * (0.35 + hslOf(hex)[1]) }; }).sort((a, b) => b.w - a.w);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const out = [];
  for (const cd of cands) { if (out.every((o) => dist(o.rgb, cd.rgb) > 54)) out.push(cd); if (out.length === 5) break; }
  const hexes = out.map((o) => o.hex);
  const lead = [...hexes].sort((a, b) => hslOf(b)[1] - hslOf(a)[1])[0] || '#888888';
  const [h] = hslOf(lead);
  const avgL = hexes.reduce((s, x2) => s + hslOf(x2)[2], 0) / (hexes.length || 1);
  const go = [hslHex((h + 180) % 360, 0.5, 0.48), hslHex((h + 20) % 360, 0.4, 0.62), avgL > 0.5 ? '#3a393f' : '#efe7da'];
  return { hexes, go, names: hexes.map(colorName), goNames: go.map(colorName) };
}
SCREENS.palette = {
  title: 'Palette',
  render(d) {
    const m = modeById(d.mode), P = d.pal || { hexes: [], go: [], names: [], goNames: [] };
    const ink = (hex) => (hslOf(hex)[2] > 0.6 ? '#0b0b0d' : '#ffffff');
    return `<div class="res-photo" style="height:300px"><img src="${d.src}" style="object-position:${d.pos}" alt="Your photo"></div>
      ${resTop(m)}
      <div class="res-sheet" style="top:268px">
        <p class="eyebrow">${esc(m.name)}</p><h1 class="h2" style="margin-top:4px">Your colors</h1>
        <div class="pal-strip">${P.hexes.map((h, i) => `<button style="background:${h}; color:${ink(h)}; animation-delay:${0.15 + i * 0.07}s" data-act="copyHex" data-v="${h}" aria-label="Copy ${h}">${h.toUpperCase()}</button>`).join('')}</div>
        <h2 class="tips-h">Goes with</h2>
        <div class="pal-go">${P.go.map((h, i) => `<div><i style="background:${h}"></i>${esc(P.goNames[i])}</div>`).join('')}</div>
        <p class="pal-tip">${esc(P.names[0] || 'The main color')} and ${esc(lc(P.names[1] || 'its neighbor'))} lead this photo. Pair them with ${esc(lc(P.goNames[0] || 'a contrast color'))} for contrast, or keep it calm with ${esc(lc(P.goNames[2] || 'a neutral'))}.</p>
      </div>
      <div class="res-foot">${m.skill ? `<button class="btn btn-secondary" data-act="improveSkill" data-id="${m.id}">${ic('pencil')}Improve</button>` : ''}<button class="btn btn-primary" data-act="snapAgain" data-mode="${m.id}">${ic('target')}Snap again</button></div>`;
  },
};
