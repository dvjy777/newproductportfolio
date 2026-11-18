/* ---------- card flip on the Visual skills gallery ----------
   Tapping a community card no longer jumps straight to the camera. It dips, lifts to the centre while the
   gallery blurs, and turns over to show what the skill does, who made it and how popular it is.
   Swipe sideways for the next card, pull down (or tap the card's top) for the full details,
   tap ↻ or outside the card to put it back. Try it on the back opens the camera as before. */
(function () {
  const fxApp = document.getElementById('app');
  const RMF = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAMES = { 'mina.k': ['Mina Kim', '3.4k'], 'jun.eats': ['Jun Park', '2.1k'], 'sora.draws': ['Sora Lee', '1.8k'], 'lena.home': ['Lena Park', '5.1k'], 'dani.fits': ['Dani Cruz', '2.7k'], 'rio.walks': ['Rio Tan', '940'] };
  // each back takes a warm or cool tint from its own photo
  const TINT = { coat: '#c49a6c', coffee: '#b9967a', art: '#c9b27a', chair: '#c7a982', sneakers: '#a8a29a', 'hero-chair': '#b5a283', desk: '#a9a296', gadgets: '#9fa6ad', tarot: '#8f86a8' };
  const MORE_IMG = ['coat', 'sneakers', 'art', 'coffee', 'chair', 'desk', 'gadgets', 'tarot'];
  const TOPIC = { 'sc-wardrobe': ['Style', 'Fashion'], 'sc-cafe': ['Food', 'Café'], 'sc-gallery': ['Art', 'Learn'], 'sc-study': ['Interiors', 'Focus'], 'sc-remix': ['Style', 'Fashion'], 'sc-plant': ['Home', 'Nature'] };

  const fx = document.createElement('div');
  fx.className = 'fx'; fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = '<div class="fx-veil"></div><div class="fx-card"><div class="fx-flip"><div class="fx-face fx-front"></div><div class="fx-face fx-back" role="dialog" aria-label="Skill details"></div></div></div>' +
    '<div class="fx-hint"><div class="fx-dots"></div>Swipe for the next card · tap ↻ to flip back<br>Swipe down to see full details</div>';
  fxApp.appendChild(fx);
  const card = fx.querySelector('.fx-card'), front = fx.querySelector('.fx-front'), backEl = fx.querySelector('.fx-back'), hint = fx.querySelector('.fx-hint'), dotsEl = fx.querySelector('.fx-dots');

  let list = [], cur = -1, src = null, state = 'idle', busy = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, RMF ? Math.min(ms, 40) : ms));
  const scale = () => fxApp.getBoundingClientRect().width / fxApp.offsetWidth || 1;
  function rectOf(el) { const a = fxApp.getBoundingClientRect(), r = el.getBoundingClientRect(), k = scale(); return [(r.left - a.left) / k, (r.top - a.top) / k, r.width / k, r.height / k]; }
  function place(r) { card.style.left = r[0] + 'px'; card.style.top = r[1] + 'px'; card.style.width = r[2] + 'px'; card.style.height = r[3] + 'px'; }
  const W = () => fxApp.offsetWidth, H = () => fxApp.offsetHeight;
  function liftRect(g) { const w = Math.min(W() - 84, 290), h = Math.min(H() * 0.62, w * g[3] / g[2]); return [(W() - w) / 2, (H() - h) / 2 - 10, w, h]; }
  function backRect() { const top = 58, h = Math.min(H() - top - 92, 560); return [14, top, W() - 28, h]; }
  const FULL = () => [0, 0, W(), H()];

  function dataOf(el) {
    const sk = el.dataset.sk, c = D.COMMUNITY.find((x) => x.sk === sk) || {}, s = D.SHOWCASE[sk] || {};
    const rank = [...D.COMMUNITY].sort((a, b) => b.likes - a.likes).findIndex((x) => x.sk === sk) + 1;
    return { el, sk, c, s, rank };
  }
  function backHtml(d) {
    const n = NAMES[d.c.user] || [d.c.user, '1k'], tags = TOPIC[d.sk] || ['Skill'], more = MORE_IMG.filter((m) => m !== d.c.img).slice(0, 3);
    const others = D.COMMUNITY.filter((x) => x.sk !== d.sk).slice(0, 3);
    const tries = d.c.likes * 5 >= 1000 ? (d.c.likes * 5 / 1000).toFixed(1) + 'k' : String(d.c.likes * 5);
    return `<div class="fx-grab"></div><button class="fx-ib fx-close-x" data-fx="collapse" aria-label="Show less"><svg class="i" style="transform:rotate(-90deg)" aria-hidden="true"><use href="#i-chevL"/></svg></button>
      <div class="fx-head">${orb(d.c.img)}<div class="fx-ttl"><b>${esc(d.s.name || 'Skill')}</b><div class="fx-tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>
        <button class="fx-ib" data-fx="close" aria-label="Flip back">${ic('flip')}</button></div>
      <div class="fx-g fx-who"><span class="fx-ava" style="background:${d.c.color}">${esc(d.c.init)}</span><div><b>${esc(n[0])}</b><small>@${esc(d.c.user)} · ${n[1]} followers</small></div><button class="fx-follow" data-fx="follow">Follow</button></div>
      <div class="fx-g fx-what"><div class="fx-lbl">What it does</div><p>${esc(d.s.desc || '')}</p><small>${esc(d.s.short || '')}</small></div>
      <div class="fx-stats"><div class="fx-g"><b>#${d.rank}</b><small>in ${esc(tags[0])} this week</small></div><div class="fx-g"><b>${tries}</b><small>tries</small></div></div>
      <div class="fx-g fx-more"><div class="sec-row">More from @${esc(d.c.user)}<em>See all ›</em></div><div class="row">${more.map((m, i) => `<div><img src="${IMG(m)}" alt=""><span>${['Layer Up', 'Color Match', 'Second Look'][i]}</span></div>`).join('')}</div></div>
      <div class="fx-extra">
        <div class="fx-g fx-more" style="margin-bottom:8px"><div class="sec-row">Similar skills<em>See all ›</em></div><div class="row">${others.map((o) => `<div><img src="${IMG(o.img)}" alt=""><span>${esc((D.SHOWCASE[o.sk] || {}).name || '')}</span></div>`).join('')}</div></div>
        <div class="fx-g fx-what" style="margin-bottom:8px"><div class="fx-lbl">People who tried it</div><p>${tries} people tried this skill. Most snap it in the morning, right before heading out.</p></div>
      </div>
      <div class="fx-acts"><button class="fx-like" data-fx="like" aria-pressed="false">♡ ${d.c.likes}</button><button class="fx-try" data-fx="try">Try it</button><button class="fx-share" data-fx="share">Share</button></div>`;
  }
  function load(i) {
    cur = i; const d = dataOf(list[i]);
    fx.style.setProperty('--tint', TINT[d.c.img] || '#b8b0a4'); backEl.style.setProperty('--tint', TINT[d.c.img] || '#b8b0a4');
    const clone = list[i].cloneNode(true); clone.removeAttribute('data-act'); clone.tabIndex = -1; front.replaceChildren(clone);
    backEl.innerHTML = backHtml(d); backEl.scrollTop = 0;
    dotsEl.innerHTML = list.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
    list.forEach((el, k) => { el.style.visibility = k === i ? 'hidden' : ''; });
  }
  function posHint() { const r = backRect(); hint.style.top = (r[1] + r[3] + 14) + 'px'; }

  async function open(el) {
    if (busy) return; busy = true;
    list = [...el.closest('.scr').querySelectorAll('.masonry .gcard')]; const i = list.indexOf(el); if (i < 0) { busy = false; return; }
    const g = rectOf(el);
    card.className = 'fx-card still'; place(g); load(i); void card.offsetWidth; card.classList.remove('still');
    fx.classList.add('on'); fx.setAttribute('aria-hidden', 'false'); posHint();
    card.classList.add('quick'); card.style.transform = 'scale(.95)'; await wait(150); card.style.transform = ''; await wait(150); card.classList.remove('quick');
    fx.classList.add('lifted'); place(liftRect(g)); await wait(480);
    fx.classList.add('flipped'); place(backRect()); await wait(760);
    fx.classList.add('reading'); state = 'back'; busy = false;
    backEl.querySelector('[data-fx=close]')?.focus({ preventScroll: true });
  }
  async function close() {
    if (busy) return; busy = true;
    if (state === 'expanded') await collapse(true);
    fx.classList.remove('reading', 'flipped');
    const g = rectOf(list[cur]); place(liftRect(g)); await wait(700);
    fx.classList.remove('lifted'); place(rectOf(list[cur])); await wait(500);
    list.forEach((el) => { el.style.visibility = ''; });
    fx.classList.remove('on'); fx.setAttribute('aria-hidden', 'true'); state = 'idle'; busy = false;
  }
  async function swipe(dir) {
    if (busy || list.length < 2) return; busy = true;
    const next = (cur + (dir < 0 ? 1 : list.length - 1)) % list.length;
    card.style.transform = `translateX(${dir * (W() + 40)}px) rotate(${dir * 6}deg)`; await wait(320);
    card.classList.add('still'); load(next); card.style.transform = `translateX(${-dir * (W() + 40)}px) rotate(${-dir * 6}deg)`;
    void card.offsetWidth; card.classList.remove('still'); card.style.transform = ''; await wait(420);
    busy = false;
  }
  async function expand() { if (busy) return; busy = true; fx.classList.remove('reading'); fx.classList.add('expanded'); place(FULL()); await wait(500); state = 'expanded'; busy = false; }
  async function collapse(inner) {
    if (busy && !inner) return; if (!inner) busy = true;
    fx.classList.remove('expanded'); backEl.scrollTop = 0; place(backRect()); await wait(480); fx.classList.add('reading'); state = 'back';
    if (!inner) busy = false;
  }

  // tapping a community card opens the flip instead of the camera
  fxApp.addEventListener('click', (e) => {
    const g = e.target.closest('.gcard');
    if (!g || fx.contains(g) || !g.closest('.masonry')) return;
    e.stopImmediatePropagation(); e.preventDefault(); open(g);
  }, true);

  fx.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fx]');
    if (b) {
      e.stopPropagation();
      const a = b.dataset.fx;
      if (a === 'close') close();
      else if (a === 'collapse') collapse();
      else if (a === 'follow') { b.classList.toggle('on'); b.textContent = b.classList.contains('on') ? 'Following' : 'Follow'; }
      else if (a === 'like') { const on = b.getAttribute('aria-pressed') !== 'true', n = +b.textContent.replace(/\D/g, '') + (on ? 1 : -1); b.setAttribute('aria-pressed', on); b.classList.toggle('on', on); b.textContent = (on ? '♥ ' : '♡ ') + n; }
      else if (a === 'share') toast('Link copied');
      else if (a === 'try') { const el = list[cur]; close().then(() => ACT.trySkill(el)); }
      return;
    }
    if (state === 'back' && !e.target.closest('.fx-card')) close();
  });
  // swipe sideways for the next card, pull down for the full details
  let down = null;
  fx.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY, Date.now()]; });
  fx.addEventListener('pointerup', (e) => {
    if (!down) return; const k = scale(), dx = (e.clientX - down[0]) / k, dy = (e.clientY - down[1]) / k; down = null;
    if (state === 'back') {
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) swipe(dx < 0 ? -1 : 1);
      else if (dy > 50 && Math.abs(dy) > Math.abs(dx)) expand();
    } else if (state === 'expanded' && dy > 70 && backEl.scrollTop <= 0) collapse();
  });
  document.addEventListener('keydown', (e) => {
    if (state === 'idle') return;
    if (e.key === 'Escape') close();
    if (state === 'back' && e.key === 'ArrowRight') swipe(-1);
    if (state === 'back' && e.key === 'ArrowLeft') swipe(1);
  });
  // leaving the gallery (tab bar, back, guide buttons) puts the card away at once
  window.__fxReset = () => { list.forEach((el) => { el.style.visibility = ''; }); fx.className = 'fx'; fx.setAttribute('aria-hidden', 'true'); state = 'idle'; busy = false; };
})();
