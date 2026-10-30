/** Helpers for turning admin form input into database/ files. */

/** Turkish-aware slug — same rules as scripts/import-googlebooks.mjs. */
export function slugify(text) {
	const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
	return text
		.toLocaleLowerCase('tr')
		.replace(/[çğıöşüâîû]/g, (c) => map[c] ?? c)
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** What scripts/validate-books.mjs accepts as a slug (and a folder name). */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Ali Veli, Ayşe Fatma" → ['Ali Veli', 'Ayşe Fatma'] */
export function parseNames(text) {
	return text
		.split(/[,;]/)
		.map((name) => name.trim())
		.filter(Boolean);
}

/**
 * Downscales a cover photo/scan to at most maxSide px on its long edge and
 * re-encodes it as JPEG, returned as base64 for the GitHub blob API. Phone
 * photos are several MB; nothing on the site displays them anywhere near that.
 */
export async function imageToJpegBase64(file, maxSide = 1600, quality = 0.85) {
	const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bitmap.width * scale);
	canvas.height = Math.round(bitmap.height * scale);
	const ctx = canvas.getContext('2d');
	// transparent PNGs would otherwise turn black in the JPEG
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	bitmap.close();
	return canvas.toDataURL('image/jpeg', quality).split(',')[1];
}
