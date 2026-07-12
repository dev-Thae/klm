# KLM Yayınları — website remaster (SvelteKit)

Modern rebuild of [klmyayinlari.com](https://www.klmyayinlari.com/). See `DEVELOPMENT-PLAN.md` for the full plan.

## Structure

```
database/books/          SOURCE OF TRUTH: one directory per book (meta.txt + cover image)
site/index.html          Static preview (self-contained, covers embedded — open directly in a browser)
src/                     SvelteKit app (Svelte 5, static output)
  lib/server/catalog.js  Reads database/ with Node fs at build time (works outside Vite's
                         asset pipeline); demo-copy count + parsing live here
  lib/data/series.js     Client-safe series list + pure helpers
  routes/kapak/[file]/   Endpoint that serves covers from the database directory;
                         prerendering writes them into build/ as /kapak/<slug>.jpeg
  routes/
    +page.svelte           Yuva (home): hero, series, filterable catalog, publishing process, contact
    yeniler/               New releases (placeholder list until real dates are supplied)
    dizi/[slug]/           One prerendered page per series (5 pages)
    kitap/[slug]/          One prerendered page per book (31 pages)
    projeler/              Projects page (placeholder/mock content, marked as such)
    etkinlikler/           Events page (placeholder/mock content, marked as such)
    iletisim/              Contact page
```

Navigation mirrors the original site's page map: Yuva · Yeniler · the five series ·
Projeler · Etkinlikler · İletişim. The header is two-tier on desktop (primary pages +
series row) and collapses to a hamburger menu under 860px.

## Run

Requires Node 20+.

```sh
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # static site in build/
npm run preview    # serve the production build
```

> **Note:** don't run `npm install` inside a VirtualBox shared folder — it can't
> create the symlinks `node_modules` needs. Run on the host machine (or copy the
> project to a native filesystem first).

## Adding / editing books

Books live in `database/books/`, one directory per book:

```
database/books/67_yeni_kitap/
  cover.jpeg     cover image (jpg/jpeg/png/webp)
  meta.txt       "key: value" lines
```

`meta.txt` keys: `id`, `title`, `author`, `editor`, `translator`, `publisher`, `isbn`,
`year`, `edition`, `pages`, `language` (tr/en/ar), `description`, and optional `series`
(`sistematik` / `sosyal` / `yontembilim` / `yabanci` / `mutenevvia`; defaults to
`mutenevvia`). Use `-` or leave empty for unknown values — they're simply not shown.

Drop the directory in and rebuild: the book appears in the catalog, Yeniler, its series
page and count, and gets its own page at `/kitap/<slug>` (slug derives from the directory
name minus the numeric prefix). No code changes needed.

The database is read with plain Node `fs` (not Vite imports), so it can live anywhere:
by default it's `./database` next to `package.json`; set the `KLM_DB_DIR` environment
variable to point somewhere else, e.g.

```sh
KLM_DB_DIR=/path/to/database npm run dev
```

Covers are served at `/kapak/<slug>.<ext>` by a prerendered endpoint, so they work in
dev and are copied into the static `build/` output. Restart the dev server after adding
or editing books — the catalog is read once at startup.

**Demo filler:** while the catalog is small, each real book is cloned
`DEMO_COPIES_PER_BOOK` times (top of `src/lib/data/books.js`) and tagged "demo" to make
the shelf look stocked. Set it to `0` when the real catalog is in.

## Theme

Light is the default. The header has a sun/moon toggle; the choice persists in
`localStorage` and dark mode only applies when the visitor opts in.

## Deploy

`npm run build` produces a fully static `build/` directory — host it on Cloudflare
Pages, Netlify, Vercel, or any static host. See the plan for the Wix DNS cutover steps.

**GitHub Pages:** `.github/workflows/deploy.yml` builds and deploys automatically on
every push to `main`. One-time setup: in the repo's Settings → Pages, set Source to
"GitHub Actions". The workflow builds with `BASE_PATH=/<repo-name>` so the site works
at `https://<username>.github.io/<repo-name>/`; every internal link/asset path in the
app respects `$app/paths`' `base` for this reason — don't hardcode absolute `href`/`src`
paths when adding new pages or components.
