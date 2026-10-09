import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, 'Use a real ISO calendar date');

// DNP publishes league content only: verified weekly recaps and clubhouse notes.
// Clubhouse notes use week 0 and never stand in for a completed matchup week.
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
  week: z.number().int().min(0).max(60),
  edition: z.string().min(3).max(70),
  editionKind: z.enum(['league-week', 'clubhouse']),
  type: z.enum(['recap', 'league-note']),
  topic: z.enum(['League recap', 'League desk']),
  provenance: z.object({
    kind: z.enum(['verified-recap', 'original-note']),
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
  if (article.type === 'recap' && (article.editionKind !== 'league-week' || article.provenance.kind !== 'verified-recap' || !article.provenance.verifiedBy || !article.provenance.verifiedAt || article.topic !== 'League recap' || article.week < 1)) {
    ctx.addIssue({ code: 'custom', message: 'Recaps need league-week grouping, week 1 or later, verified-recap provenance, a verifier, a verification date, and League recap topic' });
  }
  if (article.type === 'league-note' && (article.editionKind !== 'clubhouse' || article.provenance.kind !== 'original-note' || article.topic !== 'League desk' || article.week !== 0 || article.provenance.verifiedBy || article.provenance.verifiedAt)) {
    ctx.addIssue({ code: 'custom', message: 'League notes need clubhouse grouping, week 0, original-note provenance, League desk topic, and no recap verification fields' });
  }
});
