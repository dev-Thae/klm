import { error } from '@sveltejs/kit';
import { books, bookBySlug, relatedBooks } from '$lib/server/catalog.js';

/** Prerender one page per book. */
export function entries() {
	return books.map((b) => ({ slug: b.slug }));
}

export function load({ params }) {
	const book = bookBySlug(params.slug);
	if (!book) error(404, 'Kitap bulunamadı');
	return { book, related: relatedBooks(book) };
}
