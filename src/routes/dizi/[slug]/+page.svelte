<script>
	import BookCover from '$lib/components/BookCover.svelte';

	let { data } = $props();
	let series = $derived(data.series);
	let books = $derived(data.books);
</script>

<svelte:head>
	<title>{series.label} — KLM Yayınları</title>
	<meta name="description" content="{series.label} dizisi: {series.description}" />
</svelte:head>

<section class="series-page" style={`--sc: var(--c-${series.id})`}>
	<div class="wrap">
		<div class="series-head">
			<span class="eyebrow">Dizi</span>
			<h1><span class="dot" aria-hidden="true"></span>{series.label}</h1>
			<p class="desc">{series.description}</p>
			<p class="count">{books.length} eser</p>
		</div>
		<div class="covers">
			{#each books as book (book.slug)}
				<BookCover {book} />
			{/each}
		</div>
	</div>
</section>

<style>
	.series-page {
		padding: 56px 0 80px;
	}
	.series-head {
		max-width: 60ch;
		margin-bottom: 40px;
	}
	.series-head h1 {
		display: flex;
		align-items: center;
		gap: 14px;
		margin: 12px 0 10px;
		font-size: clamp(1.9rem, 4vw, 2.8rem);
		font-weight: 500;
		line-height: 1.12;
		letter-spacing: -0.01em;
	}
	.dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--sc);
		flex-shrink: 0;
	}
	.desc {
		margin: 0 0 6px;
		color: var(--muted);
		font-size: 1.05rem;
	}
	.count {
		margin: 0;
		font-family: var(--sans);
		font-size: 0.74rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--sc);
	}
</style>
