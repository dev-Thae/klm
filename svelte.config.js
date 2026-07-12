import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: null
		}),
		paths: {
			// GitHub Pages project sites serve from /<repo-name>/; the deploy
			// workflow sets BASE_PATH accordingly. Local dev/build stays at '/'.
			base: process.env.BASE_PATH ?? ''
		},
		prerender: {
			entries: ['*']
		}
	}
};

export default config;
