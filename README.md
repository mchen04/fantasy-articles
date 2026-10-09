# DNP: Did Not Plan

The petty paper of record for one NBA Redraft league. Astro builds Markdown league articles into a static tabloid-courtroom site. The site needs no database, authentication, or runtime secrets.

Production: https://fantasy-articles.vercel.app

## Develop and verify

Use Node 24 and npm.

```sh
npm ci
npm run dev
npm run verify
npm run preview
```

`npm run verify` validates article data, checks Astro types, builds production output, and checks every generated internal link and asset. It also confirms the feed and sitemap list every article and that no retired guides, old branding, or private league links ship. CI runs this command on the exact article PR head. Vercel also runs it before deployment.

## Content

Articles live in `src/content/articles/<slug>.md`. DNP publishes only league content:

- **Weekly recaps** (`type: recap`): one completed, verified matchup week each, week 1 or later.
- **Clubhouse notes** (`type: league-note`): league desk notes, always week 0, never a matchup week.

See [the content contract](docs/content-contract.md) for every field, privacy rule, the authorized weekly workflow, and publication steps.

The site launched with one clubhouse note and no recaps. The weekly archive stays honestly empty until the first verified recap is merged.

## Site behavior

- Front page: tabloid lead for the newest filing, the weekly docket (or an empty-docket state), a sealed standings board that never shows zeros, and the house rules.
- Find a week (`/archive/`): search plus season, week, and kind filters. URL parameters preserve filter state and browser history. Week routes are `/archive/<season>/recaps/week-<n>/`; notes live at `/archive/<season>/clubhouse/`.
- Earlier/later links step between recap weeks on archive and article pages.
- Article pages: docket header, contents, comfortable reading measure, "The record" provenance block with verifier and exhibits, and return links that preserve the reader's archive filters.
- Design tokens (colors, type scale, spacing) live at the top of `src/styles/global.css`. Fonts: Anton (display), Source Serif 4 (reading), IBM Plex Mono (labels).
- Visible keyboard focus, 44px touch targets, reduced-motion support, and a useful 404.

## Deploy

`main` deploys to production through the Vercel Git integration on project `fantasy-articles`. Check a deployment with the logged-in CLI:

```sh
vercel ls fantasy-articles
vercel inspect https://fantasy-articles.vercel.app
```

The repository stores no credentials. Vercel project linkage stays in ignored `.vercel/` files. Evidence, screenshots, and browser receipts live outside Git.

Article automation follows the exact-head PR procedure in the content contract, including its bounded chat ingestion, weekly schedule, and privacy boundary.
