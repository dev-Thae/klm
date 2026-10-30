<script>
	// Admin page: not linked anywhere and marked noindex. Hiding it is only a
	// courtesy — the real protection is that every change is a GitHub commit
	// that needs the admin's own access token (see $lib/admin/github.js).
	import { onMount } from 'svelte';
	import { REPO } from '$lib/data/site.js';
	import { createRepoClient, describeError } from '$lib/admin/github.js';
	import BookForm from '$lib/admin/BookForm.svelte';
	import SecondhandList from '$lib/admin/SecondhandList.svelte';

	let { data } = $props();

	const TOKEN_KEY = 'klm-yonetim-anahtar';

	let tokenInput = $state('');
	let remember = $state(false);
	let checking = $state(false);
	let loginError = $state('');
	/** { client, login } once signed in */
	let session = $state.raw(null);
	let tab = $state('yayin');

	let tempIdsTaken = 0;
	function newTempId() {
		return `temp-${data.nextTempId + tempIdsTaken++}`;
	}

	onMount(() => {
		let saved = null;
		try {
			saved = sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
		} catch (e) {
			/* storage blocked: sign in by hand */
		}
		if (saved) signIn(saved, { store: false });
	});

	async function signIn(token, { store = true } = {}) {
		checking = true;
		loginError = '';
		try {
			const client = createRepoClient(token);
			const { login, canPush } = await client.verify();
			if (!canPush)
				throw new Error(`${login} hesabının ${REPO.owner}/${REPO.name} deposuna yazma yetkisi yok.`);
			if (store) {
				try {
					(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
				} catch (e) {
					/* storage blocked: the session just won't survive a reload */
				}
			}
			session = { client, login };
			tokenInput = '';
		} catch (err) {
			// keep a saved token through a network blip; drop it on any real refusal
			if (!(err instanceof TypeError)) forgetToken();
			loginError = describeError(err);
		} finally {
			checking = false;
		}
	}

	function forgetToken() {
		try {
			sessionStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(TOKEN_KEY);
		} catch (e) {
			/* nothing stored */
		}
	}

	function signOut() {
		forgetToken();
		session = null;
	}
</script>

<svelte:head>
	<title>Yönetim — KLM Yayınları</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<section class="admin">
	<div class="wrap">
		{#if !session}
			<div class="login">
				<span class="eyebrow">Yönetim</span>
				<h1>Giriş</h1>
				<p class="hint">
					Bu sayfa yalnızca yayınevi yöneticileri içindir. Giriş için <code>{REPO.owner}/{REPO.name}</code>
					deposuna yazma izni olan bir GitHub erişim anahtarı gerekir.
				</p>
				<form
					onsubmit={(e) => {
						e.preventDefault();
						signIn(tokenInput.trim());
					}}
				>
					<label>
						GitHub erişim anahtarı
						<input
							type="password"
							required
							autocomplete="off"
							spellcheck="false"
							placeholder="github_pat_…"
							bind:value={tokenInput}
						/>
					</label>
					<label class="check">
						<input type="checkbox" bind:checked={remember} />
						Bu cihazda hatırla <span class="hint">(yalnızca kişisel cihazlarda)</span>
					</label>
					<button class="btn btn-primary" type="submit" disabled={checking}>
						{checking ? 'Kontrol ediliyor…' : 'Giriş yap'}
					</button>
				</form>
				{#if loginError}<p class="status error" role="alert">{loginError}</p>{/if}

				<details>
					<summary>Anahtar nasıl oluşturulur?</summary>
					<ol>
						<li>
							GitHub'da
							<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">
								yeni bir fine-grained token
							</a>
							oluşturma sayfasını açın.
						</li>
						<li>
							<strong>Repository access</strong>: “Only select repositories” →
							<code>{REPO.owner}/{REPO.name}</code>.
						</li>
						<li>
							<strong>Repository permissions</strong> → <strong>Contents: Read and write</strong>.
							Başka izin vermeyin.
						</li>
						<li>Bir son kullanma tarihi seçin, anahtarı oluşturun ve buraya yapıştırın.</li>
					</ol>
					<p class="hint">
						Anahtar yalnızca bu tarayıcıda saklanır ve yalnızca GitHub'a gönderilir. Anahtar
						sızarsa GitHub ayarlarından silmeniz yeterlidir.
					</p>
				</details>
			</div>
		{:else}
			<div class="admin-head">
				<div>
					<span class="eyebrow">Yönetim</span>
					<h1>Kitap ekle</h1>
				</div>
				<p class="who">
					<strong>{session.login}</strong> olarak giriş yapıldı ·
					<button class="link" type="button" onclick={signOut}>Çıkış</button>
				</p>
			</div>
			<p class="hint">
				Her kayıt depoya işlenir ve site birkaç dakika içinde yeniden yayımlanır.
				<a href={`https://github.com/${REPO.owner}/${REPO.name}/actions`} target="_blank" rel="noopener">
					Yayın durumunu izleyin ↗
				</a>
			</p>

			<div class="tabs" role="tablist">
				<button role="tab" aria-selected={tab === 'yayin'} onclick={() => (tab = 'yayin')}>
					Yayın ekle
				</button>
				<button role="tab" aria-selected={tab === 'ikinci-el'} onclick={() => (tab = 'ikinci-el')}>
					İkinci el kitap ekle
				</button>
				<button role="tab" aria-selected={tab === 'liste'} onclick={() => (tab = 'liste')}>
					Mağazadaki kitaplar
				</button>
			</div>

			<div class="panel" role="tabpanel">
				{#if tab === 'yayin'}
					<BookForm kind="yayin" client={session.client} {newTempId} knownIsbns={data.isbns} />
				{:else if tab === 'ikinci-el'}
					<BookForm kind="ikinci-el" client={session.client} />
				{:else}
					<SecondhandList client={session.client} titles={data.secondhandTitles} />
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	.admin {
		padding: 56px 0 96px;
	}
	h1 {
		margin: 10px 0 12px;
		font-size: clamp(1.8rem, 3.6vw, 2.4rem);
		font-weight: 500;
	}

	.login {
		max-width: 520px;
	}
	.login form {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin: 24px 0 16px;
	}
	.login form .btn {
		align-self: flex-start;
	}
	.login details {
		margin-top: 28px;
		font-family: var(--sans);
		font-size: 0.88rem;
	}
	.login summary {
		cursor: pointer;
		font-weight: 600;
		color: var(--lacivert);
	}
	.login ol {
		padding-left: 20px;
		line-height: 1.6;
	}

	.admin-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px 24px;
	}
	.who {
		margin: 0 0 16px;
		font-family: var(--sans);
		font-size: 0.86rem;
		color: var(--muted);
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin: 28px 0 0;
		border-bottom: 1px solid var(--line);
	}
	.tabs button {
		font-family: var(--sans);
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		background: none;
		color: var(--muted);
		border: 0;
		border-bottom: 2px solid transparent;
		padding: 10px 14px;
		margin-bottom: -1px;
	}
	.tabs button:hover {
		color: var(--ink);
	}
	.tabs button[aria-selected='true'] {
		color: var(--ink);
		border-bottom-color: var(--gold);
	}
	.panel {
		background: var(--surface);
		border: 1px solid var(--line);
		border-top: 0;
		border-radius: 0 0 4px 4px;
		padding: 28px 24px;
	}

	/* form controls, shared with the BookForm / SecondhandList children */
	.admin :global(label) {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: var(--sans);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--muted);
	}
	.admin :global(label.check) {
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}
	.admin :global(:is(input:not([type='checkbox']):not([type='file']), select, textarea)) {
		font-family: var(--sans);
		font-size: 0.92rem;
		font-weight: 400;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid var(--line);
		border-radius: 3px;
		padding: 8px 10px;
		width: 100%;
	}
	.admin :global(textarea) {
		resize: vertical;
	}
	.admin :global(.hint) {
		margin: 0;
		font-family: var(--sans);
		font-size: 0.8rem;
		font-weight: 400;
		color: var(--muted);
	}
	.admin :global(.link) {
		font: inherit;
		cursor: pointer;
		background: none;
		border: 0;
		padding: 0;
		color: var(--lacivert);
		text-decoration: underline;
	}
	.admin :global(.status) {
		margin: 0;
		font-family: var(--sans);
		font-size: 0.88rem;
		border-radius: 3px;
		padding: 8px 12px;
	}
	.admin :global(.status.done) {
		background: color-mix(in srgb, var(--c-sosyal) 14%, transparent);
		color: var(--ink);
	}
	.admin :global(.status.error) {
		background: color-mix(in srgb, #b3261e 12%, transparent);
		color: var(--ink);
	}
	.admin :global(code) {
		font-size: 0.86em;
	}
</style>
