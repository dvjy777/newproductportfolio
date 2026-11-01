// Dynamic Island navigation for the prototype (added for the portfolio embed).
// Tapping the island opens every step of the prototype; picking one jumps there.
// The original side panel stays in the page, hidden, and still does the jumping.
(function () {
  const island = document.querySelector('.island');
  const panel = document.getElementById('panel');
  if (!island || !panel) return;

  // the menu, built from the panel's own step lists
  const menu = document.createElement('div');
  menu.className = 'is-menu';
  panel.querySelectorAll('nav.flow').forEach((nav) => {
    const h = nav.querySelector('h4');
    if (h) menu.appendChild(h.cloneNode(true));
    const ol = document.createElement('ol');
    nav.querySelectorAll('[data-jump]').forEach((b) => {
      const li = document.createElement('li');
      const c = b.cloneNode(true);
      c.removeAttribute('aria-current');
      c.addEventListener('click', (e) => { e.stopPropagation(); b.click(); close(); });
      li.appendChild(c); ol.appendChild(li);
    });
    menu.appendChild(ol);
  });
  const ctrl = document.createElement('div');
  ctrl.className = 'is-ctrl';
  [['restart', 'Restart'], ['hotspots', 'Show tap targets']].forEach(([id, label]) => {
    const orig = document.getElementById(id);
    if (!orig) return;
    const c = document.createElement('button');
    c.type = 'button'; c.textContent = label;
    if (id === 'hotspots') c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', (e) => {
      e.stopPropagation(); orig.click();
      if (id === 'hotspots') c.setAttribute('aria-pressed', orig.getAttribute('aria-pressed'));
      else close();
    });
    ctrl.appendChild(c);
  });
  menu.appendChild(ctrl);
  const x = document.createElement('button');
  x.className = 'is-close'; x.type = 'button'; x.setAttribute('aria-label', 'Close steps'); x.textContent = '×';
  x.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  menu.appendChild(x);

  const peek = document.createElement('div');
  peek.className = 'is-peek';
  peek.innerHTML = '<span class="dot"></span><span class="t"></span>';
  island.append(peek, menu);
  island.setAttribute('role', 'button');
  island.setAttribute('tabindex', '0');
  island.setAttribute('aria-label', 'Show all prototype steps');

  function open() { island.classList.remove('peek'); island.classList.add('open'); island.setAttribute('aria-expanded', 'true'); syncOn(); }
  function close() { island.classList.remove('open'); island.setAttribute('aria-expanded', 'false'); }
  island.addEventListener('click', () => { if (!island.classList.contains('open')) open(); });
  island.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !island.classList.contains('open')) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && island.classList.contains('open')) { e.stopPropagation(); close(); } }, true);
  document.addEventListener('click', (e) => { if (island.classList.contains('open') && !island.contains(e.target)) close(); });

  // keep the highlighted step in the island in step with the hidden panel
  function syncOn() {
    const on = panel.querySelector('.fl.on');
    menu.querySelectorAll('[data-jump]').forEach((b) => b.classList.toggle('on', !!on && b.dataset.jump === on.dataset.jump));
  }
  let peekT = null;
  function show(text, ms) {
    if (island.classList.contains('open')) return;
    peek.querySelector('.t').textContent = text;
    island.classList.add('peek');
    clearTimeout(peekT);
    peekT = setTimeout(() => island.classList.remove('peek'), ms);
  }
  const orig = window.onRoute;
  window.onRoute = (t) => {
    orig && orig(t);
    syncOn();
    const on = panel.querySelector('.fl.on');
    if (on) {
      const n = on.querySelector('.n')?.textContent.trim();
      const name = [...on.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join('').trim();
      show((n && n !== '·' ? n + ' · ' : '') + name, 1600);
    }
  };
  setTimeout(() => show('Tap for all steps', 2600), 900);
})();
