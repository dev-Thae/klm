/**
 * Serves book covers straight from the database directory (which lives outside
 * Vite's asset pipeline). Prerendering writes every cover into the static
 * build output as /kapak/<slug>.<ext>.
 */
import { readFileSync } from 'node:fs';
import { error } from '@sveltejs/kit';
import { coverPathFor, coverEntries } from '$lib/server/catalog.js';

export const prerender = true;

export function entries() {
	return coverEntries();
}

const MIME = { '.png': 'image/png', '.webp': 'image/webp' };

export function GET({ params }) {
	const filePath = coverPathFor(params.file);
	if (!filePath) error(404, 'Kapak bulunamadı');
	const ext = params.file.slice(params.file.lastIndexOf('.'));
	return new Response(readFileSync(filePath), {
		headers: {
			'Content-Type': MIME[ext] ?? 'image/jpeg',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
}
