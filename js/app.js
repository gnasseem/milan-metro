// Tab switching
const tabs = document.querySelectorAll('.tab');
const journeys = document.querySelectorAll('.journey');
const progressBar = document.querySelector('.progress-bar');
const scrollHint = document.querySelector('.scroll-hint');

const lineColors = { leg1: '#0075BF', leg2: '#E4002B' };

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.leg;
    tabs.forEach(t => t.classList.remove('active'));
    journeys.forEach(j => j.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('leg' + target).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    progressBar.style.background = lineColors['leg' + target];
    if (scrollHint) scrollHint.classList.remove('hidden');
  });
});

// Scroll progress
function updateProgress() {
  const active = document.querySelector('.journey.active');
  if (!active) return;
  const tabH = document.querySelector('.tab-bar').offsetHeight;
  const scrolled = window.scrollY - active.offsetTop + tabH;
  const total = active.scrollHeight - window.innerHeight;
  const pct = Math.max(0, Math.min(100, (scrolled / total) * 100));
  progressBar.style.width = pct + '%';

  // Update progress bar color based on visible segment
  const segments = active.querySelectorAll('.line-segment');
  segments.forEach(seg => {
    const rect = seg.getBoundingClientRect();
    if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
      progressBar.style.background = getComputedStyle(seg).getPropertyValue('--line-color').trim();
    }
  });

  if (window.scrollY > 80 && scrollHint) scrollHint.classList.add('hidden');
}

window.addEventListener('scroll', updateProgress, { passive: true });

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.station').forEach(s => observer.observe(s));

// Init
progressBar.style.background = lineColors.leg1;
