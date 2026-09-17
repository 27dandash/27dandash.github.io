const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');

if (savedTheme === 'light') root.classList.add('light');

toggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('portfolio-theme', root.classList.contains('light') ? 'light' : 'dark');
});

document.querySelector('#year').textContent = new Date().getFullYear();
