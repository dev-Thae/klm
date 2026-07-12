/**
 * One-time importer: database/googlebookslist.csv (Google Play Books export,
 * UTF-16 tab-separated) → database/books/<slug>/meta.json
 *
 * Usage:
 *   node scripts/import-googlebooks.mjs [--limit N] [--dry-run]
 *
 * - Creates at most N new book folders (default 7), top of the file first.
 * - Rows already in the database (same slug or same ISBN) are skipped, so the
 *   script is safe to re-run with a higher limit later.
 * - Real ids are not known yet; imported books get sequential "temp-N" ids.
 *   Replace them (and fill isbn/year/series/…) by editing meta.json by hand.
 * - Covers are not in the export; drop a cover.jpeg into the folder yourself.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CSV_PATH = path.join(ROOT, 'database', 'googlebookslist.csv');
const BOOKS_DIR = path.join(ROOT, 'database', 'books');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx === -1 ? 7 : Number(args[limitIdx + 1]);
if (!Number.isInteger(LIMIT) || LIMIT < 1) {
	console.error('--limit must be a positive integer');
	process.exit(1);
}

/* ---------- text helpers (Turkish-aware) ---------- */

const KEEP_LOWER = new Set(['ve', 'ile', 'de', 'da', 'için', 'bir']);

function titleCaseTr(text) {
	if (!text) return text;
	return text.toLocaleLowerCase('tr').replace(/[\p{L}\p{N}'’]+/gu, (word, offset) => {
		if (offset > 0 && KEEP_LOWER.has(word)) return word;
		return word.charAt(0).toLocaleUpperCase('tr') + word.slice(1);
	});
}

function cleanText(text) {
	if (!text) return text;
	return text
		.replace(/(\p{L})[�￾](\p{L})/gu, '$1İ$2')
		.replace(/[�￾]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function slugify(text) {
	const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
	return text
		.toLocaleLowerCase('tr')
		.replace(/[çğıöşüâîû]/g, (c) => map[c] ?? c)
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** "<p>…</p>&#39;…" → plain text with paragraph breaks */
function htmlToText(html) {
	if (!html) return null;
	const text = html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.split(/\n{2,}/)
		.map((p) => p.replace(/\s+/g, ' ').trim())
		.filter(Boolean)
		.join('\n\n');
	return text || null;
}

/* ---------- TSV parsing (quoted fields may contain tabs/newlines) ---------- */

function parseTsv(text) {
	const rows = [];
	let row = [];
	let field = '';
	let inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else inQuotes = false;
			} else field += c;
		} else if (c === '"') {
			inQuotes = true;
		} else if (c === '\t') {
			row.push(field);
			field = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			field = '';
			if (row.some((f) => f !== '')) rows.push(row);
			row = [];
		} else field += c;
	}
	row.push(field);
	if (row.some((f) => f !== '')) rows.push(row);
	return rows;
}

/* ---------- read + decode the export ---------- */

const buf = readFileSync(CSV_PATH);
const encoding =
	buf[0] === 0xff && buf[1] === 0xfe ? 'utf16le' : buf[0] === 0xfe ? 'utf16be' : 'utf8';
if (encoding === 'utf16be') {
	console.error('UTF-16 BE is not supported; re-export the file.');
	process.exit(1);
}
const rows = parseTsv(buf.toString(encoding).replace(/^﻿/, ''));

const header = rows[0];
const col = (name) => {
	const i = header.indexOf(name);
	if (i === -1) throw new Error(`Column not found in export: ${name}`);
	return i;
};
const COL = {
	identifier: col('Identifier'),
	playLink: col('Play Store Link (Do Not Modify)'),
	title: col('Title'),
	subtitle: col('Subtitle'),
	contributors: col('Contributor [Role], Semicolon-Separated'),
	language: col('Language'),
	subjects: col('Subject Code [Schema], Semicolon-Separated'),
	description: col('Description'),
	pubDate: col('Publication Date'),
	pages: col('Page Count'),
	seriesName: col('Series Name')
};

/* ---------- what is already in the database ---------- */

const existingSlugs = new Set();
const existingIsbns = new Set();
let maxTempId = 0;
if (existsSync(BOOKS_DIR)) {
	for (const entry of readdirSync(BOOKS_DIR, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		existingSlugs.add(entry.name);
		const metaPath = path.join(BOOKS_DIR, entry.name, 'meta.json');
		if (!existsSync(metaPath)) continue;
		const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
		if (meta.slug) existingSlugs.add(meta.slug);
		if (meta.isbn) existingIsbns.add(meta.isbn);
		const m = /^temp-(\d+)$/.exec(String(meta.id));
		if (m) maxTempId = Math.max(maxTempId, Number(m[1]));
	}
}

/* ---------- import ---------- */

const LANG = { tur: 'tr', eng: 'en', ara: 'ar' };
let created = 0;
let skipped = 0;

for (const row of rows.slice(1)) {
	if (created >= LIMIT) break;

	const title = titleCaseTr(cleanText(row[COL.title]));
	if (!title) {
		console.warn(`skip  ${row[COL.identifier]}: empty title (fix by hand)`);
		skipped++;
		continue;
	}

	const identifier = row[COL.identifier];
	const isbn = identifier.startsWith('ISBN:') ? identifier.slice(5) : null;
	// non-Latin titles (e.g. Arabic) slugify to nothing — fall back to the
	// identifier and let the user rename the folder to a transliterated slug
	let slug = slugify(title);
	if (!slug) {
		slug = slugify(identifier);
		console.warn(`note  ${slug}: title is non-Latin, rename folder/slug by hand`);
	}
	if (existingSlugs.has(slug) || (isbn && existingIsbns.has(isbn))) {
		console.warn(`skip  ${slug}: already in database`);
		skipped++;
		continue;
	}

	const authors = [];
	const editors = [];
	const translators = [];
	for (const part of row[COL.contributors].split(';')) {
		const m = /^(.+?)\s*\[(.+?)\]\s*$/.exec(part.trim());
		if (!m) continue;
		const list = ({ author: authors, editor: editors, translator: translators })[
			m[2].toLowerCase()
		];
		// one [Role] entry sometimes packs several names joined with "&" or ","
		for (const name of m[1].split(/\s*[,&]\s*/)) {
			if (name.trim()) list?.push(titleCaseTr(cleanText(name)));
		}
	}

	const yearMatch = /(\d{4})/.exec(row[COL.pubDate]);
	const meta = {
		id: `temp-${++maxTempId}`,
		slug,
		title,
		subtitle: cleanText(row[COL.subtitle]) || null,
		authors,
		editors,
		translators,
		publisher: 'klm yayınları',
		isbn,
		year: yearMatch ? Number(yearMatch[1]) : null,
		edition: null,
		pages: Number(row[COL.pages]) || null,
		language: LANG[row[COL.language]] ?? (row[COL.language] || null),
		series: slugify(row[COL.seriesName]) || null,
		categories: row[COL.subjects]
			.split(';')
			.map((s) => s.replace(/\s*\[.*?\]\s*/g, '').trim())
			.filter(Boolean),
		description: htmlToText(row[COL.description]),
		links: { googlePlay: row[COL.playLink] || null }
	};

	existingSlugs.add(slug);
	if (isbn) existingIsbns.add(isbn);
	created++;
	console.log(`write ${slug} (${meta.id})`);
	if (!DRY_RUN) {
		const dir = path.join(BOOKS_DIR, slug);
		mkdirSync(dir, { recursive: true });
		writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, '\t') + '\n');
	}
}

console.log(`\n${created} created, ${skipped} skipped${DRY_RUN ? ' (dry run)' : ''}.`);
console.log('Next: assign real ids + series in each meta.json and add cover.jpeg.');
