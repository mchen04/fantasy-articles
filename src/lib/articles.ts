import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export async function allArticles() {
  return (await getCollection('articles')).sort((a, b) => b.data.published.localeCompare(a.data.published) || b.data.week - a.data.week || a.data.title.localeCompare(b.data.title));
}
export function readingTime(article: Article) {
  return Math.max(1, Math.ceil((article.body ?? '').split(/\s+/).length / 200));
}
export function displayDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
export function editionLabel(article: Article) {
  return article.data.editionKind === 'editorial' ? `Guide edition ${article.data.week}` : `League week ${article.data.week}`;
}
export function editionPath(article: Article) {
  return `/archive/${article.data.season}/${article.data.editionKind === 'editorial' ? 'guides' : 'recaps'}/week-${article.data.week}/`;
}
export function editions(articles: Article[]) {
  const groups = new Map<string, Article[]>();
  for (const article of articles) {
    const key = editionPath(article);
    groups.set(key, [...(groups.get(key) ?? []), article]);
  }
  return [...groups.entries()].map(([path, entries]) => ({ path, entries, article: entries[0] }));
}
