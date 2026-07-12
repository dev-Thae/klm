<script>
	import { base } from '$app/paths';
	import {
		seriesLabel,
		seriesById,
		googleBooksUrl,
		n11SearchUrl,
		languageLabel
	} from '$lib/data/series.js';
	import BookCover from '$lib/components/BookCover.svelte';

	let { data } = $props();
	let book = $derived(data.book);
	let series = $derived(seriesById(book.series));
	let related = $derived(data.related);

	let meta = $derived(
		[
			['Yazar', book.author],
			['Editör', book.editor],
			['Çevirmen', book.translator],
			['Yayınevi', book.publisher],
			['Yayın yılı', book.year],
			['Baskı', book.edition ? `${book.edition}. baskı` : null],
			['Sayfa', book.pages],
			['ISBN', book.isbn],
			['Dil', book.language ? languageLabel(book.language) : null]
		].filter(([, value]) => value != null)
	);
</script>

<svelte:head>
	<title>{book.title} — KLM Yayınları</title>
	<meta
		name="description"
		content="{book.title}{book.author ? ' · ' + book.author : ''} · {seriesLabel(book.series)} dizisi · KLM Yayınları"
	/>
</svelte:head>

<section class="book">
	<div class="wrap">
		<nav class="crumb" aria-label="Konum">
			<a href={`${base}/katalog`}>← Katalog</a>
		</nav>

		{#if book.demo}
			<p class="draft-note" role="note">
				Bu sayfa, raf dolu görünsün diye çoğaltılmış örnek (demo) bir kopyadır — gerçek eserin
				sayfası katalogda ayrıca yer alır.
			</p>
		{/if}

		<div class="book-grid">
			<div class="jacket-col">
				{#if book.cover}
					<img class="big-cover" src={book.cover} alt={`${book.title} — kapak`} />
				{:else}
					<div class="big-cover type" data-series={book.series} aria-hidden="true">
						<span class="cover-series">{seriesLabel(book.series)}</span>
						<h2>{book.title}</h2>
						<span class="colophon">KLM YAYINLARI</span>
					</div>
				{/if}
			</div>
			<div class="details">
				<a class="eyebrow series-link" href={`${base}/dizi/${series.slug}`}>{series.label}</a>
				<h1>{book.title}</h1>
				{#if book.author}<p class="author">{book.author}</p>{/if}
				{#if book.description}<p class="description">{book.description}</p>{/if}
				<dl class="meta">
					{#each meta as [label, value] (label)}
						<div><dt>{label}</dt><dd>{value}</dd></div>
					{/each}
					<div><dt>Format</dt><dd>E‑kitap · Matbu</dd></div>
				</dl>
				<div class="buy">
					<a class="btn btn-primary" href={n11SearchUrl(book)} target="_blank" rel="noopener">
						N11'de ara ↗
					</a>
					<a class="btn btn-ghost" href={googleBooksUrl(book)} target="_blank" rel="noopener">
						Google Books'ta ara ↗
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

{#if related.length > 0}
	<section class="related">
		<div class="wrap">
			<div class="sec-head">
				<span class="eyebrow">Aynı diziden</span>
				<h2>{seriesLabel(book.series)} dizisinden diğer eserler</h2>
				<p><a href={`${base}/dizi/${series.slug}`}>Dizinin tüm eserlerini gör →</a></p>
			</div>
			<div class="covers">
				{#each related as r (r.slug)}
					<BookCover book={r} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.book {
		padding: 56px 0 80px;
	}
	.crumb {
		margin-bottom: 32px;
		font-family: var(--sans);
		font-size: 0.86rem;
	}
	.crumb a {
		text-decoration: none;
	}
	.crumb a:hover {
		text-decoration: underline;
	}
	.draft-note {
		font-family: var(--sans);
		font-size: 0.82rem;
		color: var(--muted);
		background: var(--gold-soft);
		border: 1px dashed var(--gold);
		border-radius: 4px;
		padding: 10px 16px;
		max-width: 64ch;
		margin: 0 0 32px;
	}
	.book-grid {
		display: grid;
		grid-template-columns: minmax(220px, 320px) 1fr;
		gap: 48px;
		align-items: start;
	}
	@media (max-width: 720px) {
		.book-grid {
			grid-template-columns: 1fr;
		}
		.jacket-col {
			max-width: 280px;
		}
	}

	.big-cover {
		display: block;
		width: 100%;
		aspect-ratio: 51 / 80;
		object-fit: cover;
		border: 1px solid var(--line);
		border-radius: 3px;
		box-shadow: var(--shadow);
	}

	/* typographic fallback if a book directory has no cover image */
	.big-cover.type {
		--sc: var(--gold);
		aspect-ratio: 5 / 7;
		background: var(--surface);
		border-top: 10px solid var(--sc);
		padding: 28px 24px 20px;
		display: flex;
		flex-direction: column;
	}
	.big-cover.type[data-series='sistematik'] {
		--sc: var(--c-sistematik);
	}
	.big-cover.type[data-series='sosyal'] {
		--sc: var(--c-sosyal);
	}
	.big-cover.type[data-series='yontembilim'] {
		--sc: var(--c-yontembilim);
	}
	.big-cover.type[data-series='yabanci'] {
		--sc: var(--c-yabanci);
	}
	.big-cover.type[data-series='mutenevvia'] {
		--sc: var(--c-mutenevvia);
	}
	.big-cover.type .cover-series {
		font-family: var(--sans);
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--sc);
		margin-bottom: 18px;
	}
	.big-cover.type h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.25;
		text-wrap: balance;
	}
	.big-cover.type .colophon {
		margin-top: auto;
		border-top: 1px solid var(--line);
		padding-top: 12px;
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		color: var(--muted);
	}

	/* details */
	.series-link {
		text-decoration: none;
	}
	.series-link:hover {
		text-decoration: underline;
	}
	.details h1 {
		margin: 10px 0 6px;
		font-size: clamp(1.8rem, 3.6vw, 2.6rem);
		font-weight: 500;
		line-height: 1.12;
		letter-spacing: -0.01em;
		text-wrap: balance;
	}
	.author {
		margin: 0 0 24px;
		font-family: var(--sans);
		font-size: 1rem;
		color: var(--muted);
	}
	.description {
		margin: 0 0 24px;
		max-width: 58ch;
	}
	dl.meta {
		margin: 0 0 28px;
		border-top: 1px solid var(--line);
	}
	dl.meta > div {
		display: flex;
		gap: 24px;
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
	}
	dl.meta dt {
		font-family: var(--sans);
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		width: 110px;
		flex-shrink: 0;
		padding-top: 3px;
	}
	dl.meta dd {
		margin: 0;
	}
	.buy {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.related {
		border-top: 1px solid var(--line);
		padding: 64px 0 80px;
	}
</style>
