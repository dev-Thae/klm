import { error } from '@sveltejs/kit';
import { seriesList, seriesBySlug } from '$lib/data/series.js';
import { booksBySeries } from '$lib/server/catalog.js';

/** Prerender one page per series. */
export function entries() {
	return seriesList.map((s) => ({ slug: s.slug }));
}

export function load({ params }) {
	const series = seriesBySlug(params.slug);
	if (!series) error(404, 'Dizi bulunamadı');
	return { series, books: booksBySeries(series.id) };
}
