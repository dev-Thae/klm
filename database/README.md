# Book database

Everything the site knows about the catalog lives here, as plain files you can
edit by hand — or add through the admin page, `/yonetim` (see the main README).
Rebuild the site (`npm run build`) after any change.

```
database/
  series.json          series/category taxonomy (id, slug, label, description)
  books/<slug>/        one folder per book — folder name MUST equal the slug
    meta.json          all metadata for the book
    cover.jpeg         cover image (jpg/jpeg/png/webp); if missing, the site
                       shows the plain default (static/kapak-varsayilan.svg)
  ikinci-el/<slug>/    one folder per secondhand book for sale in the Mağaza
    meta.json          see "Secondhand books" below
    cover.jpg          optional photo; without one the card shows a typographic cover
  googlebookslist.csv  Google Play Books export (import source, not read by the site)
```

## Adding a book

1. Create `books/<slug>/` — lowercase ASCII words separated by `-`
   (e.g. `kelamda-teodise`). The folder name becomes the URL: `/kitap/<slug>`.
2. Copy a `meta.json` from another book and edit it. Required: `id`, `slug`
   (same as the folder name), `title`. Use `null` for unknown values, `[]` for
   empty lists. `series` must be an `id` from `series.json` (or `null` while
   undecided — the site then files it under Mütenevvia).
3. Drop in `cover.jpeg`.
4. Check your work: `npm run db:validate` — it catches broken JSON, duplicate
   ISBNs/slugs/ids, unknown series, and lists what is still missing.

Removing or renaming a folder removes/renames the book. Nothing else to update.

## meta.json fields

| Field | Example | Notes |
|---|---|---|
| `id` | `64` or `"temp-3"` | real catalog number; temp ids until known |
| `slug` | `"kelamda-teodise"` | must equal the folder name |
| `title`, `subtitle` | | display form (Turkish title case) |
| `authors`, `editors`, `translators` | `["Recep Ardoğan"]` | arrays, may be empty |
| `isbn` | `"9786258386653"` | ISBN-13, digits only, or `null` |
| `year`, `edition`, `pages` | `2025`, `1`, `157` | numbers or `null` |
| `language` | `"tr"` | `tr` / `en` / `ar` |
| `series` | `"sosyal"` | an `id` from `series.json`, or `null` |
| `categories` | `["Religion / Theology"]` | free-form subject tags (BISAC) |
| `description` | | plain text, `\n\n` between paragraphs |
| `links.googlePlay` | | store URL or `null` |

## Secondhand books (`ikinci-el/`)

Single copies sold through the Mağaza page; delete the folder once a book is sold.

| Field | Example | Notes |
|---|---|---|
| `slug` | `"mukaddime"` | required, must equal the folder name |
| `title` | `"Mukaddime"` | required |
| `price` | `380` or `249.9` | required, TL |
| `authors` | `["İbn Haldun"]` | array, may be empty |
| `publisher`, `year` | `"Dergâh Yayınları"`, `2015` | or `null` |
| `condition` | `"Çok iyi"` | Yeni gibi / Çok iyi / İyi / Orta / Yıpranmış |
| `description` | | plain text: condition notes, volumes… |
| `added` | `"2026-10-30"` | date listed; the Mağaza shows newest first |
| `demo` | `true` | sample item, shown with an "örnek" tag — delete before going live |

## Importing from the Google Play export

`npm run db:import -- --limit 7` converts rows of `googlebookslist.csv` into
book folders. Already-imported books (same slug or ISBN) are skipped, so it is
safe to re-run with a higher limit. Imported books get `temp-N` ids, no series
and no cover — fill those in by hand afterwards. `--dry-run` previews.
