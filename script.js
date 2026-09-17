const root = document.documentElement;
const header = document.querySelector('[data-header]');
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const menuLabel = menuToggle.querySelector('.sr-only');
const collapsedNavigation = window.matchMedia('(max-width: 700px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const themeColor = document.querySelector('meta[name="theme-color"]');
let lastHeaderFocus = null;

root.classList.add('js');

const getSavedTheme = () => {
  try {
    return localStorage.getItem('portfolio-theme');
  } catch {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem('portfolio-theme', theme);
  } catch {
    // Theme still changes for this visit if storage is unavailable.
  }
};

const updateThemeUI = () => {
  const isLight = root.classList.contains('light');
  const label = isLight ? 'Switch to dark theme' : 'Switch to light theme';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
  themeColor.setAttribute('content', isLight ? '#f4f3ed' : '#08110f');
};

if (getSavedTheme() === 'light') root.classList.add('light');
updateThemeUI();

themeToggle.addEventListener('click', () => {
  root.classList.toggle('light');
  saveTheme(root.classList.contains('light') ? 'light' : 'dark');
  updateThemeUI();
});

const closeMenu = (returnFocus = false) => {
  header.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuLabel.textContent = 'Open navigation';
  if (returnFocus) window.requestAnimationFrame(() => menuToggle.focus());
};

menuToggle.addEventListener('click', () => {
  const isOpen = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuLabel.textContent = isOpen ? 'Close navigation' : 'Open navigation';
});

header.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => closeMenu(collapsedNavigation.matches));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('menu-open')) closeMenu(true);
});

document.addEventListener('click', (event) => {
  if (header.classList.contains('menu-open') && !header.contains(event.target)) closeMenu();
});

document.addEventListener('focusin', (event) => {
  lastHeaderFocus = header.contains(event.target) ? event.target : null;
});

document.addEventListener('pointerdown', (event) => {
  if (!header.contains(event.target)) lastHeaderFocus = null;
});

document.querySelector('#year').textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll([
  '.section-heading',
  '.project-card',
  '.case-card',
  '.engineering-copy',
  '.engineering-list article',
  '.archive-intro',
  '.archive-grid article',
  '.contact-section'
].join(','));

revealItems.forEach((item, index) => {
  item.classList.add('reveal');
  item.style.setProperty('--reveal-delay', `${(index % 3) * 55}ms`);
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
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const navLinks = [...header.querySelectorAll('nav a[href^="#"]')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible[0]) setActiveLink(visible[0].target.id);
  }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .1, .3] });

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const scrollProgress = document.querySelector('.scroll-progress');
let scrollTicking = false;

const updateScrollUI = () => {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
  scrollTicking = false;
};

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateScrollUI);
}, { passive: true });

const handleNavigationBreakpoint = (event) => {
  const nav = header.querySelector('nav');

  if (event.matches) {
    if (nav.contains(document.activeElement) || nav.contains(lastHeaderFocus)) closeMenu(true);
    return;
  }

  const focusWasOnMenuToggle = document.activeElement === menuToggle || lastHeaderFocus === menuToggle;
  if (header.classList.contains('menu-open')) closeMenu();
  if (focusWasOnMenuToggle) navLinks[0]?.focus();
};

if ('addEventListener' in collapsedNavigation) {
  collapsedNavigation.addEventListener('change', handleNavigationBreakpoint);
} else {
  collapsedNavigation.addListener(handleNavigationBreakpoint);
}

updateScrollUI();
