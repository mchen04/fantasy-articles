# DNP article contract and authorized publication

DNP: Did Not Plan is exclusively the blog of Michael's NBA Redraft league. It publishes two things: verified weekly recaps of completed matchup weeks, and clubhouse notes from the league desk. It does not publish fantasy strategy guides, player advice, or general NBA coverage.

This contract supports the NBA Redraft article skill. The skill owner maintains the skill itself; this repository does not install or change it.

## Content location and schema

Use UTF-8 Markdown at `src/content/articles/<slug>.md`. Keep filenames flat and equal to the frontmatter slug. `schemaVersion` stays `1`. The schema lives in `src/lib/article-schema.mjs`; Astro and `scripts/validate-content.mjs` share it.

| Field | Required value or rule |
| --- | --- |
| `schemaVersion` | `1` |
| `slug` | Unique, lowercase words with hyphens; stable after publication |
| `title` | 10–100 characters |
| `description` | 40–200 characters; useful stand-alone summary |
| `author` | 3–80 characters; honest authorship. Use `DNP Desk (AI-assisted)` for AI-assisted writing. Do not attribute articles to Michael or any manager. |
| `published` | Quoted `YYYY-MM-DD`; real date, not future-dated |
| `sport` | `basketball` |
| `league` | `NBA` |
| `format` | `redraft` |
| `season` | Consecutive season years, such as `2026-27` |
| `week` | Integer 0–60. Recaps: the verified matchup week, `1` or later. League notes: always `0`. |
| `edition` | 3–70 character title; must agree across the same season/kind/week. Use `Clubhouse notes` for every league note. |
| `editionKind` | `league-week` for recaps; `clubhouse` for league notes |
| `type` | `recap` or `league-note` |
| `topic` | `League recap` for recaps; `League desk` for league notes |
| `provenance.kind` | `verified-recap` for recaps; `original-note` for league notes |
| `provenance.note` | 30–400 characters describing origin and factual limits |
| `provenance.aiAssisted` | Boolean; do not omit AI involvement |
| `provenance.verifiedBy` | Required for recaps; honest responsible verifier. Must be absent on league notes. |
| `provenance.verifiedAt` | Required for recaps; quoted real ISO date, not in the future. Must be absent on league notes. |
| `references` | At least one public reference with `title`, HTTPS `url`, and quoted ISO `accessed` date |

The validator rejects the retired values `guide`, `editorial`, `original-guide`, `Foundations`, `Draft room`, `Weekly planning`, and `Roster decisions`.

Use at least 250 body words and one `##` heading. Standard paragraphs, lists, emphasis, blockquotes, and public HTTPS links are supported. Do not use raw HTML, embedded images, query-bearing source URLs, or executable links. Do not publish placeholders.

### Example recap

```yaml
---
schemaVersion: 1
slug: week-3-recap-2026-27
title: Week 3 recap headline in the DNP voice
description: One or two honest sentences summarizing the verified week 3 results and why the week mattered.
author: DNP Desk (AI-assisted)
published: "2026-11-03"
sport: basketball
league: NBA
format: redraft
season: "2026-27"
week: 3
edition: A short title for week 3
editionKind: league-week
type: recap
topic: League recap
provenance:
  kind: verified-recap
  note: Written from week 3 matchup results verified against the league platform's final scoreboard. Private evidence is held outside the public repository.
  aiAssisted: true
  verifiedBy: Name or role of the responsible verifier
  verifiedAt: "2026-11-03"
references:
  - title: Official NBA schedule
    url: https://www.nba.com/schedule
    accessed: "2026-11-03"
---
```

### Example league note

```yaml
---
schemaVersion: 1
slug: court-is-now-in-session
title: Court is now in session, and nothing has happened yet
description: The opening note from DNP. What this NBA Redraft league blog will file each week, what it refuses to make up, and why the docket is empty today.
author: DNP Desk (AI-assisted)
published: "2026-10-09"
sport: basketball
league: NBA
format: redraft
season: "2026-27"
week: 0
edition: Clubhouse notes
editionKind: clubhouse
type: league-note
topic: League desk
provenance:
  kind: original-note
  note: Opening editorial note written by the DNP Desk with AI assistance. It explains how the blog will work. It reports no matchups, scores, standings, trades, or manager activity.
  aiAssisted: true
references:
  - title: Official NBA schedule
    url: https://www.nba.com/schedule
    accessed: "2026-10-09"
---
```

Add the finished Markdown body after the closing delimiter. Frontmatter alone is not publishable.

## Editorial, provenance, and privacy rules

- League notes are never completed matchup weeks. Never label a note as week 1, and never publish a note as a stand-in recap.
- A recap covers one actual, completed, verified matchup week. If a week's data is incomplete, hold the recap. Do not fill gaps.
- Unknown standings, scores, records, or trades stay unknown. Never render or write them as zero. Say they are unavailable or leave them out.
- Never invent scores, results, player statistics, injuries, quotes, trades, events, or verification identities.
- Do not publish manager identities: no real names, usernames, handles, avatars, emails, or phone numbers. Refer to teams by team names that contain no personal identity, or by neutral labels.
- Do not publish the league ID, private league URLs, invite links, chat links, screenshots, or verbatim private messages. The content validator rejects common league-platform league URLs, `league id` strings, and chat invite links. The output check repeats this scan on the built site.
- A public result URL is not required. A recap is valid with an official public NBA or platform rules/schedule reference plus an honest `provenance.note` describing the private evidence (for example, "verified against the league platform's final week 3 scoreboard"). Never link the private source.
- The skill preserves its private evidence outside this public repository.
- Public pages must not expose internal errors, retry states, job IDs, or system identifiers. If generation fails, publish nothing.

A build cannot prove factual truth. Verification is the skill's responsibility before commit.

## Authorized article workflow

Michael authorizes the NBA Redraft article skill, for this repository only, to do the following. This supersedes the earlier "no private ingestion" and "no schedule" exclusions, only inside this article workflow.

### Bounded chat ingestion

The skill may read the league conversation that Michael designated for this purpose, bounded to:

- the designated league chat only, not other chats, workspaces, transcripts, or accounts;
- the window of the matchup week being recapped;
- extracting league facts needed for that week's recap and for verification.

The skill must not copy chat text, names, handles, or links into the repository. Chat content is evidence, never published material. Keep any retained evidence outside Git. Credentials stay where they already are; never search for, copy, or print tokens.

### Weekly scheduling

The skill may run on a weekly schedule after each matchup week completes. Each run either publishes one verified recap for the completed week or publishes nothing. A run that cannot verify the week stops and reports privately; it does not publish a placeholder, a partial recap, or an error page.

### Privacy boundary

Everything in the privacy rules above applies to scheduled runs. The public site shows only finished, verified articles. The schedule configuration, chat identity, and evidence live with the skill, not in this repository.

## Authorized automatic publication

Michael authorizes the article skill to commit/push generated articles, create PRs, and automatically squash merge them into `mchen04/fantasy-articles`. No per-article approval is required after the exact-head checks pass. This is narrow standing permission for the article skill, not blanket repository permission.

It does not authorize unverified facts, infrastructure changes, design or code changes, or unrelated files. Keep routine article PRs within `src/content/articles/*.md`. Changes outside that path need their own task scope.

1. Generate or update complete articles under this contract. Keep existing slugs stable.
2. Verify factual provenance, privacy, and honest authorship before committing.
3. Run `npm ci` and `npm run verify` on the exact proposed commit. Scan outgoing tracked source for accidental secrets, league IDs, and private URLs.
4. Commit, push, and open a PR targeting `main`. Record its immutable `headRefOid`.
5. Wait for `Content and build` on that exact head. Require conclusion `success`, no unresolved failing checks, no conflicts, and an unchanged PR head. The workflow checks out the PR head SHA, not an assumed merge ref.
6. Read the PR again immediately before merge. If the head changes, restart checks for the new head.
7. Squash merge with the exact SHA guard: `gh pr merge <pr-number> --repo mchen04/fantasy-articles --squash --match-head-commit <head-sha>`.
8. Read back the merge commit and `main` SHA. Verify the production deployment and open the new article route before claiming it is live.

Do not enable a blanket repository-wide auto-merge rule. If a live CLI access error occurs, report it; never search for credentials.

## Required check

GitHub workflow: `.github/workflows/publication.yml`. Required job name: `Content and build`. It checks out the exact PR head SHA and runs `npm run verify` with read-only repository permission.

`npm run verify` runs:

1. `scripts/validate-content.mjs`: schema, duplicate slugs, filename/slug match, future dates, body length and heading, unsafe content, placeholders, edition-title agreement, recap verification fields, and private league URL/ID/invite scanning.
2. `astro check`: types.
3. `astro build`: static output.
4. `scripts/validate-output.mjs`: every internal link, asset, and anchor; every published article appears in `rss.xml` and `sitemap.xml`; no article route without a source file; no retired guide slugs, retired branding, or private league identifiers anywhere in the output.

These checks do not prove the truth of article claims.

Vercel's connected Git integration deploys `main` to production at https://fantasy-articles.vercel.app. A successful merge alone does not prove a new article is live; read back Vercel and the public route.

## Routes and archive behavior

| Content | Route |
| --- | --- |
| Article | `/articles/<slug>/` |
| Recap week | `/archive/<season>/recaps/week-<n>/` |
| Clubhouse notes | `/archive/<season>/clubhouse/` |
| Archive with filters | `/archive/?q=&season=&edition=<season>:<editionKind>:<week>&type=<recap or league-note>` |

New seasons, weeks, filter options, earlier/later week links, the front page lead, the weekly docket, RSS, and the sitemap all come from article data. Adding a verified recap file needs no page edits. Article return links preserve the archive filters the reader came from.
