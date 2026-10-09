import { allArticles } from '../lib/articles';
import type { APIRoute } from 'astro';
const escape = (value: string) => value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
export const GET: APIRoute = async ({ site }) => {
  const articles = await allArticles();
  const items = articles.map(({ data }) => `<item><title>${escape(data.title)}</title><link>${new URL(`/articles/${data.slug}/`, site)}</link><guid isPermaLink="true">${new URL(`/articles/${data.slug}/`, site)}</guid><description>${escape(data.description)}</description><pubDate>${new Date(`${data.published}T00:00:00Z`).toUTCString()}</pubDate><category>${escape(data.topic)}</category></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Baseline</title><link>${site}</link><description>Independent NBA redraft strategy guides and verified league articles.</description><language>en-us</language>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml' } });
};
