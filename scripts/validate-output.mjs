import { readdir, readFile, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
const root = resolve('dist');
const files = (await readdir(root, { recursive: true })).filter((file) => file.endsWith('.html'));
const errors = [];
let links = 0;
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
console.log(`Static output valid: ${files.length} pages, ${links} internal links/assets checked.`);
