# Baseline

Independent NBA redraft publication. Astro builds Markdown articles into static pages. The site needs no database, authentication, or runtime secrets.

Production: https://fantasy-articles.vercel.app

## Develop and verify

Use Node 24 and npm.

```sh
npm ci
npm run dev
npm run verify
npm run preview
```

`npm run verify` validates article data, checks Astro types, builds production output, and checks every generated internal link and asset. CI runs this command on the exact article PR head. Vercel also runs it before deployment.

## Content

Articles live in `src/content/articles/<slug>.md`. See [the content contract](docs/content-contract.md) for every field, edition rules, source standards, and publication authorization.

The initial eight AI-assisted strategy guides form four editorial editions. They all publish October 9, 2026. These groups do not claim NBA game weeks or real league results. Verified recaps can join the archive when real content is supplied.

## Site behavior

- Home presents original court artwork, a starting guide, recent reading, and edition links.
- Archive filters season, edition/week, article type, and text search. URL parameters preserve filter state.
- Permanent edition routes use `/archive/<season>/guides/week-<n>/` or `/archive/<season>/recaps/week-<n>/`.
- Article links preserve the current archive. Reading pages include contents, references, reading time, and link copying.
- Light and dark themes persist in browser storage. Controls support keyboards and visible focus.
- Unknown routes return a useful 404. Metadata, RSS, social artwork, and a sitemap support discovery.

## Deploy

The authorized initial build pushes directly to `main`. Use the existing logged-in Vercel CLI:

```sh
vercel deploy --prod --yes
vercel inspect https://fantasy-articles.vercel.app
```

The Vercel project is `fantasy-articles`. The repository stores no credentials. Vercel project linkage stays in ignored `.vercel/` files. Evidence, screenshots, and browser receipts live outside Git.

For article automation, follow the exact-head PR procedure in the content contract. Do not configure a scheduler or private-message ingestion.
