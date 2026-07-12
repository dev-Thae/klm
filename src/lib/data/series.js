/**
 * Client-safe catalog constants and pure helpers (no filesystem access here).
 * The series taxonomy itself lives in database/series.json so it can be
 * edited by hand next to the books; it is bundled at build time.
 */
import seriesData from '../../../database/series.json';

export const seriesList = seriesData;

export function seriesLabel(id) {
	return seriesList.find((s) => s.id === id)?.label ?? id;
}

export function seriesById(id) {
	return seriesList.find((s) => s.id === id);
}

export function seriesBySlug(slug) {
	return seriesList.find((s) => s.slug === slug);
}

export function googleBooksUrl(book) {
	const q = book.isbn ? `isbn:${book.isbn}` : `"${book.title}"`;
	return 'https://www.google.com/search?tbm=bks&q=' + encodeURIComponent(q);
}

export function n11SearchUrl(book) {
	return 'https://www.n11.com/arama?q=' + encodeURIComponent(book.title);
}

export function languageLabel(code) {
	return { tr: 'Türkçe', en: 'İngilizce', ar: 'Arapça' }[code] ?? code;
}
