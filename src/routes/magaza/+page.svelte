<script>
	import { onMount } from 'svelte';
	import { CONTACT_EMAIL, PAYMENT } from '$lib/data/site.js';

	let { data } = $props();
	let books = $derived(data.books);
	let bySlug = $derived(new Map(books.map((b) => [b.slug, b])));

	// The site is static, so there is no checkout: the order goes out by
	// e-mail and the customer pays by bank transfer (IBAN). Secondhand books
	// are single copies, so the cart is just a list of slugs.
	const CART_KEY = 'klm-sepet';
	const tl = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

	let cart = $state([]);
	let query = $state('');
	let customer = $state({ name: '', phone: '', address: '', note: '' });
	/** set on submit: { code, text } — shows the payment instructions */
	let order = $state(null);
	let copied = $state('');

	const norm = (s) => s.toLocaleLowerCase('tr');

	let visibleBooks = $derived(
		books.filter(
			(b) =>
				!query.trim() ||
				norm(b.title).includes(norm(query.trim())) ||
				(b.author && norm(b.author).includes(norm(query.trim())))
		)
	);

	let items = $derived(cart.map((slug) => bySlug.get(slug)).filter(Boolean));
	let total = $derived(items.reduce((sum, book) => sum + (book.price ?? 0), 0));

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
			if (Array.isArray(saved)) cart = saved.filter((slug) => bySlug.has(slug));
		} catch (e) {
			/* private mode or a corrupt value: start with an empty cart */
		}
	});

	function saveCart() {
		try {
			localStorage.setItem(CART_KEY, JSON.stringify(cart));
		} catch (e) {
			/* private mode: the cart just won't persist */
		}
	}

	function add(slug) {
		if (!cart.includes(slug)) cart.push(slug);
		order = null;
		saveCart();
	}

	function remove(slug) {
		cart = cart.filter((s) => s !== slug);
		order = null;
		saveCart();
	}

	function clearCart() {
		cart = [];
		order = null;
		saveCart();
	}

	/** e.g. KLM-261030-7QX2: date + 4 random chars, quoted in the transfer description */
	function orderCode() {
		const d = new Date();
		const ymd = [d.getFullYear() % 100, d.getMonth() + 1, d.getDate()]
			.map((n) => String(n).padStart(2, '0'))
			.join('');
		const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => alphabet[n % 32]);
		return `KLM-${ymd}-${rand.join('')}`;
	}

	function buildOrderText(code) {
		return [
			`Sipariş kodu: ${code}`,
			'',
			'Merhaba, aşağıdaki ikinci el kitapları sipariş etmek istiyorum:',
			'',
			...items.map((book) => `- ${book.title} (${tl.format(book.price ?? 0)})`),
			'',
			`Toplam: ${tl.format(total)}`,
			'',
			`Ad Soyad: ${customer.name}`,
			`Telefon: ${customer.phone}`,
			`Teslimat adresi: ${customer.address}`,
			...(customer.note.trim() ? [`Not: ${customer.note}`] : []),
			'',
			'Ödemeyi banka havalesi/EFT ile, açıklamaya sipariş kodunu yazarak yapacağım.'
		].join('\n');
	}

	function submit(event) {
		event.preventDefault();
		const code = orderCode();
		order = { code, text: buildOrderText(code) };
		copied = '';
		window.location.href =
			`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Kitap siparişi ${code}`)}` +
			`&body=${encodeURIComponent(order.text)}`;
	}

	async function copy(what, text) {
		try {
			await navigator.clipboard.writeText(text);
			copied = what;
		} catch (e) {
			/* clipboard blocked: the text is still selectable on the page */
		}
	}
</script>

<svelte:head>
	<title>Mağaza — KLM Yayınları</title>
	<meta
		name="description"
		content="KLM Yayınları mağazası: ikinci el kelam, felsefe ve din bilimleri kitapları. Sipariş verin, IBAN'a ödeyin, kitabınız kargoya verilsin."
	/>
</svelte:head>

<section class="store">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">Mağaza</span>
			<h1>İkinci el kitaplar</h1>
			<p>
				Kelam, felsefe ve din bilimleri alanında seçtiğimiz ikinci el kitaplar. Her kitaptan tek
				nüsha vardır.
			</p>
		</div>

		<ol class="how" aria-label="Nasıl sipariş verilir">
			<li><span>1</span>Kitapları sepete ekleyin</li>
			<li><span>2</span>Siparişinizi e‑posta ile gönderin</li>
			<li><span>3</span>Tutarı IBAN'a havale/EFT edin</li>
			<li><span>4</span>Kitaplarınızı kargoya verelim</li>
		</ol>

		<div class="store-grid">
			<div class="shelf">
				{#if books.length > 0}
					<input
						class="search"
						type="search"
						placeholder="Kitap veya yazar ara…"
						aria-label="Mağazada ara"
						bind:value={query}
					/>
				{/if}

				{#if books.length === 0}
					<p class="empty-shelf">Şu an satışta ikinci el kitap yok. Yakında yeni kitaplar eklenecek.</p>
				{:else if visibleBooks.length === 0}
					<p class="empty-shelf">Aramanızla eşleşen kitap bulunamadı.</p>
				{:else}
					<div class="items">
						{#each visibleBooks as book (book.slug)}
							{@const inCart = cart.includes(book.slug)}
							<article class="item">
								<div class="jacket">
									{#if book.coverThumb}
										<img
											src={book.coverThumb}
											alt={`${book.title} — kapak`}
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<div class="jacket-type" aria-hidden="true">
											<span class="jacket-label">İkinci el</span>
											<span class="jacket-title">{book.title}</span>
											{#if book.author}<span class="jacket-author">{book.author}</span>{/if}
										</div>
									{/if}
									{#if book.condition}<span class="condition">{book.condition}</span>{/if}
									{#if book.demo}<span class="demo-tag">örnek</span>{/if}
								</div>
								<h2 class="title">{book.title}</h2>
								{#if book.author}<p class="byline">{book.author}</p>{/if}
								{#if book.publisher || book.year}
									<p class="facts">{[book.publisher, book.year].filter(Boolean).join(' · ')}</p>
								{/if}
								{#if book.description}<p class="desc">{book.description}</p>{/if}
								<div class="buy">
									<span class="price">{book.price != null ? tl.format(book.price) : ''}</span>
									{#if inCart}
										<button class="add in-cart" type="button" onclick={() => remove(book.slug)}>
											Sepette ✓
										</button>
									{:else}
										<button class="add" type="button" onclick={() => add(book.slug)}>
											Sepete ekle
										</button>
									{/if}
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</div>

			<aside class="cart" id="sepet" aria-labelledby="sepet-baslik">
				<h2 id="sepet-baslik">Sepetiniz</h2>
				{#if items.length === 0}
					<p class="hint">Sepetiniz boş. Almak istediğiniz kitapları listeden ekleyin.</p>
				{:else}
					<ul class="cart-items">
						{#each items as book (book.slug)}
							<li>
								<span class="cart-title">{book.title}</span>
								<span class="cart-price">{tl.format(book.price ?? 0)}</span>
								<button
									class="remove"
									type="button"
									aria-label={`${book.title}: sepetten çıkar`}
									onclick={() => remove(book.slug)}
								>
									×
								</button>
							</li>
						{/each}
					</ul>
					<p class="total"><span>Toplam</span><strong>{tl.format(total)}</strong></p>

					{#if order}
						<div class="payment" role="status">
							<p class="order-code">
								Sipariş kodunuz <strong>{order.code}</strong>
							</p>
							<ol>
								<li>E‑posta uygulamanızda açılan sipariş e‑postasını gönderin.</li>
								<li>
									<strong>{tl.format(total)}</strong> tutarını havale/EFT ile gönderin; açıklamaya
									sipariş kodunu yazın.
								</li>
								<li>Ödemeniz hesabımıza geçince kitaplarınızı kargoya veririz.</li>
							</ol>
							{#if PAYMENT.iban}
								<dl class="bank">
									<div>
										<dt>IBAN</dt>
										<dd>
											<span class="iban">{PAYMENT.iban}</span>
											<button type="button" class="copy" onclick={() => copy('iban', PAYMENT.iban.replace(/\s/g, ''))}>
												{copied === 'iban' ? 'Kopyalandı ✓' : 'Kopyala'}
											</button>
										</dd>
									</div>
									{#if PAYMENT.holder}<div><dt>Alıcı</dt><dd>{PAYMENT.holder}</dd></div>{/if}
									{#if PAYMENT.bank}<div><dt>Banka</dt><dd>{PAYMENT.bank}</dd></div>{/if}
								</dl>
							{:else}
								<p class="hint">IBAN bilgisi, siparişinize yanıt olarak e‑posta ile iletilecektir.</p>
							{/if}
							<details>
								<summary>E‑posta uygulamanız açılmadı mı?</summary>
								<p>
									Aşağıdaki metni kopyalayıp <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
									adresine gönderin.
								</p>
								<textarea readonly rows="8" aria-label="Sipariş metni" value={order.text}></textarea>
								<button class="btn btn-ghost" type="button" onclick={() => copy('text', order.text)}>
									{copied === 'text' ? 'Kopyalandı ✓' : 'Metni kopyala'}
								</button>
							</details>
						</div>
					{:else}
						<form onsubmit={submit}>
							<label>
								Ad Soyad
								<input required autocomplete="name" bind:value={customer.name} />
							</label>
							<label>
								Telefon
								<input type="tel" required autocomplete="tel" bind:value={customer.phone} />
							</label>
							<label>
								Teslimat adresi
								<textarea required rows="3" autocomplete="street-address" bind:value={customer.address}
								></textarea>
							</label>
							<label>
								Not <span class="optional">(isteğe bağlı)</span>
								<textarea rows="2" bind:value={customer.note}></textarea>
							</label>
							<button class="btn btn-primary" type="submit">Siparişi e‑posta ile gönder</button>
						</form>
					{/if}

					<button class="clear" type="button" onclick={clearCart}>
						{order ? 'Yeni sipariş' : 'Sepeti boşalt'}
					</button>
				{/if}
			</aside>
		</div>
	</div>
</section>

{#if items.length > 0}
	<a class="cart-bar" href="#sepet">
		<span>Sepet: {items.length} kitap · {tl.format(total)}</span>
		<span>Sepete git ↓</span>
	</a>
{/if}

<style>
	.store {
		padding: 56px 0 80px;
	}
	.sec-head {
		margin-bottom: 28px;
	}
	.sec-head h1 {
		margin: 10px 0 12px;
		font-size: clamp(1.9rem, 4vw, 2.7rem);
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	/* how ordering works */
	.how {
		list-style: none;
		margin: 0 0 40px;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 10px 28px;
		font-family: var(--sans);
		font-size: 0.86rem;
		color: var(--muted);
	}
	.how li {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.how span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--gold-soft);
		color: var(--gold);
		font-size: 0.74rem;
		font-weight: 700;
	}

	.store-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		gap: 40px;
		align-items: start;
	}

	.search {
		font-family: var(--sans);
		font-size: 0.9rem;
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 8px 18px;
		width: 100%;
		max-width: 320px;
		margin-bottom: 28px;
	}
	.search::placeholder {
		color: var(--muted);
	}
	.empty-shelf {
		color: var(--muted);
		font-style: italic;
		padding: 32px 0;
		margin: 0;
	}

	/* secondhand book card */
	.items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 32px 24px;
	}
	.item {
		display: flex;
		flex-direction: column;
	}
	.jacket {
		position: relative;
		aspect-ratio: 3 / 4;
		border: 1px solid var(--line);
		border-radius: 3px;
		overflow: hidden;
		background: var(--surface);
		box-shadow: var(--shadow);
		margin-bottom: 12px;
	}
	.jacket img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	/* typographic stand-in until a photo is uploaded */
	.jacket-type {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		/* bottom room for the condition badge */
		padding: 18px 16px 40px;
		border-top: 6px solid var(--gold);
	}
	.jacket-label {
		font-family: var(--sans);
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 12px;
	}
	.jacket-title {
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.3;
		text-wrap: balance;
	}
	.jacket-author {
		margin-top: auto;
		border-top: 1px solid var(--line);
		padding-top: 8px;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.condition,
	.demo-tag {
		position: absolute;
		font-family: var(--sans);
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		border-radius: 999px;
		padding: 3px 9px;
	}
	.condition {
		left: 8px;
		bottom: 8px;
		background: var(--paper);
		color: var(--ink);
		border: 1px solid var(--line);
	}
	.demo-tag {
		top: 8px;
		right: 8px;
		text-transform: uppercase;
		color: #fff;
		background: rgba(27, 36, 55, 0.55);
		backdrop-filter: blur(4px);
	}
	.title {
		margin: 0 0 2px;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.3;
	}
	.byline,
	.facts,
	.desc {
		margin: 0;
		font-family: var(--sans);
		font-size: 0.78rem;
		color: var(--muted);
	}
	.desc {
		margin-top: 6px;
		line-height: 1.45;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.buy {
		margin-top: auto;
		padding-top: 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}
	.price {
		font-family: var(--sans);
		font-size: 1rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.add {
		font-family: var(--sans);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		background: var(--lacivert);
		color: var(--on-lacivert);
		border: 1px solid var(--lacivert);
		border-radius: 3px;
		padding: 7px 12px;
		white-space: nowrap;
	}
	.add:hover {
		box-shadow: var(--shadow);
	}
	.add.in-cart {
		background: var(--surface);
		color: var(--lacivert);
	}

	/* cart */
	.cart {
		position: sticky;
		top: 88px;
		max-height: calc(100vh - 108px);
		overflow-y: auto;
		background: var(--surface);
		border: 1px solid var(--line);
		border-top: 4px solid var(--gold);
		border-radius: 4px;
		padding: 22px 20px;
		font-family: var(--sans);
		font-size: 0.88rem;
	}
	.cart h2 {
		margin: 0 0 14px;
		font-family: var(--serif);
		font-size: 1.3rem;
		font-weight: 600;
	}
	.hint {
		margin: 0 0 16px;
		color: var(--muted);
		line-height: 1.5;
	}
	.cart-items {
		list-style: none;
		margin: 0 0 14px;
		padding: 0;
		border-top: 1px solid var(--line);
	}
	.cart-items li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 10px;
		padding: 10px 0;
		border-bottom: 1px solid var(--line);
	}
	.cart-title {
		font-family: var(--serif);
		font-size: 0.95rem;
		font-weight: 600;
		line-height: 1.3;
	}
	.cart-price {
		font-variant-numeric: tabular-nums;
	}
	.remove {
		width: 26px;
		height: 26px;
		cursor: pointer;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--muted);
		font-size: 1.1rem;
		line-height: 1;
	}
	.remove:hover {
		color: var(--ink);
		background: var(--gold-soft);
	}
	.total {
		display: flex;
		justify-content: space-between;
		margin: 0 0 18px;
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-weight: 600;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.optional {
		font-weight: 400;
	}
	label input,
	textarea {
		font: inherit;
		font-size: 0.9rem;
		font-weight: 400;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid var(--line);
		border-radius: 3px;
		padding: 8px 10px;
		resize: vertical;
	}
	form .btn {
		margin-top: 4px;
	}

	/* after ordering: payment instructions */
	.payment {
		border: 1px solid var(--gold);
		background: var(--gold-soft);
		border-radius: 4px;
		padding: 16px;
	}
	.order-code {
		margin: 0 0 10px;
	}
	.order-code strong {
		font-size: 1rem;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.payment ol {
		margin: 0 0 14px;
		padding-left: 18px;
		line-height: 1.5;
	}
	.payment li + li {
		margin-top: 6px;
	}
	.bank {
		margin: 0 0 14px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 3px;
		padding: 4px 12px;
	}
	.bank > div {
		display: flex;
		gap: 12px;
		padding: 8px 0;
	}
	.bank > div + div {
		border-top: 1px solid var(--line);
	}
	.bank dt {
		width: 48px;
		flex-shrink: 0;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		padding-top: 2px;
	}
	.bank dd {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 10px;
	}
	.iban {
		font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
		font-size: 0.86rem;
		word-break: break-all;
	}
	.copy {
		font: inherit;
		font-size: 0.76rem;
		font-weight: 600;
		cursor: pointer;
		background: none;
		border: 0;
		padding: 0;
		color: var(--lacivert);
		text-decoration: underline;
	}
	details summary {
		cursor: pointer;
		font-weight: 600;
		color: var(--lacivert);
	}
	details p {
		margin: 10px 0;
		color: var(--muted);
		line-height: 1.5;
	}
	details textarea {
		width: 100%;
		margin-bottom: 10px;
		font-size: 0.8rem;
	}

	.clear {
		margin-top: 16px;
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		background: none;
		border: 0;
		padding: 0;
		color: var(--muted);
		text-decoration: underline;
	}
	.clear:hover {
		color: var(--ink);
	}

	/* mobile: the cart drops below the shelf, a floating bar jumps to it */
	.cart-bar {
		display: none;
	}
	@media (max-width: 860px) {
		.store {
			padding-bottom: 120px;
		}
		.store-grid {
			grid-template-columns: 1fr;
		}
		.items {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
			gap: 28px 16px;
		}
		.buy {
			flex-direction: column;
			align-items: stretch;
		}
		.search {
			max-width: none;
		}
		.cart {
			position: static;
			max-height: none;
			overflow: visible;
		}
		.cart-bar {
			position: fixed;
			left: 16px;
			right: 16px;
			bottom: 16px;
			z-index: 15;
			display: flex;
			justify-content: space-between;
			gap: 12px;
			padding: 14px 18px;
			border-radius: 4px;
			background: var(--lacivert);
			color: var(--on-lacivert);
			box-shadow: var(--shadow-hover);
			font-family: var(--sans);
			font-size: 0.86rem;
			font-weight: 600;
			text-decoration: none;
			white-space: nowrap;
		}
	}
</style>
