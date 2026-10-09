import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Edition = { path: string; entries: Article[]; article: Article };

export async function allArticles() {
  return (await getCollection('articles')).sort((a, b) => b.data.published.localeCompare(a.data.published) || b.data.week - a.data.week || a.data.title.localeCompare(b.data.title));
}
export const isRecap = (article: Article) => article.data.type === 'recap';
export function readingTime(article: Article) {
  return Math.max(1, Math.ceil((article.body ?? '').split(/\s+/).length / 200));
}
export function displayDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
export const seasonLabel = (season: string) => season.replace('-', '–');
export function kindLabel(article: Article) {
  return isRecap(article) ? 'Weekly recap' : 'Clubhouse note';
}
export function editionLabel(article: Article) {
  return isRecap(article) ? `Week ${article.data.week}` : 'Clubhouse';
}
/** Short docket code, e.g. W03 or CL. Decorative; the edition label carries the meaning. */
export function docketCode(article: Article) {
  return isRecap(article) ? `W${String(article.data.week).padStart(2, '0')}` : 'CL';
}
export function docketNumber(article: Article) {
  return `DNP-${article.data.season.replace('-', '')}-${docketCode(article)}`;
}
export function editionKey(article: Article) {
  return `${article.data.season}:${article.data.editionKind}:${article.data.week}`;
}
export function editionPath(article: Article) {
  return isRecap(article) ? `/archive/${article.data.season}/recaps/week-${article.data.week}/` : `/archive/${article.data.season}/clubhouse/`;
}
/** Recap weeks first (newest season, latest week), clubhouse notes last within each season. */
export function editions(articles: Article[]): Edition[] {
  const groups = new Map<string, Article[]>();
  for (const article of articles) {
    const key = editionPath(article);
    groups.set(key, [...(groups.get(key) ?? []), article]);
  }
  return [...groups.entries()]
    .map(([path, entries]) => ({ path, entries, article: entries[0] }))
    .sort((a, b) => b.article.data.season.localeCompare(a.article.data.season) || Number(isRecap(b.article)) - Number(isRecap(a.article)) || b.article.data.week - a.article.data.week);
}
/** Recap weeks of one season, oldest first, for earlier/later navigation. */
export function weekSequence(groups: Edition[], season: string) {
  return groups.filter((group) => isRecap(group.article) && group.article.data.season === season).sort((a, b) => a.article.data.week - b.article.data.week);
}
