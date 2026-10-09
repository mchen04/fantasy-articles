import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fantasy-articles.vercel.app',
  output: 'static',
  trailingSlash: 'always',
  markdown: { syntaxHighlight: false },
});
