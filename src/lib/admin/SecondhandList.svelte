<script>
	import { onMount } from 'svelte';
	import { describeError } from './github.js';

	const DIR = 'database/ikinci-el';

	/** titles: slug → title from the last build; books added since show their slug */
	let { client, titles } = $props();

	/** slugs currently in the repository; null while loading */
	let slugs = $state(null);
	let error = $state('');
	let busy = $state('');

	onMount(load);

	async function load() {
		error = '';
		slugs = null;
		try {
			const entries = await client.listDir(DIR);
			slugs = entries.filter((e) => e.type === 'dir').map((e) => e.name);
		} catch (err) {
			error = describeError(err);
			slugs = [];
		}
	}

	async function remove(slug) {
		const title = titles[slug] ?? slug;
		if (!confirm(`“${title}” mağazadan kaldırılsın mı?`)) return;
		busy = slug;
		error = '';
		try {
			const files = await client.listDir(`${DIR}/${slug}`);
			await client.commit({
				deletions: files.map((file) => file.path),
				message: `İkinci el kitabı kaldır: ${title}`
			});
			slugs = slugs.filter((s) => s !== slug);
		} catch (err) {
			error = describeError(err);
		} finally {
			busy = '';
		}
	}
</script>

<div class="list">
	<p class="hint">
		Satılan kitapları buradan kaldırın. Değişiklik mağaza sayfasına birkaç dakika içinde yansır.
		<button class="link" type="button" onclick={load}>Listeyi yenile</button>
	</p>

	{#if error}<p class="status error" role="alert">{error}</p>{/if}

	{#if slugs === null}
		<p class="hint">Yükleniyor…</p>
	{:else if slugs.length === 0}
		<p class="hint">Mağazada kitap yok.</p>
	{:else}
		<ul>
			{#each slugs as slug (slug)}
				<li>
					<span class="name">
						{titles[slug] ?? slug}
						<code>{slug}</code>
					</span>
					<button
						class="btn btn-ghost"
						type="button"
						disabled={busy !== ''}
						onclick={() => remove(slug)}
					>
						{busy === slug ? 'Kaldırılıyor…' : 'Satıldı · kaldır'}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}
	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}
	.name {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-weight: 600;
	}
	code {
		font-size: 0.74rem;
		font-weight: 400;
		color: var(--muted);
	}
	.btn {
		padding: 8px 14px;
		font-size: 0.82rem;
		flex-shrink: 0;
	}
	.btn[disabled] {
		opacity: 0.6;
		cursor: wait;
	}
</style>
