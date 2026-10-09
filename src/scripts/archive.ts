const form = document.querySelector<HTMLFormElement>('#archive-filters');
if (form) {
  const search = form.querySelector<HTMLInputElement>('#search')!;
  const season = form.querySelector<HTMLSelectElement>('#season')!;
  const week = form.querySelector<HTMLSelectElement>('#week')!;
  const type = form.querySelector<HTMLSelectElement>('#type')!;
  const cards = [...document.querySelectorAll<HTMLElement>('[data-article]')];
  const groups = [...document.querySelectorAll<HTMLElement>('[data-group]')];
  const count = document.querySelector('#results-count')!;
  const empty = document.querySelector<HTMLElement>('#empty-results')!;
  const noWeeks = document.querySelector<HTMLElement>('#no-weeks');
  const steps = document.querySelector<HTMLElement>('#edition-navigation')!;
  const hasRecaps = Number(form.dataset.recaps) > 0;
  const more = form.querySelector<HTMLDetailsElement>('#more-filters')!;
  const active = form.querySelector('#active-filters')!;
  const onArchiveIndex = location.pathname === '/archive/';
  const plural = (value: number, word: string) => `${value} ${word}${value === 1 ? '' : 's'}`;
  const known = (select: HTMLSelectElement, value: string) => [...select.options].some((option) => option.value === value && !option.disabled);

  function matchesTerm(text: string, term: string) {
    return /^\p{N}+$/u.test(term) ? text.split(/[^\p{L}\p{N}]+/u).includes(term) : text.includes(term);
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    const edition = params.get('edition') ?? (onArchiveIndex ? '' : form!.dataset.initialEdition ?? '');
    search.value = (params.get('q') ?? '').slice(0, 100);
    week.value = known(week, edition) ? edition : '';
    const chosenSeason = params.get('season') ?? (week.value ? week.value.split(':')[0] : '');
    season.value = known(season, chosenSeason) ? chosenSeason : '';
    const chosenType = params.get('type') ?? '';
    type.value = known(type, chosenType) ? chosenType : '';
  }

  function stepLink(id: string, target: HTMLElement | undefined, label: string) {
    const link = document.querySelector<HTMLAnchorElement>(`#${id}`)!;
    link.hidden = !target;
    if (!target) return;
    const params = new URLSearchParams();
    if (search.value.trim()) params.set('q', search.value.trim());
    if (type.value) params.set('type', type.value);
    link.href = target.dataset.path! + (params.size ? `?${params}` : '');
    link.querySelector('strong')!.textContent = `Week ${target.dataset.week}`;
    link.querySelector('.step-label')!.textContent = label;
  }

  function render() {
    // Numbers match whole numbers, so "week 2" does not match week 20 or the 2026 season.
    const terms = search.value.trim().toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const edition = `${card.dataset.season}:${card.dataset.kind}:${card.dataset.week}`;
      const matches = (!season.value || card.dataset.season === season.value) && (!week.value || edition === week.value) && (!type.value || card.dataset.type === type.value) && terms.every((term) => matchesTerm(card.dataset.search ?? '', term));
      card.hidden = !matches;
      if (matches) visible++;
    }
    let weeks = 0;
    let notes = 0;
    for (const group of groups) {
      group.hidden = !group.querySelector('[data-article]:not([hidden])');
      if (!group.hidden) group.dataset.kind === 'league-week' ? weeks++ : notes++;
    }

    const [selectedSeason, selectedKind] = week.value.split(':');
    const sequence = selectedKind === 'league-week' ? groups.filter((group) => group.dataset.kind === 'league-week' && group.dataset.season === selectedSeason).sort((a, b) => Number(a.dataset.week) - Number(b.dataset.week)) : [];
    const index = sequence.findIndex((group) => group.dataset.edition === week.value);
    steps.hidden = index < 0 || sequence.length < 2;
    stepLink('previous-edition', sequence[index - 1], 'Earlier');
    stepLink('next-edition', index < 0 ? undefined : sequence[index + 1], 'Later');

    const notesOnly = type.value === 'league-note' || selectedKind === 'clubhouse';
    if (noWeeks) noWeeks.hidden = notesOnly;
    const recapsWanted = type.value === 'recap' || selectedKind === 'league-week';
    empty.hidden = visible !== 0 || (!hasRecaps && recapsWanted && !terms.length);
    count.textContent = `${plural(visible, 'filing')}${visible ? ` · ${weeks ? plural(weeks, 'week') : 'no weeks filed'}${notes ? ' · clubhouse notes' : ''}` : ''}${terms.length || season.value || week.value || type.value ? ' match your filters' : ''}`;

    const chosen = [season, week, type].filter((select) => select.value).length;
    active.textContent = chosen ? `(${chosen} on)` : '';
    for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-article-link]')) {
      const url = new URL(link.href);
      url.searchParams.set('from', location.pathname + location.search);
      link.href = url.pathname + url.search;
    }
  }

  function apply() {
    const params = new URLSearchParams();
    if (search.value.trim()) params.set('q', search.value.trim());
    if (season.value) params.set('season', season.value);
    if (week.value) params.set('edition', week.value);
    if (type.value) params.set('type', type.value);
    const next = '/archive/' + (params.size ? `?${params}` : '');
    if (next !== location.pathname + location.search) history.pushState(null, '', next);
    render();
  }

  form.addEventListener('submit', (event) => { event.preventDefault(); apply(); });
  for (const select of [season, week, type]) select.addEventListener('change', () => {
    if (select === season && week.value && season.value && !week.value.startsWith(`${season.value}:`)) week.value = '';
    if (select === week && week.value) season.value = week.value.split(':')[0];
    if (select === week && week.value) type.value = week.value.split(':')[1] === 'league-week' ? (type.value === 'league-note' ? '' : type.value) : (type.value === 'recap' ? '' : type.value);
    apply();
  });
  for (const link of document.querySelectorAll<HTMLAnchorElement>('#clear-filters, #empty-reset')) link.addEventListener('click', (event) => {
    event.preventDefault();
    form.reset();
    for (const control of [season, week, type, search]) control.value = '';
    apply();
    search.focus();
  });
  window.addEventListener('popstate', () => { readUrl(); render(); });
  readUrl();
  // Small screens start with the selects folded unless the reader chose filters in the URL.
  if (matchMedia('(max-width: 640px)').matches && !new URLSearchParams(location.search).has('season') && !new URLSearchParams(location.search).has('edition') && !new URLSearchParams(location.search).has('type')) more.open = false;
  render();
}
