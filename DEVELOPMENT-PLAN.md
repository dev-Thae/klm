# KLM Yayınları — Website Remaster: Development Plan

**Client:** KLM Yayınları — Turkish academic publisher specializing in Kelam (Islamic theology)
**Current site:** https://www.klmyayinlari.com/ (Wix)
**Date:** 2026-07-09

---

## 1. Audit of the current site

| Problem | Impact |
|---|---|
| Built on Wix with heavy runtime JS | Slow first paint, poor Core Web Vitals, poor SEO |
| Single cluttered page, ~40 covers dumped in a grid | No hierarchy, hard to browse or find a title |
| No per-book pages | Books can't rank in search, can't be linked/shared individually |
| Navigation mixes site sections with book categories | Confusing IA ("YUVA", "MÜTENEVVİA" as top-level nav) |
| Dead pages (Projeler is empty, İletişim 404s) | Broken trust signals |
| No structured data, weak metadata | Invisible to Google Books/Scholar-adjacent search traffic |
| Sales scattered as raw N11 links per cover | No consistent purchase flow |

## 2. Goals

1. A fast, modern, credible academic-press identity.
2. Every book gets its own indexable page (title, author, abstract, ISBN, buy links).
3. Catalog is browsable by series and searchable.
4. Author acquisition: a clear "publish your thesis/book with us" funnel (this is their stated service).
5. Editable by non-developers after handoff.

## 3. Tech stack (chosen: Svelte)

**SvelteKit (Svelte 5) + `adapter-static`, data module for the catalog, vanilla CSS design tokens, deployed on Cloudflare Pages.**

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **SvelteKit 2 / Svelte 5** | Client's stack preference; compiles to minimal JS, `adapter-static` prerenders every page (including all 31 book pages) to plain HTML |
| Content | `src/lib/data/books.js` — one array, one entry per book | Single source of truth; catalog grid, series counts, and `/kitap/[slug]` pages all derive from it |
| Styling | Vanilla CSS design tokens in `src/app.css` + scoped component styles | Tokens ported from the Phase-0 prototype; Svelte's scoped styles replace a CSS framework |
| CMS (Phase 3) | **Keystatic** (or Decap) pointed at the data module / Markdown | Free, Git-based, friendly editing UI without a database |
| Search/filter | Client-side (Svelte runes state) — catalog is ~40 items | No backend needed |
| Hosting | **Cloudflare Pages** (alt: Netlify/Vercel) | Free tier, global CDN, preview deploys; `npm run build` output is fully static |
| Analytics | Cloudflare Web Analytics or Plausible | Cookie-free, no consent banner burden |

**Alternatives considered:** Astro (original recommendation — content-first, but client prefers Svelte and SvelteKit prerendering achieves the same static output), Next.js (overkill — no dynamic/server needs), WordPress (hosting + maintenance burden), staying on Wix with a redesign (keeps the performance/SEO ceiling).

## 4. Information architecture

Mirrors the original site's page map (Yuva, Yeniler, series, Projeler, Events, İletişim):

```
/                     Yuva (home): hero, series overview, full catalog w/ filter+search, publish-with-us, contact
/yeniler              New releases (placeholder list until real publication dates are supplied)
/dizi/[slug]          Series pages: sistematik-kelam, sosyal-kelam, yontembilim, yabanci-dil, mutenevvia
/kitap/[slug]         Book detail: cover, künye, buy links (N11, Google Books), related titles
/projeler             Projects (placeholder content, clearly marked)
/etkinlikler          Events (placeholder content, clearly marked)
/iletisim             Contact (working this time)
```

Turkish is the primary locale; add `/en/` only if the foreign-language series grows (Astro i18n routing supports this later without rework).

## 5. Design system (implemented in the prototype)

- **Palette:** ink `#1B2437`, paper `#F6F5F1`, lacivert `#27457F`, gold accent `#A8842F`; series-coding hues (teal, plum, copper, sage) used only for small markers and cover bands. Full dark theme via token redefinition.
- **Type:** old-style serif stack (Iowan Old Style / Palatino / Georgia) for display + reading; system sans for UI labels/nav; letter-spaced uppercase eyebrows.
- **Motif:** eight-pointed star (khatam) geometric line pattern, Canvas-drawn, faint gold — references manuscript illumination without pastiche.
- **Covers:** until real cover scans are collected, typographic CSS covers (title + series band + colophon) keep the grid uniform and self-hosted.

## 6. Content model (book schema)

```ts
{
  title: string,
  slug: string,
  author?: string,          // ← needs collection from client
  series: 'sistematik-kelam' | 'sosyal-kelam' | 'yontembilim' | 'yabanci-dil' | 'mutenevvia',
  year?: number,
  isbn?: string,            // ← needs collection
  pages?: number,
  formats: ('ebook' | 'print')[],
  buyLinks: { n11?: url, googleBooks?: url },  // ← needs collection
  cover?: image,            // ← needs collection (scans)
  abstract?: string,
  featured: boolean
}
```

## 7. Phases

**Phase 0 — Prototype (done, this repo):** `site/index.html` — self-contained single-page remaster with the full design system, real catalog data (31 titles), filter/search, both themes.

**Phase 1 — SvelteKit build (scaffolded, this repo):**
- ✅ SvelteKit project with design tokens/components ported from prototype
- ✅ `books.js` data module with all 31 books; prerendered `/kitap/[slug]` page per book
- ✅ Catalog filter/search; `/projeler` page with clearly-marked placeholder projects
- ✅ Full page map matching the original site: `/yeniler`, `/dizi/[slug]` (5 series pages), `/etkinlikler`, `/iletisim`
- ✅ Two-tier navigation bar (primary pages + series row; hamburger under 860px) with active-page state
- ✅ File-based catalog: `database/books/<dir>/{meta.txt,cover.jpeg}` read server-side with Node fs (`$lib/server/catalog.js`, path configurable via `KLM_DB_DIR`); covers served by the prerendered `/kapak/[file]` endpoint so the database can live outside Vite's asset pipeline; real covers + full künye on book pages; demo-clone filler (`DEMO_COPIES_PER_BOOK`) while the catalog is small
- ✅ Light theme by default; opt-in dark toggle in the header (persisted in localStorage)
- ⬜ Verify build on host machine (`npm install && npm run build` — no Node in this VM)
- ⬜ Sitemap, OG images, `Book` JSON-LD structured data

**Phase 2 — Content completion (client-dependent):**
- Collect per-book: author names, ISBNs, years, abstracts, cover scans, N11 + Google Books URLs
- Write /hakkinda and /yayin-sureci copy; author submission form (Formspree/CF Forms)

**Phase 3 — CMS + handoff (2–3 days):**
- Keystatic admin for the books collection; editor documentation in Turkish

**Phase 4 — Launch:**
- Point DNS from Wix to Cloudflare Pages (keep domain registrar; lower TTL beforehand)
- 301 redirects from old Wix URLs where they exist; submit sitemap to Search Console
- Cancel Wix subscription after DNS propagation + 2 weeks

## 8. Quality checklist

- **Performance:** Lighthouse ≥ 95 all categories; no webfont CDN (system stacks or self-hosted subsets); images as AVIF/WebP with width hints
- **SEO:** per-page titles/descriptions in Turkish, canonical URLs, `Book`/`Organization` JSON-LD, sitemap.xml, hreflang if /en/ added
- **Accessibility:** WCAG AA contrast in both themes, keyboard-visible focus, `prefers-reduced-motion` respected, Turkish `lang` attributes
- **Content honesty:** no fabricated authors/ISBNs — fields stay empty until the client supplies them

## 9. Open items needed from the client

1. Author names for each title (many appear to be by the founding academic)
2. Cover scans or print-ready cover PDFs
3. ISBNs, publication years, page counts
4. Per-title N11 (and any other retailer) URLs
5. Social media profile URLs; confirmation that klmyayinlari@gmail.com is the contact address
6. Wix/domain registrar access for the DNS cutover
