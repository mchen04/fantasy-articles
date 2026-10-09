import { readdir, readFile, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
const root = resolve('dist');
const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith('.html'));
const errors = [];
let links = 0;
// Retired pre-DNP strategy guides and branding must never ship as published content.
const retired = ['read-your-league-before-you-draft', 'draft-in-tiers-not-a-fixed-list', 'know-when-to-hold-and-when-to-move', 'build-a-balanced-redraft-bench', 'build-a-weekly-roster-routine', 'points-and-categories-need-different-plans', 'evaluate-a-trade-without-the-noise', 'stream-with-a-purpose'];
const privateLeague = /league[_ -]?id\b|fantasy\.espn\.com\/basketball\/(?:league|team|boxscore)|fantasysports\.yahoo\.com\/nba\/\d|sleeper\.(?:com|app)\/leagues?\/|fantrax\.com\/fantasy\/league|cbssports\.com\/basketball\/fantasy\/league|discord\.(?:gg|com\/invite)|groupme\.com\/join|chat\.whatsapp\.com/i;
const published = new Set((await readdir(resolve('src/content/articles'))).filter((file) => file.endsWith('.md')).map((file) => `/articles/${file.slice(0, -3)}/`));
for (const file of [...files, 'rss.xml', 'sitemap.xml']) {
  const text = await readFile(join(root, file), 'utf8').catch(() => { errors.push(`${file}: missing`); return ''; });
  if (/\bBaseline\b/.test(text)) errors.push(`${file}: retired Baseline branding`);
  if (/\b(?:Strategy guide|Guide edition|original-guide)\b/i.test(text)) errors.push(`${file}: retired guide labeling`);
  for (const slug of retired) if (text.includes(slug)) errors.push(`${file}: retired guide ${slug}`);
  if (privateLeague.test(text)) errors.push(`${file}: private league identifier or invite`);
  for (const match of text.matchAll(/\/articles\/([a-z0-9-]+)\//g)) if (!published.has(match[0])) errors.push(`${file}: links unpublished article ${match[0]}`);
}
for (const route of published) {
  for (const feed of ['rss.xml', 'sitemap.xml']) if (!(await readFile(join(root, feed), 'utf8').catch(() => '')).includes(route)) errors.push(`${feed}: missing ${route}`);
}
const articleRoutes = (await readdir(join(root, 'articles'))).map((slug) => `/articles/${slug}/`);
for (const route of articleRoutes) if (!published.has(route)) errors.push(`dist${route}: article route without source`);
for (const file of files) {
  const html = await readFile(join(root, file), 'utf8');
  if (!/<h1[\s>]/.test(html) || !/<title>[^<]+<\/title>/.test(html)) errors.push(`${file}: missing title or primary heading`);
  for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|data:)/.test(value)) continue;
    const [path, fragment] = value.split('#');
    const clean = path.split('?')[0];
    const target = clean ? resolve(root, clean.startsWith('/') ? `.${clean}` : join(dirname(file), clean)) : join(root, file);
    const result = clean.endsWith('/') ? join(target, 'index.html') : target;
    if (!result.startsWith(root)) { errors.push(`${file}: route escapes output`); continue; }
    try {
      await access(result);
      if (fragment && result.endsWith('.html')) {
        const body = result === join(root, file) ? html : await readFile(result, 'utf8');
        if (!body.includes(`id="${fragment}"`)) errors.push(`${file}: missing anchor ${value}`);
      }
      links++;
    } catch { errors.push(`${file}: broken internal asset or route ${value}`); }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Static output valid: ${files.length} pages, ${links} internal links/assets checked; ${published.size} published articles in feed and sitemap; no retired guides, old branding, or private league links.`);
