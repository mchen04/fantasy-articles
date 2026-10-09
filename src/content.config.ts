import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema } from './lib/article-schema.mjs';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles', generateId: ({ data }) => String(data.slug) }),
  schema: articleSchema,
});

export const collections = { articles };
