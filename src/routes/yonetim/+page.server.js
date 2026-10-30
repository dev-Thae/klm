import { books, secondhandBooks } from '$lib/server/catalog.js';

/** Build-time hints for the admin page; the live state is read from GitHub. */
export function load() {
	const tempIds = books
		.map((b) => /^temp-(\d+)$/.exec(String(b.id))?.[1])
		.filter(Boolean)
		.map(Number);
	return {
		nextTempId: Math.max(0, ...tempIds) + 1,
		isbns: books.map((b) => b.isbn).filter(Boolean),
		secondhandTitles: Object.fromEntries(secondhandBooks.map((b) => [b.slug, b.title]))
	};
}
