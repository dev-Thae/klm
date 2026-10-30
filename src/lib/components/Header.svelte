<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';

	let open = $state(false);
	let dark = $state(false);

	onMount(() => {
		dark = document.documentElement.dataset.theme === 'dark';
	});

	function toggleTheme() {
		dark = !dark;
		document.documentElement.dataset.theme = dark ? 'dark' : 'light';
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch (e) {
			/* private mode: theme just won't persist */
		}
	}

	const primary = [
		{ href: '/', label: 'Yuva' },
		{ href: '/katalog', label: 'Yayınlarımız' },
		{ href: '/magaza', label: 'Mağaza' },
		{ href: '/iletisim', label: 'İletişim' }
	];

	function currentPath() {
		const path = page.url.pathname;
		if (base && path.startsWith(base)) return path.slice(base.length) || '/';
		return path;
	}

	function isActive(href) {
		const path = currentPath();
		return href === '/' ? path === '/' : path.startsWith(href);
	}

	function close() {
		open = false;
	}
</script>

<header class="site">
	<div class="site-bar">
		<a class="brand" href={`${base}/`} aria-label="KLM Yayınları anasayfa" onclick={close}>
			<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
				<path
					fill="currentColor"
					d="M10 0l2.2 5.3L17.1 2.9 14.7 7.8 20 10l-5.3 2.2 2.4 4.9-4.9-2.4L10 20l-2.2-5.3-4.9 2.4 2.4-4.9L0 10l5.3-2.2L2.9 2.9l4.9 2.4z"
				/>
			</svg>
			KLM Yayınları
		</a>
		<nav class="primary" aria-label="Site">
			{#each primary as item (item.href)}
				<a href={`${base}${item.href}`} aria-current={isActive(item.href) ? 'page' : undefined}>
					{item.label}
				</a>
			{/each}
		</nav>
		<div class="bar-actions">
			<button
				class="theme-btn"
				aria-pressed={dark}
				aria-label={dark ? 'Açık temaya geç' : 'Koyu temaya geç'}
				title={dark ? 'Açık tema' : 'Koyu tema'}
				onclick={toggleTheme}
			>
				{#if dark}
					<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="5" fill="currentColor" />
						<g stroke="currentColor" stroke-width="2" stroke-linecap="round">
							<path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
						</g>
					</svg>
				{:else}
					<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
						<path fill="currentColor" d="M21 14.5A8.5 8.5 0 0 1 9.5 3 8.5 8.5 0 1 0 21 14.5z" />
					</svg>
				{/if}
			</button>
			<button
				class="menu-btn"
				aria-expanded={open}
				aria-controls="mobile-menu"
				onclick={() => (open = !open)}
			>
				{open ? 'Kapat' : 'Menü'}
			</button>
		</div>
	</div>

	{#if open}
		<nav class="mobile" id="mobile-menu" aria-label="Site (mobil)">
			{#each primary as item (item.href)}
				<a href={`${base}${item.href}`} aria-current={isActive(item.href) ? 'page' : undefined} onclick={close}>
					{item.label}
				</a>
			{/each}
		</nav>
	{/if}
</header>

<style>
	header.site {
		position: sticky;
		top: 0;
		z-index: 20;
		background: color-mix(in srgb, var(--paper) 92%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--line);
	}
	.site-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 14px 24px;
		max-width: 1120px;
		margin: 0 auto;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--ink);
		font-size: 1.2rem;
		font-weight: 600;
		letter-spacing: 0.01em;
	}
	.brand svg {
		display: block;
		color: var(--gold);
	}

	nav.primary {
		display: flex;
		gap: 4px;
		font-family: var(--sans);
		font-size: 0.86rem;
		font-weight: 500;
	}
	nav.primary a {
		color: var(--muted);
		text-decoration: none;
		padding: 8px 12px;
		border-radius: 999px;
	}
	nav.primary a:hover {
		color: var(--ink);
		background: var(--gold-soft);
	}
	nav.primary a[aria-current='page'] {
		color: var(--ink);
		background: var(--gold-soft);
	}

	.bar-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.theme-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		cursor: pointer;
		background: var(--surface);
		color: var(--muted);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0;
	}
	.theme-btn:hover {
		color: var(--gold);
	}

	/* mobile */
	.menu-btn {
		display: none;
		font-family: var(--sans);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 7px 16px;
	}
	.mobile {
		display: none;
	}
	@media (max-width: 860px) {
		nav.primary {
			display: none;
		}
		.menu-btn {
			display: block;
		}
		.mobile {
			display: flex;
			flex-direction: column;
			border-top: 1px solid var(--line);
			padding: 10px 24px 18px;
			font-family: var(--sans);
			font-size: 0.95rem;
			font-weight: 500;
		}
		.mobile a {
			color: var(--ink);
			text-decoration: none;
			padding: 10px 4px;
			border-bottom: 1px solid var(--line);
		}
		.mobile a[aria-current='page'] {
			color: var(--gold);
		}
	}
</style>
