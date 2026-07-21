const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setMenu = (isOpen) => {
  menuButton.classList.toggle('active', isOpen);
  mobileMenu.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

menuButton.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const revealElements = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });
  revealElements.forEach((element) => revealObserver.observe(element));
}

document.querySelectorAll('.accordion details').forEach((details) => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    document.querySelectorAll('.accordion details').forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

const form = document.querySelector('#brief-form');
const formStatus = form.querySelector('.form-status');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const brief = [
    'Заявка для ПРОТОТИП LAB',
    `Имя: ${data.get('name')}`,
    `Контакт: ${data.get('contact')}`,
    `Проект: ${data.get('project')}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(brief);
    formStatus.textContent = 'Заявка скопирована. Отправьте её команде ПРОТОТИП LAB удобным способом.';
  } catch {
    formStatus.textContent = 'Заявка подготовлена. Скопируйте данные и отправьте их команде ПРОТОТИП LAB.';
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();
