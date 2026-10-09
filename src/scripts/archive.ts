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
  const title = document.querySelector('#empty-title')!;
  const description = document.querySelector('#empty-description')!;
  const adjacent = document.querySelector<HTMLElement>('#edition-navigation')!;

  function readUrl() {
    const params = new URLSearchParams(location.search);
    search.value = (params.get('q') ?? '').slice(0, 100);
    season.value = params.get('season') ?? (location.pathname === '/archive/' ? '' : form!.dataset.initialSeason ?? '');
    const direct = form!.dataset.initialWeek ? `${form!.dataset.initialSeason}:${form!.dataset.initialKind}:${form!.dataset.initialWeek}` : '';
    week.value = params.get('edition') ?? (location.pathname === '/archive/' ? '' : direct);
    type.value = params.get('type') ?? '';
  }
  function render() {
    const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const edition = `${card.dataset.season}:${card.dataset.kind}:${card.dataset.week}`;
      const matches = (!season.value || card.dataset.season === season.value) && (!week.value || edition === week.value) && (!type.value || card.dataset.type === type.value) && terms.every((term) => card.dataset.search?.includes(term));
      card.hidden = !matches;
      if (matches) visible++;
    }
    let visibleGroups = 0;
    for (const group of groups) {
      group.hidden = ![...group.querySelectorAll<HTMLElement>('[data-article]')].some((card) => !card.hidden);
      if (!group.hidden) visibleGroups++;
    }
    const selected = week.value.split(':');
    const sequence = groups.filter((group) => group.dataset.season === selected[0] && group.dataset.kind === selected[1]).sort((a, b) => Number(a.dataset.week) - Number(b.dataset.week));
    const index = sequence.findIndex((group) => group.dataset.week === selected[2]);
    adjacent.hidden = index < 0;
    for (const [id, target] of [['previous-edition', sequence[index - 1]], ['next-edition', sequence[index + 1]]] as const) {
      const link = document.querySelector<HTMLAnchorElement>(`#${id}`)!;
      link.hidden = !target;
      if (target) {
        const params = new URLSearchParams(location.search);
        params.set('edition', `${target.dataset.season}:${target.dataset.kind}:${target.dataset.week}`);
        link.href = `/archive/?${params}`;
        link.textContent = `${id === 'previous-edition' ? '← Earlier' : 'Later'} ${target.dataset.kind === 'league-week' ? 'week' : 'edition'}${id === 'next-edition' ? ' →' : ''}`;
      }
    }
    count.textContent = `${visible} ${visible === 1 ? 'article' : 'articles'} across ${visibleGroups} ${visibleGroups === 1 ? 'edition' : 'editions'}`;
    empty.hidden = visible !== 0;
    const recaps = type.value === 'recap';
    title.textContent = recaps ? 'League recaps are on the way' : 'No articles match';
    description.textContent = recaps ? 'Recaps appear after verified league article content is supplied. Browse the strategy guides in the meantime.' : 'Try a different search or reset the filters.';
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
    if (select === week && week.value && season.value && !week.value.startsWith(`${season.value}:`)) season.value = week.value.split(':')[0];
    apply();
  });
  for (const link of document.querySelectorAll<HTMLAnchorElement>('#clear-filters, #empty-reset')) link.addEventListener('click', (event) => { event.preventDefault(); form.reset(); season.value = ''; week.value = ''; type.value = ''; search.value = ''; apply(); });
  window.addEventListener('popstate', () => { readUrl(); render(); });
  readUrl();
  render();
}
