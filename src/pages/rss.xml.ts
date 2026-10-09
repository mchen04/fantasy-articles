import { allArticles } from '../lib/articles';
import type { APIRoute } from 'astro';
const escape = (value: string) => value.replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
export const GET: APIRoute = async ({ site }) => {
  const articles = await allArticles();
  const items = articles.map(({ data }) => `<item><title>${escape(data.title)}</title><link>${new URL(`/articles/${data.slug}/`, site)}</link><guid isPermaLink="true">${new URL(`/articles/${data.slug}/`, site)}</guid><description>${escape(data.description)}</description><pubDate>${new Date(`${data.published}T00:00:00Z`).toUTCString()}</pubDate><category>${escape(data.topic)}</category></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>DNP: Did Not Plan</title><link>${site}</link><description>The petty paper of record for one NBA Redraft league. Verified weekly recaps and clubhouse notes.</description><language>en-us</language>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml' } });
};
