import { books, newReleases } from '$lib/server/catalog.js';

export function load() {
	return { row: newReleases(8), total: books.length };
}
