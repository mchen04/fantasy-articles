# Article contract and authorized publication

This contract supports Dot's NBA Redraft article skill. It does not install or change that skill or Hermes.

## Content location and schema

Use UTF-8 Markdown at `src/content/articles/<slug>.md`. Keep filenames flat and equal to the frontmatter slug. Version 1 is defined in `src/lib/article-schema.mjs`. Astro and the content validator share this definition.

| Field | Required value or rule |
| --- | --- |
| `schemaVersion` | `1` |
| `slug` | Unique, lowercase words with hyphens; stable after publication |
| `title` | 10–100 characters |
| `description` | 40–200 characters; useful stand-alone summary |
| `author` | 3–80 characters; honest authorship, with AI disclosure when applicable |
| `published` | Quoted `YYYY-MM-DD`; real date, not future-dated |
| `sport` | `basketball` |
| `league` | `NBA` |
| `format` | `redraft` |
| `season` | Consecutive season years, such as `2026-27` |
| `week` | Integer 1–60; scoped to season and edition kind |
| `edition` | 3–70 character title; agrees across the same season/kind/week |
| `editionKind` | `editorial` for guides; `league-week` for recaps |
| `type` | `guide` or `recap` |
| `topic` | `Foundations`, `Draft room`, `Weekly planning`, `Roster decisions`, or `League recap` |
| `provenance.kind` | `original-guide` or `verified-recap` |
| `provenance.note` | 30–400 characters describing origin and factual limits |
| `provenance.aiAssisted` | Boolean; do not omit AI involvement |
| `provenance.verifiedBy` | Required for recaps; honest responsible verifier |
| `provenance.verifiedAt` | Required for recaps; quoted real ISO date |
| `references` | At least one public reference with `title`, HTTPS `url`, and quoted ISO `accessed` date |

Use at least 250 body words and one `##` heading. Standard paragraphs, lists, emphasis, blockquotes, and public HTTPS links are supported. Do not use raw HTML, embedded images, query-bearing source URLs, or executable links. Do not publish placeholders.

### Example guide

```yaml
---
schemaVersion: 1
slug: prepare-your-weekly-lineup
title: Prepare your weekly lineup
description: Check usable roster slots and current public information before your lineup locks for the next fantasy week.
author: Baseline Editorial (AI-assisted)
published: "2026-10-09"
sport: basketball
league: NBA
format: redraft
season: "2026-27"
week: 5
edition: Lineup preparation
editionKind: editorial
type: guide
topic: Weekly planning
provenance:
  kind: original-guide
  note: Original strategy guidance with AI assistance. No live results, player forecasts, or league scores are claimed.
  aiAssisted: true
references:
  - title: Official NBA schedule
    url: https://www.nba.com/schedule
    accessed: "2026-10-09"
---
```

Add the finished Markdown body after the closing delimiter. The example frontmatter alone is not publishable.

## Editorial and provenance rules

Guide edition numbers identify reading groups. They never stand in for NBA game weeks. A recap uses an actual verified league week and `topic: League recap`.

No private-message ingestion is authorized. Do not search private workspaces, transcripts, or messages for content. Never invent scores, results, player statistics, injuries, quotes, or verification identities.

Use public primary references or article content explicitly supplied for publication. Record the source and date. If supplied recap facts lack verifiable provenance, hold the recap until suitable evidence is supplied. A build cannot prove factual truth.

For verified supplied content without a public result URL, the provenance note must identify the supplied artifact and its authorization. Include a public rules/reference URL where appropriate. Do not publish private source material. Dot must preserve the supplied evidence outside the public repository.

Recaps need `verified-recap`, a real verifier, and a verification date. False metadata is not a substitute for verification. Guides carry honest AI authorship. Do not attribute them to Michael by default.

## Authorized automatic publication

Michael authorizes the NBA Redraft article skill to commit/push generated articles, create PRs, and automatically squash merge them into `mchen04/fantasy-articles`. No per-article approval is required after the exact-head checks below pass. This authorization supersedes the earlier exclusion only for this skill and repository.

It does not authorize private ingestion, unverified facts, schedules, infrastructure changes, unrelated code changes, or Hermes configuration. Keep routine article PRs within `src/content/articles/*.md`. Changes outside that path need their own task scope.

1. Generate or update complete articles under this contract. Keep existing slugs stable.
2. Verify factual provenance and honest authorship before committing.
3. Run `npm ci` and `npm run verify` on the exact proposed commit. Scan outgoing tracked source for accidental secrets.
4. Commit, push, and open a PR targeting `main`. Record its immutable `headRefOid`.
5. Wait for `Content and build` on that exact head. Require conclusion `success`, no unresolved failing checks, no conflicts, and an unchanged PR head. The workflow checks out the PR head SHA, not an assumed merge ref.
6. Read the PR again immediately before merge. If the head changes, restart checks for the new head.
7. Squash merge with the exact SHA guard: `gh pr merge <pr-number> --repo mchen04/fantasy-articles --squash --match-head-commit <head-sha>`.
8. Read back the merge commit and `main` SHA. Verify production deployment and open the new article route before claiming it is live.

Do not enable a blanket repository-wide auto-merge rule. The skill performs this narrow authorization. If a live CLI access error occurs, report it; never search for credentials.

## Required check

GitHub workflow: `.github/workflows/publication.yml`. Required job name for the skill: `Content and build`. It runs `npm run verify` with read-only repository permission.

The content check rejects schema mistakes, duplicate slugs, invalid/future publication dates, incomplete bodies, inconsistent editions, unsafe content, and missing recap verification metadata. The production check verifies local routes, assets, and section links. These checks do not prove the truth of article claims.

Vercel's connected Git integration deploys merges to production. The initial setup confirms the connection and deployment. A successful merge alone does not prove a new article is live; read back Vercel and the public route.

## Archive behavior

The collection creates new season and edition options from article data. Permanent links separate guide editions from league recap weeks. Search and filters use `q`, `season`, `edition` (`season:kind:week`), and `type` URL parameters. Article return links preserve these values. No page code needs editing for each new week.
