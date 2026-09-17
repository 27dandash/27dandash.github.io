const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

root.classList.add('js');

if (savedTheme === 'light') root.classList.add('light');

toggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('portfolio-theme', root.classList.contains('light') ? 'light' : 'dark');
});

document.querySelector('#year').textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll([
  '.section-heading',
  '.project-card',
  '.case-card',
  '.engineering-copy',
  '.engineering-list article',
  '.archive-section > div:first-child',
  '.archive-grid article',
  '.contact-section'
].join(','));

revealItems.forEach((item, index) => {
  item.classList.add('reveal');
  item.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
});

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('reveal-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const scrollProgress = document.querySelector('.scroll-progress');
let scrollTicking = false;

const updateScrollProgress = () => {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
  scrollTicking = false;
};

window.addEventListener('scroll', () => {
  if (scrollTicking || reducedMotion.matches) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateScrollProgress);
}, { passive: true });

updateScrollProgress();
