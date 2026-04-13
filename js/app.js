// ── TAB SWITCHING ──
const tabs     = document.querySelectorAll('.tab');
const journeys = document.querySelectorAll('.journey');
const bar      = document.querySelector('.progress-bar');

const LEG_COLOR = { '1': '#2D8EFF', '2': '#FF1F44' };

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const leg = tab.dataset.leg;
    tabs.forEach(t => t.classList.remove('active'));
    journeys.forEach(j => j.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('leg' + leg).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    bar.style.background = LEG_COLOR[leg];
    // reset scroll hint
    const hint = document.querySelector('#leg' + leg + ' .scroll-hint');
    if (hint) hint.classList.remove('hidden');
    // re-observe newly visible stations
    document.querySelectorAll('#leg' + leg + ' .station:not(.visible)')
      .forEach(s => observer.observe(s));
  });
});

// ── SCROLL PROGRESS ──
function resolveLineColor(seg) {
  // reads the computed --lc custom property on the element
  const raw = getComputedStyle(seg).getPropertyValue('--lc').trim();
  if (!raw) return null;
  // if it's a var() reference, resolve one level
  const match = raw.match(/var\(([^)]+)\)/);
  if (match) return getComputedStyle(document.documentElement).getPropertyValue(match[1].trim()).trim();
  return raw;
}

let raf = null;
function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = null;
    const active = document.querySelector('.journey.active');
    if (!active) return;

    // progress %
    const scrolled = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? Math.min(100, (scrolled / docH) * 100) : 0;
    bar.style.width = pct + '%';

    // color from whichever segment is crossing screen center
    const midY = window.innerHeight / 2;
    active.querySelectorAll('.line-segment').forEach(seg => {
      const r = seg.getBoundingClientRect();
      if (r.top < midY && r.bottom > midY) {
        const c = resolveLineColor(seg);
        if (c) bar.style.background = c;
      }
    });

    // hide scroll hint after first scroll
    if (scrolled > 60) {
      const hint = active.querySelector('.scroll-hint');
      if (hint) hint.classList.add('hidden');
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // stagger siblings slightly
      const siblings = [...e.target.parentElement.querySelectorAll('.station:not(.visible)')];
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = Math.min(idx * 40, 120) + 'ms';
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.station').forEach(s => observer.observe(s));

// ── INIT ──
bar.style.background = LEG_COLOR['1'];
