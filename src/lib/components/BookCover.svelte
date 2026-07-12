<script>
	import { base } from '$app/paths';
	import { seriesLabel } from '$lib/data/series.js';

	let { book } = $props();
</script>

<a class="shelf-item" href={`${base}/kitap/${book.slug}`} title={book.title}>
	<span class="jacket" data-series={book.series}>
		{#if book.cover}
			<img src={book.cover} alt={`${book.title} — kapak`} loading="lazy" />
		{:else}
			<span class="jacket-type">
				<span class="jacket-series">{seriesLabel(book.series)}</span>
				<span class="jacket-title">{book.title}</span>
				<span class="jacket-colophon">KLM</span>
			</span>
		{/if}
		{#if book.demo}<span class="demo-tag">demo</span>{/if}
	</span>
	<span class="caption">
		<span class="title">{book.title}</span>
		{#if book.author}<span class="byline">{book.authorShort ?? book.author}</span>{/if}
	</span>
</a>

<style>
	.shelf-item {
		display: flex;
		flex-direction: column;
		gap: 10px;
		text-decoration: none;
		color: var(--ink);
		transition: transform 140ms ease;
	}
	.shelf-item:hover {
		transform: translateY(-4px);
	}
	@media (prefers-reduced-motion: reduce) {
		.shelf-item {
			transition: none;
		}
		.shelf-item:hover {
			transform: none;
		}
	}

	.jacket {
		--sc: var(--gold);
		position: relative;
		aspect-ratio: 51 / 80;
		border: 1px solid var(--line);
		border-radius: 3px;
		overflow: hidden;
		background: var(--surface);
		box-shadow: var(--shadow);
	}
	.jacket img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.jacket[data-series='sistematik'] {
		--sc: var(--c-sistematik);
	}
	.jacket[data-series='sosyal'] {
		--sc: var(--c-sosyal);
	}
	.jacket[data-series='yontembilim'] {
		--sc: var(--c-yontembilim);
	}
	.jacket[data-series='yabanci'] {
		--sc: var(--c-yabanci);
	}
	.jacket[data-series='mutenevvia'] {
		--sc: var(--c-mutenevvia);
	}

	/* typographic fallback when a book directory has no cover image */
	.jacket-type {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		padding: 16px 14px 12px;
		border-top: 6px solid var(--sc);
	}
	.jacket-series {
		font-family: var(--sans);
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--sc);
		margin-bottom: 12px;
	}
	.jacket-title {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.3;
		text-wrap: balance;
	}
	.jacket-colophon {
		margin-top: auto;
		border-top: 1px solid var(--line);
		padding-top: 8px;
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		color: var(--muted);
	}

	.demo-tag {
		position: absolute;
		top: 8px;
		right: 8px;
		font-family: var(--sans);
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #fff;
		background: rgba(27, 36, 55, 0.55);
		border-radius: 999px;
		padding: 3px 9px;
		backdrop-filter: blur(4px);
	}

	.caption {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0 2px;
	}
	/* long academic titles: cap at two lines, full title in the link tooltip */
	.caption .title {
		font-size: 0.95rem;
		font-weight: 600;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	.caption .byline {
		font-family: var(--sans);
		font-size: 0.76rem;
		color: var(--muted);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		overflow: hidden;
	}
</style>
