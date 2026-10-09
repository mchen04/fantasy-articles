import { readdir, readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { articleSchema } from '../src/lib/article-schema.mjs';

const directory = new URL('../src/content/articles/', import.meta.url);
const files = (await readdir(directory, { recursive: true })).filter((file) => file.endsWith('.md'));
const slugs = new Set();
const editions = new Map();
const errors = [];
for (const file of files) {
  try {
    const source = await readFile(new URL(file, directory), 'utf8');
    const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error('Use YAML frontmatter enclosed by --- lines');
    const data = parse(match[1]);
    const content = match[2];
    const article = articleSchema.parse(data);
    if (file !== `${article.slug}.md`) throw new Error('Filename must match slug; keep articles in the top-level article directory');
    if (slugs.has(article.slug)) throw new Error('Duplicate slug');
    slugs.add(article.slug);
    if (article.published > new Date().toISOString().slice(0, 10)) throw new Error('Publication date is in the future');
    if (article.provenance.verifiedAt && article.provenance.verifiedAt > new Date().toISOString().slice(0, 10)) throw new Error('Verification date is in the future');
    if (content.trim().split(/\s+/).length < 250 || !/^## /m.test(content)) throw new Error('Body needs at least 250 words and one section heading');
    if (/<\/?[a-z][^>]*>/i.test(content) || /!\[|\]\((?:javascript:|data:)/i.test(content)) throw new Error('Raw HTML, embedded images, and unsafe links are outside the content contract');
    if (/lorem ipsum|INSERT HERE|TODO|TBD/i.test(content)) throw new Error('Unfinished content');
    if (/\]\((?:\.\.?\/|\/)/.test(content)) throw new Error('Use canonical /articles/ routes through public HTTPS URLs or omit internal body links');
    for (const ref of article.references) {
      if (ref.accessed > new Date().toISOString().slice(0, 10)) throw new Error('Reference access date is in the future');
      const url = new URL(ref.url);
      if (url.username || url.password || url.search || url.hash || ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) throw new Error('References must be public, credential-free URLs without query strings or fragments');
    }
    const key = `${article.season}/${article.editionKind}/${article.week}`;
    if (editions.has(key) && editions.get(key) !== article.edition) throw new Error('Edition titles must agree within one season/kind/week');
    editions.set(key, article.edition);
  } catch (error) { errors.push(`${file}: ${error.message}`); }
}
if (!files.length) errors.push('At least one published article is required');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Content valid: ${files.length} articles in ${editions.size} editions. Factual verification remains an editorial requirement.`);
