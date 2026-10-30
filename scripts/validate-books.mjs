/**
 * Validates the hand-editable book database (each database/books/<slug>/meta.json,
 * each database/ikinci-el/<slug>/meta.json, plus database/series.json).
 * Run after editing: npm run db:validate
 *
 * Errors (exit 1): broken JSON, missing required fields, slug/folder mismatch,
 * duplicate slug/isbn/id, unknown series, malformed ISBN.
 * Warnings (exit 0): missing cover, temp id, no series assigned, empty year.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DB_DIR = path.resolve(ROOT, process.env.KLM_DB_DIR ?? 'database');
const BOOKS_DIR = path.join(DB_DIR, 'books');
const SECONDHAND_DIR = path.join(DB_DIR, 'ikinci-el');

const errors = [];
const warnings = [];
const err = (book, msg) => errors.push(`${book}: ${msg}`);
const warn = (book, msg) => warnings.push(`${book}: ${msg}`);

/* ---------- series taxonomy ---------- */

let seriesIds = new Set();
try {
	const series = JSON.parse(readFileSync(path.join(DB_DIR, 'series.json'), 'utf-8'));
	seriesIds = new Set(series.map((s) => s.id));
	for (const s of series) {
		for (const key of ['id', 'slug', 'label']) {
			if (!s[key]) err('series.json', `entry missing "${key}": ${JSON.stringify(s)}`);
		}
	}
} catch (e) {
	err('series.json', e.message);
}

/* ---------- books ---------- */

const KNOWN_KEYS = new Set([
	'id',
	'slug',
	'title',
	'subtitle',
	'authors',
	'editors',
	'translators',
	'publisher',
	'isbn',
	'year',
	'edition',
	'pages',
	'language',
	'series',
	'categories',
	'description',
	'links'
]);

const seenSlugs = new Map();
const seenIsbns = new Map();
const seenIds = new Map();
let count = 0;

for (const entry of readdirSync(BOOKS_DIR, { withFileTypes: true })) {
	if (!entry.isDirectory()) continue;
	const name = entry.name;
	const dir = path.join(BOOKS_DIR, name);

	if (!existsSync(path.join(dir, 'meta.json'))) {
		err(name, 'meta.json is missing');
		continue;
	}

	let meta;
	try {
		meta = JSON.parse(readFileSync(path.join(dir, 'meta.json'), 'utf-8'));
	} catch (e) {
		err(name, `meta.json is not valid JSON — ${e.message}`);
		continue;
	}
	count++;

	for (const key of ['id', 'slug', 'title']) {
		if (meta[key] === undefined || meta[key] === null || meta[key] === '')
			err(name, `required field "${key}" is missing`);
	}
	for (const key of Object.keys(meta)) {
		if (!KNOWN_KEYS.has(key)) warn(name, `unknown field "${key}" (typo?)`);
	}
	for (const key of ['authors', 'editors', 'translators', 'categories']) {
		if (meta[key] !== undefined && !Array.isArray(meta[key]))
			err(name, `"${key}" must be an array`);
	}

	if (meta.slug && meta.slug !== name)
		err(name, `folder name must equal slug ("${meta.slug}") — rename one of them`);
	if (meta.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug))
		err(name, `slug "${meta.slug}" must be lowercase ascii words separated by "-"`);

	if (meta.slug) {
		if (seenSlugs.has(meta.slug)) err(name, `duplicate slug (also in ${seenSlugs.get(meta.slug)})`);
		seenSlugs.set(meta.slug, name);
	}
	if (meta.id !== undefined && meta.id !== null) {
		const id = String(meta.id);
		if (seenIds.has(id)) err(name, `duplicate id ${id} (also in ${seenIds.get(id)})`);
		seenIds.set(id, name);
		if (/^temp-/.test(id)) warn(name, `temp id "${id}" — assign the real id when known`);
	}
	if (meta.isbn) {
		if (!/^97[89]\d{10}$/.test(meta.isbn)) err(name, `isbn "${meta.isbn}" is not a valid ISBN-13`);
		if (seenIsbns.has(meta.isbn))
			err(name, `duplicate isbn ${meta.isbn} (also in ${seenIsbns.get(meta.isbn)})`);
		seenIsbns.set(meta.isbn, name);
	}

	for (const key of ['year', 'pages', 'edition']) {
		if (meta[key] !== undefined && meta[key] !== null && !Number.isInteger(meta[key]))
			err(name, `"${key}" must be a number, not ${JSON.stringify(meta[key])}`);
	}

	if (meta.series == null) warn(name, 'no series assigned (site will show it under Mütenevvia)');
	else if (!seriesIds.has(meta.series))
		err(name, `series "${meta.series}" is not in database/series.json (ids: ${[...seriesIds].join(', ')})`);

	if (!meta.year) warn(name, 'year is empty');
	const files = readdirSync(dir);
	if (!files.some((f) => /^cover\.(jpe?g|png|webp)$/i.test(f))) warn(name, 'no cover image');
}

/* ---------- secondhand books (Mağaza) ---------- */

const SECONDHAND_KEYS = new Set([
	'slug',
	'title',
	'authors',
	'publisher',
	'year',
	'condition',
	'price',
	'description',
	'added',
	'demo'
]);

let secondhandCount = 0;
const secondhandDirs = existsSync(SECONDHAND_DIR)
	? readdirSync(SECONDHAND_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory())
	: [];

for (const entry of secondhandDirs) {
	const name = `ikinci-el/${entry.name}`;
	const file = path.join(SECONDHAND_DIR, entry.name, 'meta.json');

	if (!existsSync(file)) {
		err(name, 'meta.json is missing');
		continue;
	}
	let meta;
	try {
		meta = JSON.parse(readFileSync(file, 'utf-8'));
	} catch (e) {
		err(name, `meta.json is not valid JSON — ${e.message}`);
		continue;
	}
	secondhandCount++;

	for (const key of ['slug', 'title', 'price']) {
		if (meta[key] === undefined || meta[key] === null || meta[key] === '')
			err(name, `required field "${key}" is missing`);
	}
	for (const key of Object.keys(meta)) {
		if (!SECONDHAND_KEYS.has(key)) warn(name, `unknown field "${key}" (typo?)`);
	}
	if (meta.slug && meta.slug !== entry.name)
		err(name, `folder name must equal slug ("${meta.slug}") — rename one of them`);
	if (meta.authors !== undefined && !Array.isArray(meta.authors))
		err(name, '"authors" must be an array');
	if (meta.price != null && !(typeof meta.price === 'number' && meta.price >= 0))
		err(name, `"price" must be a number in TL, not ${JSON.stringify(meta.price)}`);
	if (meta.year != null && !Number.isInteger(meta.year))
		err(name, `"year" must be a number, not ${JSON.stringify(meta.year)}`);
	if (meta.demo) warn(name, 'sample (demo) item — delete it before going live');
}

/* ---------- report ---------- */

for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
console.log(
	`\n${count} books + ${secondhandCount} secondhand books checked: ` +
		`${errors.length} error(s), ${warnings.length} warning(s).`
);
process.exit(errors.length ? 1 : 0);
