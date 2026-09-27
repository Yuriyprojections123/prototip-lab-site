// «Рассчитать проект» — six-step brief. Sends multipart/form-data to PUBLIC_QUOTE_ENDPOINT when configured;
// with no endpoint it sends nothing, copies the brief and points to Telegram (README → Интеграции).
const MAX_FILES = 10;
const MAX_SIZE = 25 * 1024 * 1024;
const LABELS: Record<string, Record<string, string>> = {
  task: { figurine: 'Фигурка', cosplay: 'Косплей', merch: 'Мерч', prototype: 'Прототип', reverse: 'Реверс-инжиниринг', modeling: 'Только модель', other: 'Другое' },
  quantity: { '1': '1 шт', '2-10': '2–10 шт', '11-100': '11–100 шт', '100+': '100+ шт' },
  deadline: { relaxed: 'Не горит', '2-4w': '2–4 недели', urgent: 'Срочно' },
};
const STEP_NAMES = ['Задача', 'Размер', 'Тираж', 'Срок', 'Описание и файлы', 'Контакт'];
const CONTACT_RE = /^(\+?[\d\s()\-]{10,}|[^\s@]+@[^\s@]+\.[^\s@]{2,}|@?[a-zA-Z0-9_]{5,32})$/;

export default function initQuote(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('form')!;
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('.q-step')];
  const ticks = [...form.querySelectorAll<HTMLButtonElement>('[data-goto]')];
  const prev = form.querySelector<HTMLButtonElement>('[data-prev]')!;
  const next = form.querySelector<HTMLButtonElement>('[data-next]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const live = form.querySelector<HTMLElement>('[data-live]')!;
  const result = root.querySelector<HTMLElement>('[data-result]')!;
  const endpoint = root.dataset.endpoint ?? '';
  let cur = 0, maxSeen = 0;
  let files: File[] = [];

  root.classList.add('is-stepped');
  form.removeAttribute('action');

  // preselect task from ?task= (service pages link here)
  const pre = new URL(location.href).searchParams.get('task');
  if (pre) { const r = form.querySelector<HTMLInputElement>(`input[name="task"][value="${CSS.escape(pre)}"]`); if (r) r.checked = true; }

  /* ---------- step navigation ---------- */
  function show(i: number, focus = true) {
    cur = i; maxSeen = Math.max(maxSeen, i);
    steps.forEach((s, j) => s.classList.toggle('is-cur', j === i));
    ticks.forEach((t, j) => {
      t.classList.toggle('is-cur', j === i);
      t.classList.toggle('is-done', j < i || (j <= maxSeen && j !== i));
      t.disabled = j > maxSeen;
    });
    prev.hidden = i === 0;
    next.hidden = i === steps.length - 1;
    submit.hidden = i !== steps.length - 1;
    root.querySelector('[data-cur]')!.textContent = String(i + 1).padStart(2, '0');
    root.querySelector('[data-cur-name]')!.textContent = STEP_NAMES[i];
    live.textContent = `Шаг ${i + 1} из ${steps.length}: ${STEP_NAMES[i]}`;
    if (focus) {
      steps[i].querySelector<HTMLElement>('.q-legend')?.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top + scrollY - 120;
      if (scrollY > top) (window as any).__lenis ? (window as any).__lenis.scrollTo(top) : scrollTo({ top, behavior: 'smooth' });
    }
  }

  /* ---------- validation ---------- */
  function setErr(name: string, msg: string | null, target?: Element | null) {
    const el = form.querySelector<HTMLElement>(`[data-err="${name}"]`);
    if (el) { el.hidden = !msg; if (msg) el.textContent = msg; }
    const t = target ?? form.querySelector(`[name="${name}"]`);
    const holder = t?.closest('[role="radiogroup"]') ?? t;
    holder?.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate(i: number): HTMLElement | null {
    const bad: HTMLElement[] = [];
    const radio = (name: string, msg: string) => {
      const ok = !!form.querySelector(`input[name="${name}"]:checked`);
      setErr(name, ok ? null : msg);
      if (!ok) bad.push(form.querySelector<HTMLElement>(`input[name="${name}"]`)!);
    };
    if (i === 0) radio('task', 'Выберите тип задачи.');
    if (i === 2) radio('quantity', 'Выберите тираж.');
    if (i === 3) radio('deadline', 'Выберите срок.');
    if (i === 4) {
      const d = form.elements.namedItem('description') as HTMLTextAreaElement;
      const ok = d.value.trim().length >= 10;
      setErr('description', ok ? null : 'Опишите задачу хотя бы в паре слов (от 10 символов).', d);
      if (!ok) bad.push(d);
    }
    if (i === 5) {
      const n = form.elements.namedItem('name') as HTMLInputElement;
      const c = form.elements.namedItem('contact') as HTMLInputElement;
      const k = form.elements.namedItem('consent') as HTMLInputElement;
      const okN = n.value.trim().length >= 2;
      const okC = CONTACT_RE.test(c.value.trim());
      setErr('name', okN ? null : 'Как к вам обращаться?', n); if (!okN) bad.push(n);
      setErr('contact', okC ? null : 'Нужен телефон, почта или @username в Telegram.', c); if (!okC) bad.push(c);
      setErr('consent', k.checked ? null : 'Без согласия мы не можем принять заявку.', k); if (!k.checked) bad.push(k);
    }
    return bad[0] ?? null;
  }
  // clear a text field's error as soon as its value becomes valid (no layout jump later on blur)
  const rules: Record<string, (v: string) => boolean> = {
    description: (v) => v.trim().length >= 10,
    name: (v) => v.trim().length >= 2,
    contact: (v) => CONTACT_RE.test(v.trim()),
  };
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (rules[t.name] && t.getAttribute('aria-invalid') === 'true' && rules[t.name](t.value)) setErr(t.name, null, t);
  });
  // re-validate on blur/change once a field was touched
  form.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.getAttribute('aria-invalid') === 'true' || t.closest('[aria-invalid="true"]')) validate(cur);
    summary();
  });
  form.addEventListener('focusout', (e) => {
    // Moving to a nav button: its click validates. Validating here would hide the error, shift the layout
    // and make the pointer's mouseup miss the button, swallowing the click.
    if ((e.relatedTarget as HTMLElement | null)?.closest('.q-nav')) return;
    const t = e.target as HTMLInputElement;
    if (['name', 'contact', 'description'].includes(t.name) && t.value) validate(cur);
  });

  next.addEventListener('click', () => {
    const bad = validate(cur);
    if (bad) { bad.focus(); live.textContent = 'Проверьте поля на этом шаге'; return; }
    show(cur + 1);
  });
  prev.addEventListener('click', () => show(cur - 1));
  ticks.forEach((t, j) => t.addEventListener('click', () => { if (j <= maxSeen) show(j); }));
  // Enter in a text input advances instead of submitting early
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && cur < steps.length - 1) { e.preventDefault(); next.click(); }
  });

  /* ---------- size step ---------- */
  const range = form.querySelector<HTMLInputElement>('[name="size_cm"]')!;
  const out = form.querySelector<HTMLElement>('[data-size-out]')!;
  const unknown = form.querySelector<HTMLInputElement>('[data-size-unknown]')!;
  const vizObj = form.querySelector<SVGGElement>('[data-size-obj] rect')!;
  const dim = form.querySelector<SVGLineElement>('[data-size-dim]')!;
  const lbl = form.querySelector<SVGTextElement>('[data-size-lbl]')!;
  const drawSize = () => {
    const cm = Number(range.value);
    out.textContent = `${cm} см`;
    // grid cell 16px = 10 cm; object sits on the baseline y=224
    const h = Math.min(216, (cm / 10) * 16);
    const w = Math.max(6, h * 0.42);
    vizObj.setAttribute('x', String(100 - w / 2)); vizObj.setAttribute('width', String(w));
    vizObj.setAttribute('y', String(224 - h)); vizObj.setAttribute('height', String(h));
    dim.setAttribute('y1', String(224 - h)); dim.setAttribute('y2', '224');
    lbl.setAttribute('y', String(224 - h / 2 + 3)); lbl.textContent = String(cm);
    summary();
  };
  range.addEventListener('input', drawSize);
  form.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((b) => b.addEventListener('click', () => { range.value = b.dataset.preset!; drawSize(); }));
  unknown.addEventListener('change', () => { form.querySelector('.q-size')!.classList.toggle('is-unknown', unknown.checked); summary(); });

  /* ---------- files ---------- */
  const input = form.querySelector<HTMLInputElement>('[data-files]')!;
  const list = form.querySelector<HTMLElement>('[data-file-list]')!;
  const drop = form.querySelector<HTMLElement>('[data-drop]')!;
  const addFiles = (fl: FileList | File[]) => {
    const errs: string[] = [];
    for (const f of fl) {
      if (files.length >= MAX_FILES) { errs.push(`Не больше ${MAX_FILES} файлов.`); break; }
      if (f.size > MAX_SIZE) { errs.push(`«${f.name}» больше 25 МБ — пришлите его в Telegram.`); continue; }
      if (files.some((x) => x.name === f.name && x.size === f.size)) continue;
      files.push(f);
    }
    setErr('files', errs.length ? errs.join(' ') : null, input);
    renderFiles();
  };
  const renderFiles = () => {
    list.textContent = '';
    files.forEach((f, i) => {
      const li = document.createElement('li');
      const thumb = f.type.startsWith('image/') ? Object.assign(document.createElement('img'), { src: URL.createObjectURL(f), alt: '' })
        : Object.assign(document.createElement('span'), { className: 'q-file__ext', textContent: (f.name.split('.').pop() ?? '').slice(0, 4).toUpperCase() });
      const name = document.createElement('span');
      name.textContent = `${f.name} · ${(f.size / 1048576).toFixed(1)} МБ`;
      const rm = document.createElement('button');
      rm.type = 'button'; rm.textContent = 'Убрать'; rm.setAttribute('aria-label', `Убрать файл ${f.name}`);
      rm.addEventListener('click', () => { files.splice(i, 1); renderFiles(); input.focus(); });
      li.append(thumb, name, rm);
      list.append(li);
    });
    summary();
  };
  input.addEventListener('change', () => { if (input.files) addFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => { const dt = (e as DragEvent).dataTransfer; if (dt?.files) addFiles(dt.files); });

  /* ---------- live summary (the reference's calculator output) ---------- */
  const val = (name: string) => (form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? '');
  const sumEls = Object.fromEntries([...root.querySelectorAll<HTMLElement>('[data-sum]')].map((e) => [e.dataset.sum!, e]));
  const setSum = (k: string, v: string) => {
    const el = sumEls[k]; if (!el || el.textContent === v) return;
    el.textContent = v; el.classList.add('flash'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('flash')));
  };
  function summary() {
    setSum('task', LABELS.task[val('task')] ?? '—');
    setSum('size', unknown?.checked ? 'подскажите' : `${range?.value ?? 25} см`);
    setSum('quantity', LABELS.quantity[val('quantity')] ?? '—');
    const date = (form.elements.namedItem('deadline_date') as HTMLInputElement)?.value;
    setSum('deadline', [LABELS.deadline[val('deadline')], date && `к ${new Date(date).toLocaleDateString('ru-RU')}`].filter(Boolean).join(', ') || '—');
    setSum('files', files.length ? `${files.length} шт` : 'нет');
  }
  function briefText() {
    const fd = new FormData(form);
    const lines = [
      'Бриф с сайта prototiplab.ru',
      `Задача: ${LABELS.task[val('task')] ?? '—'}`,
      `Размер: ${unknown.checked ? 'не знаю' : `${range.value} см`}`,
      `Тираж: ${LABELS.quantity[val('quantity')] ?? '—'}`,
      `Срок: ${LABELS.deadline[val('deadline')] ?? '—'}${fd.get('deadline_date') ? `, к ${fd.get('deadline_date')}` : ''}`,
      `Описание: ${String(fd.get('description') ?? '').trim() || '—'}`,
      files.length ? `Файлы: ${files.map((f) => f.name).join(', ')} (приложу в чат)` : '',
      fd.get('name') ? `Имя: ${fd.get('name')}` : '',
      fd.get('contact') ? `Контакт: ${fd.get('contact')}` : '',
    ];
    return lines.filter(Boolean).join('\n');
  }
  const copy = async () => { try { await navigator.clipboard.writeText(briefText()); return true; } catch { return false; } };
  const copyBtn = root.querySelector<HTMLButtonElement>('[data-copy]')!;
  copyBtn.addEventListener('click', async () => { copyBtn.textContent = (await copy()) ? 'Скопировано' : 'Не удалось скопировать'; setTimeout(() => { copyBtn.textContent = 'Скопировать бриф'; }, 2200); });
  root.querySelector('[data-tg-shortcut]')?.addEventListener('click', () => { void copy(); });
  summary();

  /* ---------- submit ---------- */
  const showResult = (state: 'success' | 'offline' | 'error') => {
    root.classList.add('is-done');
    result.hidden = false;
    result.querySelectorAll<HTMLElement>('[data-state]').forEach((e) => { e.hidden = e.dataset.state !== state; });
    result.querySelector<HTMLElement>('[data-retry]')!.hidden = state !== 'error';
    result.focus();
    const top = root.getBoundingClientRect().top + scrollY - 120;
    scrollTo({ top });
  };
  async function send() {
    const fd = new FormData(form);
    fd.delete('files');
    files.forEach((f) => fd.append('files[]', f, f.name));
    fd.set('brief', briefText());
    fd.set('page', location.href);
    if (String(fd.get('company_site') ?? '')) { showResult('success'); return; } // honeypot: silently accept
    if (!endpoint) { await copy(); showResult('offline'); return; }
    submit.classList.add('is-loading'); submit.disabled = true;
    submit.querySelector('[data-submit-label]')!.textContent = 'Отправляем';
    try {
      const res = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      showResult('success');
      (window as any).ym?.(Number(document.documentElement.dataset.ym), 'reachGoal', 'quote_sent');
    } catch {
      await copy();
      showResult('error');
    } finally {
      submit.classList.remove('is-loading'); submit.disabled = false;
      submit.querySelector('[data-submit-label]')!.textContent = 'Отправить заявку';
    }
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    for (let i = 0; i < steps.length; i++) {
      const bad = validate(i);
      if (bad) { show(i, false); bad.focus(); live.textContent = 'Проверьте поля на этом шаге'; return; }
    }
    void send();
  });
  result.querySelector('[data-retry]')!.addEventListener('click', () => { root.classList.remove('is-done'); result.hidden = true; void send(); });
  result.querySelector('[data-restart]')!.addEventListener('click', () => {
    form.reset(); files = []; renderFiles(); drawSize();
    root.classList.remove('is-done'); result.hidden = true; maxSeen = 0; show(0);
  });

  drawSize();
  show(0, false);
}
