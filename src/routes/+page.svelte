<script>
	import { base } from '$app/paths';
	import { seriesList } from '$lib/data/series.js';
	import BookCover from '$lib/components/BookCover.svelte';
	import HeroPattern from '$lib/components/HeroPattern.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>KLM Yayınları — Kelâm Araştırmaları Yayınevi</title>
	<meta
		name="description"
		content="KLM Yayınları — Kelâm araştırmaları yayınevi arşivi. Sistematik kelam, sosyal kelam, yöntembilim ve daha fazlası; e-kitap ve matbu."
	/>
</svelte:head>

<div class="hero">
	<HeroPattern />
	<div class="wrap hero-inner">
		<span class="eyebrow">Kelâm Araştırmaları Yayınevi</span>
		<h1>Kelâm ilminin <em>çağdaş</em> kitaplığı.</h1>
		<p class="lede">
			Kelam ve din bilimleri alanında yayımlanmış akademik eserlerin arşivi. Künyeler, kapaklar ve
			satın alma bağlantıları her eserin kendi sayfasındadır.
		</p>
		<div class="hero-stats">
			<div><span class="num">{data.total}</span><span class="lbl">Eser</span></div>
			<div><span class="num">{seriesList.length}</span><span class="lbl">Dizi</span></div>
			<div><span class="num">2</span><span class="lbl">Format — e‑kitap · matbu</span></div>
		</div>
	</div>
</div>

<section id="raf">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">Katalogdan</span>
			<h2>Son eserler</h2>
		</div>
		<div class="covers-row">
			{#each data.row as book (book.slug)}
				<BookCover {book} />
			{/each}
		</div>
		<div class="catalog-cta">
			<a class="btn btn-primary" href={`${base}/katalog`}>Tüm kataloğu görüntüle · {data.total} eser</a>
		</div>
	</div>
</section>

<style>
	/* hero */
	.hero {
		position: relative;
		overflow: hidden;
		border-bottom: 1px solid var(--line);
	}
	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			100deg,
			var(--paper) 34%,
			color-mix(in srgb, var(--paper) 55%, transparent) 62%,
			transparent 100%
		);
		pointer-events: none;
	}
	.hero-inner {
		position: relative;
		z-index: 2;
		padding-top: 96px;
		padding-bottom: 88px;
	}
	.hero h1 {
		margin: 18px 0 20px;
		font-size: clamp(2.5rem, 6vw, 4rem);
		line-height: 1.08;
		font-weight: 500;
		letter-spacing: -0.015em;
		text-wrap: balance;
		max-width: 13ch;
	}
	.hero h1 em {
		font-style: italic;
		color: var(--lacivert);
	}
	.hero p.lede {
		max-width: 52ch;
		margin: 0;
		font-size: 1.1rem;
		color: var(--muted);
		text-wrap: pretty;
	}
	.hero-stats {
		display: flex;
		gap: 40px;
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid var(--line);
		max-width: 560px;
	}
	.hero-stats .num {
		font-size: 1.7rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		display: block;
	}
	.hero-stats .lbl {
		font-family: var(--sans);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}

	/* one shelf row: horizontal scroll when it does not fit */
	.covers-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(150px, 178px);
		gap: 24px;
		overflow-x: auto;
		padding-bottom: 12px;
		scroll-snap-type: x proximity;
	}
	.covers-row > :global(*) {
		scroll-snap-align: start;
	}

	.catalog-cta {
		margin-top: 28px;
		text-align: center;
	}
</style>
