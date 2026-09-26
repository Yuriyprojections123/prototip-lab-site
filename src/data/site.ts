// Single source of truth for contacts, navigation and integrations.
// Anything unverified lives in clone-workspace/prototiplab/needs-confirmation.md and is NOT rendered
// until the owner confirms it: fill the value here and it appears everywhere.

export const site = {
  name: 'ПРОТОТИП LAB',
  url: 'https://prototiplab.ru',
  city: 'Москва',
  tagline: 'Студия 3D-моделирования, сканирования и производства',
  telegram: { handle: '@prototiplab', url: 'https://t.me/prototiplab' },
  // needs-confirmation #3: the old site's mail domain differs from the site domain — hidden until confirmed.
  email: '' as string,
  // needs-confirmation #2: the old WhatsApp number was a placeholder, not a real line.
  whatsapp: '' as string,
  // needs-confirmation #12: street address and hours for LocalBusiness.
  address: '' as string,
  scanIntake: 'Приём объектов на сканирование — по записи',
  // Build-time integrations (see README → «Интеграции»). Empty = disabled.
  quoteEndpoint: import.meta.env.PUBLIC_QUOTE_ENDPOINT ?? '',
  metrikaId: import.meta.env.PUBLIC_YM_ID ?? '',
};

export const nav = [
  { href: '/uslugi/', label: 'Услуги' },
  { href: '/portfolio/', label: 'Портфолио' },
  { href: '/studiya/', label: 'Студия' },
  { href: '/kontakty/', label: 'Контакты' },
];

export const audiences = [
  'Бизнес', 'Стартапы', 'Продуктовые дизайнеры', 'Ивент-агентства',
  'Маркетинг-команды', 'Коллекционеры', 'Косплей-мастера', 'Частные клиенты',
];

// Process — the studio's own five steps, used on home (scroll sequence) and services.
export const process = [
  { key: 'idea', n: '01', title: 'Идея', lead: 'Идея и бриф',
    text: 'Обсуждаем задачу, размеры, тираж и сроки. Достаточно одного изображения — фотографии, эскиза или пары слов.' },
  { key: 'model', n: '02', title: 'Модель', lead: 'Цифровая модель',
    text: 'Моделируем или сканируем, прорабатываем детали и согласовываем модель до производства.' },
  { key: 'print', n: '03', title: 'Печать', lead: 'Производство',
    text: 'Подбираем технологию и материал под задачу — FDM или SLA — и контролируем геометрию.' },
  { key: 'finish', n: '04', title: 'Постобработка', lead: 'Финиш и сборка',
    text: 'Шлифуем, грунтуем, красим и собираем. Поверхность определяет впечатление.' },
  { key: 'done', n: '05', title: 'Готовое изделие', lead: 'Готовое изделие',
    text: 'Вы получаете законченный объект, а не набор напечатанных деталей.' },
];

// Technologies — generic ranges typical for the technology, not claims about the studio's fleet
// (needs-confirmation #16). Labelled as such in the UI.
export const tech = {
  fdm: {
    name: 'FDM', title: 'Прочная печать',
    text: 'Корпуса, мастер-модели, крупные объекты и функциональные детали из инженерных пластиков.',
    rows: {
      layer: '0,1–0,3 мм', surface: 'Видимые слои, нужна шлифовка', strength: 'Высокая, инженерные пластики',
      size: 'Крупные детали, сборка из частей', best: 'Корпуса, крепёж, мастер-модели, шлемы и броня',
    },
  },
  sla: {
    name: 'SLA', title: 'Высокая детализация',
    text: 'Миниатюры, лица, фактуры и формы, где важна точность каждого миллиметра.',
    rows: {
      layer: '0,025–0,1 мм', surface: 'Гладкая, почти без ступеней', strength: 'Средняя, смола хрупче пластика',
      size: 'Небольшие и средние детали', best: 'Фигурки, лица, мелкие накладки, ювелирные формы',
    },
  },
  rowLabels: {
    layer: 'Толщина слоя', surface: 'Поверхность', strength: 'Прочность', size: 'Размер', best: 'Лучше всего для',
  },
};
