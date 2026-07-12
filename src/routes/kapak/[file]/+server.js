/**
 * Serves book covers straight from the database directory (which lives outside
 * Vite's asset pipeline). Prerendering resizes and recompresses each cover and
 * writes it into the static build output as /kapak/<slug>-<variant>.jpg.
 *
 * Source covers are often several MB / thousands of px wide (raw scans /
 * publisher exports); they're never displayed anywhere near that size, so we
 * downsize to the two dimensions actually used: a small "thumb" for grid
 * listings and a larger "large" for the book detail page. Variants are plain
 * JPEG so they render in every browser.
 *
 * If sharp is unavailable or chokes on a source image, the original file is
 * served as-is (large but visible) instead of failing the request.
 */
import { readFileSync } from 'node:fs';
import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { coverPathFor, coverEntries } from '$lib/server/catalog.js';

export const prerender = true;

export function entries() {
	return coverEntries();
}

const MIME = { '.png': 'image/png', '.webp': 'image/webp' };

const VARIANTS = {
	thumb: { width: 360, quality: 80 }, // grid cards render ~178px wide, up to 2x
	large: { width: 640, quality: 82 } // detail page jacket renders ~320px wide, up to 2x
};

// cache aggressively in production builds, never on the dev server — stale
// immutable covers on localhost otherwise mask every change to this pipeline
const CACHE_CONTROL = dev ? 'no-store' : 'public, max-age=31536000, immutable';

let sharp = null;
try {
	sharp = (await import('sharp')).default;
} catch (e) {
	console.error(`[kapak] sharp could not be loaded, serving original covers: ${e.message}`);
}

export async function GET({ params }) {
	const filePath = coverPathFor(params.file);
	if (!filePath) error(404, 'Kapak bulunamadı');

	const variantMatch = params.file.match(/-(thumb|large)\.jpg$/);
	const variant = variantMatch && VARIANTS[variantMatch[1]];
	if (variant && sharp) {
		try {
			const body = await sharp(readFileSync(filePath))
				.resize({ width: variant.width, withoutEnlargement: true })
				.flatten({ background: '#fff' })
				.jpeg({ quality: variant.quality, mozjpeg: true })
				.toBuffer();
			return new Response(body, {
				headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': CACHE_CONTROL }
			});
		} catch (e) {
			console.error(`[kapak] resize failed for ${filePath}, serving original: ${e.message}`);
		}
	}

	// original file: requested directly, or the fallback when resizing failed
	const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
	return new Response(readFileSync(filePath), {
		headers: {
			'Content-Type': MIME[ext] ?? 'image/jpeg',
			'Cache-Control': CACHE_CONTROL
		}
	});
}
