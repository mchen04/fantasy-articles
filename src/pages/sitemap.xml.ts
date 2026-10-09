import { allArticles, editions } from '../lib/articles';
import type { APIRoute } from 'astro';
export const GET: APIRoute = async ({ site }) => {
  const articles = await allArticles();
  const paths = ['/', '/archive/', '/about/', ...editions(articles).map((group) => group.path), ...articles.map((article) => `/articles/${article.data.slug}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${new URL(path, site)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
