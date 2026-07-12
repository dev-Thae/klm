<script>
	import { seriesList } from '$lib/data/series.js';
	import BookCover from '$lib/components/BookCover.svelte';

	let { data } = $props();
	let books = $derived(data.books);

	let filter = $state('all');
	let query = $state('');

	const norm = (s) => s.toLocaleLowerCase('tr');
	const seriesCount = (id) => books.filter((b) => b.series === id).length;

	let visibleBooks = $derived(
		books.filter(
			(b) =>
				(filter === 'all' || b.series === filter) &&
				(!query.trim() ||
					norm(b.title).includes(norm(query.trim())) ||
					(b.author && norm(b.author).includes(norm(query.trim()))))
		)
	);
</script>

<svelte:head>
	<title>Katalog — KLM Yayınları</title>
	<meta
		name="description"
		content="KLM Yayınları katalogu: kelam ve din bilimleri alanındaki tüm eserler; dizilere göre süzün, başlık veya yazara göre arayın."
	/>
</svelte:head>

<section id="katalog">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">Katalog</span>
			<h1>Yayımlanan eserler</h1>
			<p>Her eserin kendi sayfası vardır; künye ve satın alma bağlantıları oradadır.</p>
		</div>
		<div class="catalog-tools">
			<button class="chip" aria-pressed={filter === 'all'} onclick={() => (filter = 'all')}>
				Tümü · {books.length}
			</button>
			{#each seriesList as s (s.id)}
				<button class="chip" aria-pressed={filter === s.id} onclick={() => (filter = s.id)}>
					{s.label} · {seriesCount(s.id)}
				</button>
			{/each}
			<input
				class="search"
				type="search"
				placeholder="Eser ara…"
				aria-label="Katalogda ara"
				bind:value={query}
			/>
		</div>
		{#if visibleBooks.length > 0}
			<div class="covers">
				{#each visibleBooks as book (book.slug)}
					<BookCover {book} />
				{/each}
			</div>
		{:else}
			<p class="no-results">Aramanızla eşleşen eser bulunamadı.</p>
		{/if}
	</div>
</section>

<style>
	.sec-head h1 {
		margin: 10px 0 12px;
		font-size: clamp(1.9rem, 4vw, 2.7rem);
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.catalog-tools {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
		margin-bottom: 32px;
	}
	.chip {
		font-family: var(--sans);
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		background: var(--surface);
		color: var(--muted);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 7px 16px;
	}
	.chip:hover {
		color: var(--ink);
	}
	.chip[aria-pressed='true'] {
		background: var(--lacivert);
		border-color: var(--lacivert);
		color: var(--on-lacivert);
	}
	.search {
		margin-left: auto;
		font-family: var(--sans);
		font-size: 0.9rem;
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 8px 18px;
		min-width: 220px;
	}
	.search::placeholder {
		color: var(--muted);
	}
	@media (max-width: 720px) {
		.search {
			margin-left: 0;
			width: 100%;
		}
	}
	.no-results {
		color: var(--muted);
		font-style: italic;
		padding: 32px 0;
	}
</style>
