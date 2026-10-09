import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, 'Use a real ISO calendar date');

export const articleSchema = z.object({
  schemaVersion: z.literal(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(10).max(100),
  description: z.string().min(40).max(200),
  author: z.string().min(3).max(80),
  published: date,
  sport: z.literal('basketball'),
  league: z.literal('NBA'),
  format: z.literal('redraft'),
  season: z.string().regex(/^\d{4}-\d{2}$/).refine((value) => Number(value.slice(5)) === (Number(value.slice(0, 4)) + 1) % 100, 'Season must span consecutive years'),
  week: z.number().int().min(1).max(60),
  edition: z.string().min(3).max(70),
  editionKind: z.enum(['editorial', 'league-week']),
  type: z.enum(['guide', 'recap']),
  topic: z.enum(['Foundations', 'Draft room', 'Weekly planning', 'Roster decisions', 'League recap']),
  provenance: z.object({
    kind: z.enum(['original-guide', 'verified-recap']),
    note: z.string().min(30).max(400),
    aiAssisted: z.boolean(),
    verifiedBy: z.string().min(3).optional(),
    verifiedAt: date.optional(),
  }).strict(),
  references: z.array(z.object({
    title: z.string().min(3).max(120),
    url: z.url().refine((value) => value.startsWith('https://'), 'Use an HTTPS public reference'),
    accessed: date,
  }).strict()).min(1),
}).strict().superRefine((article, ctx) => {
  if (article.type === 'guide' && (article.editionKind !== 'editorial' || article.provenance.kind !== 'original-guide')) {
    ctx.addIssue({ code: 'custom', message: 'Guides belong to editorial editions and use original-guide provenance' });
  }
  if (article.type === 'recap' && (article.editionKind !== 'league-week' || article.provenance.kind !== 'verified-recap' || !article.provenance.verifiedBy || !article.provenance.verifiedAt || article.topic !== 'League recap')) {
    ctx.addIssue({ code: 'custom', message: 'Recaps need league-week grouping, verified-recap provenance, a verifier, a verification date, and League recap topic' });
  }
});
