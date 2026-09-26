// Portfolio. Three full cases (copy from legacy/case-*.html) and six illustration tiles for directions
// without a published case. Case numbers are the studio's own case copy — see needs-confirmation #10.
import awardHero from '../assets/photos/award-hero.webp';
import awardConcept from '../assets/photos/award-concept.webp';
import awardCad from '../assets/photos/award-cad.webp';
import helmetHero from '../assets/photos/helmet-hero.webp';
import helmetScan from '../assets/photos/helmet-scan.webp';
import helmetCad from '../assets/photos/helmet-cad.webp';
import helmetPaint from '../assets/photos/helmet-paint.webp';
import partHero from '../assets/photos/part-hero.webp';
import partScan from '../assets/photos/part-scan.webp';
import partCad from '../assets/photos/part-cad.webp';
import figurinePortrait from '../assets/photos/figurine-portrait.webp';
import figurineSciFi from '../assets/photos/figurine-sci-fi.webp';
import armor from '../assets/photos/cosplay-armor.webp';
import merch from '../assets/photos/merch.webp';
import prototype from '../assets/photos/prototype.webp';
import scanner from '../assets/photos/scanner.webp';

export const categories = [
  { key: 'all', label: 'Все' },
  { key: 'merch', label: 'Мерч' },
  { key: 'figurki', label: 'Фигурки' },
  { key: 'kosplej', label: 'Косплей' },
  { key: 'prototipy', label: 'Прототипы' },
  { key: 'revers', label: 'Реверс-инжиниринг' },
] as const;
export type Category = (typeof categories)[number]['key'];

export type Case = {
  slug: string;
  cat: Category;
  catLabel: string;
  title: string;
  short: string;
  description: string;
  facts: { k: string; v: string }[];
  hero: ImageMetadata;
  heroAlt: string;
  chapters: { title: string; text: string; image?: ImageMetadata; alt?: string }[];
  service: string;
};

export const cases: Case[] = [
  {
    slug: 'shlem-po-skanu', cat: 'kosplej', catLabel: 'Косплей',
    title: 'Шлем со светом и подгонкой по скану головы',
    short: 'Шлем экранного качества, который удобно носить весь день фестиваля.',
    description: 'Кейс: разработка и производство шлема со светом и точной посадкой по 3D-скану головы — FDM + SLA, покраска, электроника.',
    facts: [
      { k: 'Клиент', v: 'Косплей-мастер, частный заказ' },
      { k: 'Срок', v: '5 недель' },
      { k: 'Технологии', v: 'Скан · FDM + SLA · покраска · электроника' },
    ],
    hero: helmetHero, heroAlt: 'Готовый шлем с подсветкой визора — иллюстрация',
    chapters: [
      { title: 'Задача', text: 'Клиент пришёл с несколькими скриншотами из игры: нужен шлем экранного качества, который удобно носить целый день фестиваля. Готовые STL из интернета не подходили — не совпадали пропорции и не было места под электронику.' },
      { title: 'Моделирование', text: 'Отсканировали голову клиента и построили модель вокруг реальной анатомии: зазоры под подкладку, каналы вентиляции, посадочные места под светодиоды и аккумулятор. Внешнюю форму сверяли с референсами по 12 контрольным ракурсам.', image: helmetScan, alt: 'Сканирование головы клиента ручным сканером — иллюстрация' },
      { title: 'Производство', text: 'Корпус — FDM из ударопрочного пластика, мелкие накладки и решётки — SLA для чёткости граней. Детали соединяются на магнитах и скрытых винтах: шлем разбирается для транспортировки.', image: helmetCad, alt: '3D-модель шлема в редакторе — иллюстрация' },
      { title: 'Финиш', text: 'Шлифовка, грунт, металлик с эффектом анодирования, точечное старение и «боевые» потёртости. Внутри — мягкая подкладка, вентиляторы и управляемая подсветка визора.', image: helmetPaint, alt: 'Покраска шлема аэрографом — иллюстрация' },
      { title: 'Результат', text: 'Шлем выдержал два фестиваля и фотосессию: сидит точно по голове, не запотевает, свет работает от одного заряда весь день. Клиент вернулся за комплектом брони.' },
    ],
    service: 'kosplej',
  },
  {
    slug: 'nagrady-it-konferencii', cat: 'merch', catLabel: 'Мерч',
    title: '120 наград для IT-конференции за три недели',
    short: 'Награда, которую спикеры не уберут в шкаф: форма с нуля, серия 120 штук.',
    description: 'Кейс: проектирование и производство серии из 120 корпоративных наград для технологической конференции за 21 день.',
    facts: [
      { k: 'Клиент', v: 'Ивент-агентство' },
      { k: 'Тираж', v: '120 штук' },
      { k: 'Срок', v: '21 день от брифа до отгрузки' },
    ],
    hero: awardHero, heroAlt: 'Серия наград в ряд — иллюстрация',
    chapters: [
      { title: 'Задача', text: 'Агентству нужна была награда, отражающая продукт IT-компании — облачную платформу. Каталожные кубки не подходили: хотелось объект, который спикеры не уберут в шкаф. Бюджет и срок — жёсткие.' },
      { title: 'Дизайн и модель', text: 'Предложили три концепта формы; выбранный — параметрическая волна из «блоков данных», вырастающая из логотипа. Смоделировали в CAD с посадочным местом под именную табличку и номером тиража на основании.', image: awardConcept, alt: 'Эскизы концептов награды на столе — иллюстрация' },
      { title: 'Производство', text: 'Тираж печатали параллельно на ферме SLA-принтеров — партиями по 20 штук с контролем геометрии каждой. Одинаковость серии — главный вызов тиража: разброс по размерам удержали в пределах 0,1 мм.', image: awardCad, alt: 'CAD-модель награды на мониторе и первый образец — иллюстрация' },
      { title: 'Финиш', text: 'Покрытие под анодированный металл с фирменным цветом компании, УФ-печать логотипа, именная гравировка. Каждая награда — в жёстком пенале с ложементом.' },
      { title: 'Результат', text: 'Отгрузили за два дня до конференции. Награды разошлись по фотоотчётам и соцсетям спикеров; агентство вернулось со следующим ивентом, компания — с заказом настольного мерча для команды.' },
    ],
    service: 'merch',
  },
  {
    slug: 'detal-snyataya-s-proizvodstva', cat: 'revers', catLabel: 'Реверс-инжиниринг',
    title: 'Деталь, снятая с производства 15 лет назад',
    short: 'Из треснувшего оригинала — рабочая деталь за сутки и чертёж, которого не было у производителя.',
    description: 'Кейс: реверс-инжиниринг и восстановление снятой с производства промышленной детали по 3D-скану, печать инженерным пластиком.',
    facts: [
      { k: 'Клиент', v: 'Производственная компания' },
      { k: 'Срок', v: '2 недели' },
      { k: 'Технологии', v: 'Скан · CAD-реконструкция · инженерный пластик' },
    ],
    hero: partHero, heroAlt: 'Треснувший оригинал и новая напечатанная деталь рядом — иллюстрация',
    chapters: [
      { title: 'Задача', text: 'На линии клиента вышел из строя пластиковый узел подачи. Производитель оборудования снял деталь с производства 15 лет назад, аналогов нет, простой линии стоил дороже любого решения. Из исходников — только треснувший оригинал.' },
      { title: 'Сканирование', text: 'Отсканировали сломанную деталь с точностью 0,05 мм, совместили фрагменты в цифре и восстановили полную геометрию, включая утраченный участок посадочного фланца.', image: partScan, alt: 'Сканирование треснувшей детали — иллюстрация' },
      { title: 'CAD-реконструкция', text: 'Скан перевели в параметрическую CAD-модель с допусками. Заодно усилили слабое место конструкции — рёбра в зоне, где оригинал треснул. У клиента теперь есть чертёж, которого не было даже у производителя.', image: partCad, alt: 'Параметрическая CAD-модель детали — иллюстрация' },
      { title: 'Производство', text: 'Напечатали партию из пяти деталей инженерным пластиком, стойким к маслам и износу. Первую — за сутки, для срочного запуска линии; остальные — в запас.' },
      { title: 'Результат', text: 'Линия запущена через сутки после сканирования. Новая деталь работает дольше оригинала благодаря усиленной конструкции, а цифровая модель позволяет производить её при необходимости за один день.' },
    ],
    service: 'skanirovanie',
  },
];

// Tiles from the old portfolio that have no written case. Shown honestly as direction illustrations.
export const tiles: { title: string; cat: Category; catLabel: string; image: ImageMetadata; alt: string; service: string }[] = [
  { title: 'Портретная фигурка', cat: 'figurki', catLabel: 'Фигурки', image: figurinePortrait, alt: 'Портретная фигурка на подставке — иллюстрация', service: 'figurki' },
  { title: 'Коллекционная статуэтка', cat: 'figurki', catLabel: 'Фигурки', image: figurineSciFi, alt: 'Окрашенная статуэтка девушки в плаще — иллюстрация', service: 'figurki' },
  { title: 'Броня — полный комплект', cat: 'kosplej', catLabel: 'Косплей', image: armor, alt: 'Комплект брони на подставках — иллюстрация', service: 'kosplej' },
  { title: 'Выставочный макет', cat: 'merch', catLabel: 'Мерч', image: merch, alt: 'Набор брендированных объектов — иллюстрация', service: 'merch' },
  { title: 'Функциональный прототип', cat: 'prototipy', catLabel: 'Прототипы', image: prototype, alt: 'Корпуса прототипа устройства — иллюстрация', service: 'prototipirovanie' },
  { title: 'Оцифровка скульптуры', cat: 'revers', catLabel: 'Реверс-инжиниринг', image: scanner, alt: 'Сканирование гипсового бюста — иллюстрация', service: 'skanirovanie' },
];

export const caseBySlug = Object.fromEntries(cases.map((c) => [c.slug, c]));
