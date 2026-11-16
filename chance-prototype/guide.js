'use strict';
/* The guide: one liquid glass card beside the phone. It says what the current screen does,
   and offers a few next steps as buttons. It grows or shrinks to fit each screen. */
const GUIDE = {
  home: { k: 'Home', t: 'Your starting point', d: 'A Chance pick rotates at the top. Snap to Know reads anything you point at, and Create visual skill builds your own.',
    a: [['Snap to Know', 'camera'], ['Create a skill', 'interest'], ['Browse visual skills', 'community']] },
  camera: { k: 'Snap to Know · Camera', t: 'Point and tap', d: 'Aim at an object and tap the shutter. Swipe the skill names to change what Chance does with the photo.',
    a: [['Analyze a photo', 'analyzing'], ['Back to Home', 'home']] },
  analyzing: { k: 'Snap to Know · Analyzing', t: 'Reading the photo', d: 'Chance finds the object and reads it with the selected skill.',
    a: [['See the result', 'learn'], ['Back to Home', 'home']] },
  learn: { k: 'Snap to Know · Result', t: 'What Chance found', d: 'What the object is, where it comes from and how to use it, plus similar items.',
    a: [['Ask a follow-up', 'ask'], ['Take another photo', 'camera']] },
  ask: { k: 'Snap to Know · Ask', t: 'Ask about the photo', d: 'Type a question about what you snapped, or tap a suggestion.',
    a: [['Back to the result', 'learn'], ['Back to Home', 'home']] },
  interest: { k: 'Create · Step 1 of 5', t: 'Start from what you like', d: 'Instead of a blank chat, pick an interest to see skills made for it, with popular skills on top.',
    a: [['Choose a tool', 'tool'], ['Other topics', 'other']] },
  tool: { k: 'Create · Step 2 of 5', t: 'Choose a tool', d: 'Pick a ready-made idea, use a skill that already exists, or describe your own.',
    a: [['Build it', 'building'], ['Make my own', 'own']] },
  building: { k: 'Create · Step 3 of 5', t: 'Building your skill', d: 'Chance builds the skill and explains each step in plain words.',
    a: [['Skip to ready', 'ready']] },
  ready: { k: 'Create · Step 4 of 5', t: 'Your skill is ready', d: 'Preview the new skill, then add it to your skills or ask for changes.',
    a: [['Add to my skills', 'added'], ['Improve it', 'improve']] },
  added: { k: 'Create · Step 5 of 5', t: 'Added to my skills', d: 'The new skill now sits in My visual skills on Home, one tap from the camera.',
    a: [['Try it now', 'tryit'], ['Back to Home', 'home']] },
  tryit: { k: 'Create · Try it', t: 'Your skill in action', d: 'The camera now runs your new skill and shows its own result.',
    a: [['Create another', 'interest'], ['Back to Home', 'home']] },
  other: { k: 'Create · Other topics', t: 'Something else in mind?', d: 'More topics beyond your usual interests, or describe one yourself.',
    a: [['Describe your topic', 'describe'], ['Back to interests', 'interest']] },
  describe: { k: 'Create · Describe a topic', t: 'Say it in your own words', d: 'A few words are enough. Chance suggests skills and matching topics as you type.',
    a: [['Choose a tool', 'tool']] },
  own: { k: 'Create · Make my own', t: 'Describe your own skill', d: 'Write what the skill should do and add photos. The more detail, the better.',
    a: [['Check your request', 'review']] },
  review: { k: 'Create · Check your request', t: 'Before Chance builds it', d: 'See what Chance understood, and whether similar skills already exist.',
    a: [['Edit my request', 'edit'], ['Build it', 'building']] },
  edit: { k: 'Create · Edit your request', t: 'Change the details', d: 'Swap photos or reword the request, then check it again.',
    a: [['Check your request', 'review']] },
  improve: { k: 'Create · Improve', t: 'Make it better', d: 'Tell Chance what to change, or tap a suggestion.',
    a: [['Check the changes', 'changes']] },
  changes: { k: 'Create · Check your changes', t: 'Review the changes', d: 'See what will change before Chance updates the skill.',
    a: [['Back to ready', 'ready']] },
  skills: { k: 'Visual skills', t: 'Every skill in one place', d: 'Browse visual skills by topic and try any of them in the camera.',
    a: [['See the community', 'community'], ['Back to Home', 'home']] },
  community: { k: 'Visual skills · Community', t: 'What people are making', d: 'A gallery of real snaps, who made them and how many people liked them. Tap a card to try that skill.',
    a: [['Create a skill', 'interest'], ['Back to Home', 'home']] },
};
const guideEl = document.getElementById('guide');
let guideKey = '', guideTimer = 0;
const RMG = matchMedia('(prefers-reduced-motion: reduce)').matches;
// open on every new screen, then fold into a compact square after a few quiet seconds
function guideOpen() { guideEl.classList.remove('compact'); clearTimeout(guideTimer); }
function guideRest() {
  clearTimeout(guideTimer);
  guideTimer = setTimeout(() => { if (!guideEl.matches(':hover, :focus-within')) guideEl.classList.add('compact'); }, 7000);
}
if (guideEl) {
  guideEl.addEventListener('mouseenter', guideOpen);
  guideEl.addEventListener('focusin', guideOpen);
  guideEl.addEventListener('mouseleave', guideRest);
  guideEl.addEventListener('click', (e) => { if (guideEl.classList.contains('compact') && !e.target.closest('[data-jump]')) { guideOpen(); guideRest(); } });
}
function renderGuide(key) {
  const g = GUIDE[key] || GUIDE.home;
  if (!guideEl || key === guideKey) return;
  guideKey = key;
  const inner = guideEl.querySelector('.g-in');
  inner.innerHTML = `<h2 class="g-t">${esc(g.t)}</h2>` +
    `<div class="g-more"><div><p class="g-d">${esc(g.d)}</p></div></div>` +
    `<p class="g-hint" aria-hidden="true">Tap for details</p>`;
  // the next steps are their own glass cards, stacked under the guide card
  const acts = document.getElementById('guideActs');
  if (acts) acts.innerHTML = g.a.map(([l, j]) => `<button class="g-btn" data-jump="${j}">${esc(l)}<span aria-hidden="true">→</span></button>`).join('');
  guideOpen(); guideRest();
  if (!RMG) {
    inner.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'ease-out' });
    if (acts) [...acts.children].forEach((b, i) => b.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 120 + i * 70, easing: 'ease-out', fill: 'backwards' }));
  }
}
