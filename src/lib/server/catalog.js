/**
 * KLM Yayınları catalog — read from the database directory with plain Node fs,
 * so it works no matter where the database lives (it is NOT served by Vite).
 *
 * Layout:
 *   <db>/books/<slug>/      published books (Yayınlarımız)
 *   <db>/ikinci-el/<slug>/  secondhand books for sale (Mağaza)
 * each folder holding
 *   meta.json  book metadata; the folder name must equal the "slug" field
 *   cover.jpeg cover image (jpg/jpeg/png/webp), optional
 * Series/category taxonomy lives in <db>/series.json (bundled via
 * $lib/data/series.js). Validate the database with `npm run db:validate`.
 *
 * Default location is ./database next to package.json; point the KLM_DB_DIR
 * environment variable at another path to move it anywhere.
 *
 * Covers are served by the prerendered endpoint /kapak/[file] (see
 * src/routes/kapak/[file]/+server.js), which reads coverPathFor() below.
 * Adding a book = adding a directory; every page derives from this module.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { base } from '$app/paths';
import { seriesList } from '$lib/data/series.js';

/**
 * Filler so the shelf looks stocked while the catalog is small: each real book
 * is cloned this many times, cycled across the series, and tagged "demo".
 * Set to 0 once the real catalog is in the database.
 */
const DEMO_COPIES_PER_BOOK = 0;

const DB_DIR = path.resolve(process.cwd(), process.env.KLM_DB_DIR ?? 'database');
const DB_BOOKS_DIR = path.join(DB_DIR, 'books');
const DB_SECONDHAND_DIR = path.join(DB_DIR, 'ikinci-el');

const COVER_FILE = /^cover\.(jpe?g|png|webp)$/i;

/** cover URL filename (ascii slug + ext) → absolute path on disk */
const coverPaths = new Map();

const joined = (names) => (names?.length ? names.join(', ') : null);

/** Every <slug>/ folder under dir that has a meta.json. A missing dir is just
 *  empty — git drops a folder once its last book is deleted. */
function readBookDirs(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.flatMap((entry) => {
			const dirPath = path.join(dir, entry.name);
			const files = readdirSync(dirPath);
			if (!files.includes('meta.json')) return [];
			const meta = JSON.parse(readFileSync(path.join(dirPath, 'meta.json'), 'utf-8'));
			return [{ name: entry.name, dirPath, files, meta }];
		});
}

const sourceBooks = readBookDirs(DB_BOOKS_DIR)
	.map(({ name, dirPath, files, meta }) => {
		const slug = meta.slug ?? name;

		// books without a cover image fall back to the plain default in static/
		let cover = `${base}/kapak-varsayilan.svg`;
		let coverThumb = cover;
		const coverFile = files.find((f) => COVER_FILE.test(f));
		if (coverFile) {
			const srcPath = path.join(dirPath, coverFile);
			// two resized/recompressed jpeg variants: a small one for grid
			// listings and a larger one for the book detail page — the
			// originals can be several MB each, far bigger than they're
			// ever displayed at, see src/routes/kapak/[file]/+server.js
			const thumbName = `${slug}-thumb.jpg`;
			const largeName = `${slug}-large.jpg`;
			coverPaths.set(thumbName, srcPath);
			coverPaths.set(largeName, srcPath);
			coverThumb = `${base}/kapak/${thumbName}`;
			cover = `${base}/kapak/${largeName}`;
		}

		return {
			id: meta.id,
			slug,
			title: meta.title ?? name,
			subtitle: meta.subtitle ?? null,
			author: joined(meta.authors),
			// short byline for cover grids; the full list stays on the book page
			authorShort:
				(meta.authors?.length ?? 0) > 2
					? meta.authors.slice(0, 2).join(', ') + '…'
					: joined(meta.authors),
			editor: joined(meta.editors),
			translator: joined(meta.translators),
			publisher: meta.publisher ?? null,
			isbn: meta.isbn ?? null,
			year: meta.year ?? null,
			edition: meta.edition ?? null,
			pages: meta.pages ?? null,
			language: meta.language ?? null,
			description: meta.description ?? null,
			categories: meta.categories ?? [],
			links: meta.links ?? {},
			series: meta.series ?? 'mutenevvia',
			cover,
			coverThumb,
			demo: false
		};
	})
	.sort(byId);

/** Numeric (real) ids first in order, then temp-N ids in import order. */
function byId(a, b) {
	const na = Number(a.id);
	const nb = Number(b.id);
	if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
	if (!Number.isNaN(na)) return -1;
	if (!Number.isNaN(nb)) return 1;
	return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
}

const demoBooks = [];
for (let copy = 1; copy <= DEMO_COPIES_PER_BOOK; copy++) {
	for (const [i, book] of sourceBooks.entries()) {
		demoBooks.push({
			...book,
			slug: `${book.slug}-demo-${copy}`,
			series: seriesList[(copy * sourceBooks.length + i) % seriesList.length].id,
			demo: true
		});
	}
}

export const books = [...sourceBooks, ...demoBooks];

/** Secondhand books for sale in the Mağaza, newest first. */
export const secondhandBooks = readBookDirs(DB_SECONDHAND_DIR)
	.map(({ name, dirPath, files, meta }) => {
		const slug = meta.slug ?? name;

		// thumb only: secondhand books are shown as cards, with no detail page.
		// "--" never occurs in a validated slug, so these names can't collide
		// with a published book's cover files.
		let coverThumb = null;
		const coverFile = files.find((f) => COVER_FILE.test(f));
		if (coverFile) {
			const thumbName = `ikinci-el--${slug}-thumb.jpg`;
			coverPaths.set(thumbName, path.join(dirPath, coverFile));
			coverThumb = `${base}/kapak/${thumbName}`;
		}

		return {
			slug,
			title: meta.title ?? name,
			author: joined(meta.authors),
			publisher: meta.publisher ?? null,
			year: meta.year ?? null,
			condition: meta.condition ?? null,
			price: meta.price ?? null,
			description: meta.description ?? null,
			added: meta.added ?? null,
			coverThumb,
			demo: meta.demo === true
		};
	})
	.sort((a, b) => (b.added ?? '').localeCompare(a.added ?? ''));

export function coverPathFor(file) {
	return coverPaths.get(file);
}

export function coverEntries() {
	return [...coverPaths.keys()].map((file) => ({ file }));
}

/** The real (non-demo) books, newest first — drives the home-page shelf row. */
export function newReleases(limit = 8) {
	return [...sourceBooks].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)).slice(0, limit);
}

export function booksBySeries(id) {
	return books.filter((b) => b.series === id);
}

export function bookBySlug(slug) {
	return books.find((b) => b.slug === slug);
}

export function relatedBooks(book, limit = 4) {
	return books.filter((b) => b.series === book.series && b.slug !== book.slug).slice(0, limit);
}
