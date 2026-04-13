// ── LINE COLORS (for progress bar) ──
const LEG_COLOR  = { '1': '#005BAC', '2': '#E4002B' };

// Segment color map  class → hex
const SEG_COLOR = { m4: '#005BAC', m1: '#E4002B', m2: '#00863E' };

const bar  = document.querySelector('.progress-bar');
const tabs = document.querySelectorAll('.tab');
const legs = document.querySelectorAll('.journey');

// ── TAB SWITCHING ──
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const id = tab.dataset.leg;
    tabs.forEach(t => t.classList.remove('active'));
    legs.forEach(l => l.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('leg' + id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    bar.style.background = LEG_COLOR[id];
    // show scroll hint again
    const hint = document.querySelector('#leg' + id + ' .hint');
    if (hint) hint.classList.remove('hide');
    // observe newly visible stops
    document.querySelectorAll('#leg' + id + ' .stop:not(.vis)')
      .forEach(s => io.observe(s));
  });
});

// ── SCROLL PROGRESS + COLOR ──
let raf = null;
window.addEventListener('scroll', () => {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = null;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docH > 0 ? Math.min(100, window.scrollY / docH * 100) + '%' : '0%';

    // update bar color to match segment crossing the screen midpoint
    const midY = window.innerHeight * .45;
    const active = document.querySelector('.journey.active');
    if (active) {
      active.querySelectorAll('.seg').forEach(seg => {
        const r = seg.getBoundingClientRect();
        if (r.top < midY && r.bottom > midY) {
          // derive color from class
          for (const [cls, hex] of Object.entries(SEG_COLOR)) {
            if (seg.classList.contains(cls)) bar.style.background = hex;
          }
        }
      });
      // hide scroll hint after a little scroll
      if (window.scrollY > 80) {
        const hint = active.querySelector('.hint');
        if (hint) hint.classList.add('hide');
      }
    }
  });
}, { passive: true });

// ── SCROLL REVEAL ──
let delay = 0;
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    delay += 30;
    const d = Math.min(delay, 150);
    e.target.style.transitionDelay = d + 'ms';
    e.target.classList.add('vis');
    io.unobserve(e.target);
    setTimeout(() => { delay = Math.max(0, delay - 30); }, 400);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -10px 0px' });

document.querySelectorAll('.stop').forEach(s => io.observe(s));

// ── INIT ──
bar.style.background = LEG_COLOR['1'];
