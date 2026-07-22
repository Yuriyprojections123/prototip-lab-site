document.addEventListener('DOMContentLoaded', () => {
  enableDesignedHoverStates();
  setupMobileNavigation();
  markCurrentNavigationItem();
  setupProjectForm();
});

function enableDesignedHoverStates() {
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('[style-hover]').forEach((element) => {
    const declarations = element.getAttribute('style-hover')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf(':');
        return [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
      });
    const original = new Map();

    element.addEventListener('mouseenter', () => {
      declarations.forEach(([property, value]) => {
        original.set(property, element.style.getPropertyValue(property));
        element.style.setProperty(property, value);
      });
    });

    element.addEventListener('mouseleave', () => {
      declarations.forEach(([property]) => {
        const value = original.get(property);
        if (value) element.style.setProperty(property, value);
        else element.style.removeProperty(property);
      });
    });
  });
}

function setupMobileNavigation() {
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.site-nav');
  const inner = header?.firstElementChild;
  if (!header || !nav || !inner) return;

  nav.id = 'site-navigation';
  const button = document.createElement('button');
  button.className = 'menu-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', 'Открыть меню');
  button.setAttribute('aria-controls', nav.id);
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<span></span>';
  inner.insertBefore(button, nav);

  const close = () => {
    nav.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Открыть меню');
  };

  button.addEventListener('click', () => {
    const opening = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', opening);
    button.setAttribute('aria-expanded', String(opening));
    button.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) close();
  });
}

function markCurrentNavigationItem() {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach((link) => {
    if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
  });
}

function setupProjectForm() {
  const form = document.querySelector('#project-form');
  const status = document.querySelector('#form-status');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const directions = data.getAll('dir').join(', ');
    const lines = [
      'Заявка для ПРОТОТИП LAB',
      `Имя: ${data.get('name')}`,
      `Контакт: ${data.get('contact')}`,
      directions ? `Направление: ${directions}` : '',
      `Проект: ${data.get('project')}`,
    ].filter(Boolean);
    const brief = lines.join('\n');

    try {
      await navigator.clipboard.writeText(brief);
    } catch (_) {
      // The mail draft below remains a complete no-permission fallback.
    }

    if (status) {
      status.hidden = false;
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const subject = encodeURIComponent('Заявка с сайта ПРОТОТИП LAB');
    const body = encodeURIComponent(brief);
    window.location.href = `mailto:hello@prototip-lab.ru?subject=${subject}&body=${body}`;
  });
}
