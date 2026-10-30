<script>
	import { seriesList, languageLabel } from '$lib/data/series.js';
	import { describeError } from './github.js';
	import { slugify, SLUG_PATTERN, parseNames, imageToJpegBase64 } from './files.js';

	/**
	 * kind: 'yayin'      a published book → database/books/<slug>/      (Yayınlarımız)
	 *       'ikinci-el'  a secondhand copy → database/ikinci-el/<slug>/ (Mağaza)
	 * newTempId: () => 'temp-N', for published books without a catalog number
	 * knownIsbns: ISBNs already in the catalog as of the last build
	 */
	let { kind, client, newTempId = undefined, knownIsbns = [] } = $props();

	const CONDITIONS = ['Yeni gibi', 'Çok iyi', 'İyi', 'Orta', 'Yıpranmış'];

	let f = $state(blankForm());
	let slugTouched = $state(false);
	let slug = $derived(slugTouched ? f.slug : slugify(f.title));

	let coverFile = $state(null);
	let preview = $state(null);
	let coverInput;

	/** state: idle | saving | done | error */
	let status = $state({ state: 'idle', message: '' });

	function blankForm() {
		return {
			title: '',
			subtitle: '',
			authors: '',
			editors: '',
			translators: '',
			publisher: '',
			series: '',
			language: 'tr',
			year: '',
			pages: '',
			edition: '',
			isbn: '',
			googlePlay: '',
			catalogNo: '',
			condition: 'İyi',
			price: '',
			description: '',
			slug: ''
		};
	}

	function pickCover(event) {
		const file = event.currentTarget.files?.[0] ?? null;
		if (preview) URL.revokeObjectURL(preview);
		coverFile = file;
		preview = file ? URL.createObjectURL(file) : null;
	}

	function clearCover() {
		if (preview) URL.revokeObjectURL(preview);
		coverFile = null;
		preview = null;
		if (coverInput) coverInput.value = '';
	}

	function optionalInt(value, label) {
		const v = value.trim();
		if (!v) return null;
		if (!/^\d+$/.test(v)) throw new Error(`${label} bir tam sayı olmalı.`);
		return Number(v);
	}

	const orNull = (text) => text.trim() || null;

	/** meta.json in the shape the catalog and scripts/validate-books.mjs expect */
	function buildMeta() {
		if (!SLUG_PATTERN.test(slug))
			throw new Error(
				'Kısa ad yalnızca küçük harf, rakam ve tire içerebilir (ör. kelamda-teodise). Arapça başlıklarda kısa adı elle yazın.'
			);
		const year = optionalInt(f.year, 'Yayın yılı');
		const authors = parseNames(f.authors);

		if (kind === 'ikinci-el') {
			const price = Number(f.price.trim().replace(',', '.'));
			if (!f.price.trim() || !Number.isFinite(price) || price < 0)
				throw new Error('Fiyatı TL olarak girin (ör. 250 veya 249,90).');
			return {
				slug,
				title: f.title.trim(),
				authors,
				publisher: orNull(f.publisher),
				year,
				condition: f.condition,
				price,
				description: orNull(f.description),
				added: new Date().toISOString().slice(0, 10)
			};
		}

		const isbn = f.isbn.replace(/[^0-9]/g, '');
		if (f.isbn.trim() && !/^97[89]\d{10}$/.test(isbn))
			throw new Error('ISBN, 978 veya 979 ile başlayan 13 haneli bir numara olmalı.');
		if (isbn && knownIsbns.includes(isbn))
			throw new Error(`${isbn} ISBN'li bir yayın zaten katalogda var.`);
		if (f.googlePlay.trim() && !/^https:\/\//.test(f.googlePlay.trim()))
			throw new Error('Google Play bağlantısı https:// ile başlamalı.');
		const catalogNo = optionalInt(f.catalogNo, 'Katalog no');

		return {
			id: catalogNo ?? newTempId(),
			slug,
			title: f.title.trim(),
			subtitle: orNull(f.subtitle),
			authors,
			editors: parseNames(f.editors),
			translators: parseNames(f.translators),
			publisher: 'klm yayınları',
			isbn: isbn || null,
			year,
			edition: optionalInt(f.edition, 'Baskı'),
			pages: optionalInt(f.pages, 'Sayfa sayısı'),
			language: f.language,
			series: f.series || null,
			categories: [],
			description: orNull(f.description),
			links: { googlePlay: orNull(f.googlePlay) }
		};
	}

	async function submit(event) {
		event.preventDefault();
		const dir = `database/${kind === 'yayin' ? 'books' : 'ikinci-el'}/${slug}`;
		status = { state: 'saving', message: 'Kaydediliyor…' };
		try {
			const meta = buildMeta();
			if (await client.exists(dir))
				throw new Error(`"${slug}" kısa adıyla kayıtlı bir kitap zaten var. Kısa adı değiştirin.`);

			const files = [
				{ path: `${dir}/meta.json`, content: JSON.stringify(meta, null, '\t') + '\n', encoding: 'utf-8' }
			];
			if (coverFile) {
				files.push({
					path: `${dir}/cover.jpg`,
					content: await imageToJpegBase64(coverFile),
					encoding: 'base64'
				});
			}
			const what = kind === 'yayin' ? 'Yayın' : 'İkinci el kitap';
			await client.commit({ files, message: `${what} ekle: ${meta.title}` });

			status = {
				state: 'done',
				message: `“${meta.title}” eklendi. Site birkaç dakika içinde güncellenir.`
			};
			f = blankForm();
			slugTouched = false;
			clearCover();
		} catch (err) {
			status = { state: 'error', message: describeError(err) };
		}
	}
</script>

<form class="book-form" onsubmit={submit}>
	<div class="fields">
		<label class="wide">
			Başlık *
			<input required bind:value={f.title} />
		</label>

		{#if kind === 'yayin'}
			<label class="wide">
				Alt başlık
				<input bind:value={f.subtitle} />
			</label>
		{/if}

		<label class="wide">
			Yazar(lar) <span class="hint">virgülle ayırın</span>
			<input bind:value={f.authors} />
		</label>

		{#if kind === 'yayin'}
			<label>
				Editör(ler)
				<input bind:value={f.editors} />
			</label>
			<label>
				Çevirmen(ler)
				<input bind:value={f.translators} />
			</label>
			<label>
				Dizi
				<select bind:value={f.series}>
					<option value="">Seçilmedi (Mütenevvia)</option>
					{#each seriesList as s (s.id)}
						<option value={s.id}>{s.label}</option>
					{/each}
				</select>
			</label>
			<label>
				Dil
				<select bind:value={f.language}>
					{#each ['tr', 'en', 'ar'] as code (code)}
						<option value={code}>{languageLabel(code)}</option>
					{/each}
				</select>
			</label>
		{:else}
			<label class="wide">
				Yayınevi
				<input bind:value={f.publisher} />
			</label>
			<label>
				Durum *
				<select bind:value={f.condition}>
					{#each CONDITIONS as c (c)}
						<option value={c}>{c}</option>
					{/each}
				</select>
			</label>
			<label>
				Fiyat (TL) *
				<input required inputmode="decimal" placeholder="250" bind:value={f.price} />
			</label>
		{/if}

		<label>
			Yayın yılı
			<input inputmode="numeric" placeholder="2025" bind:value={f.year} />
		</label>

		{#if kind === 'yayin'}
			<label>
				Sayfa sayısı
				<input inputmode="numeric" bind:value={f.pages} />
			</label>
			<label>
				Baskı
				<input inputmode="numeric" placeholder="1" bind:value={f.edition} />
			</label>
			<label>
				ISBN
				<input inputmode="numeric" placeholder="978…" bind:value={f.isbn} />
			</label>
			<label class="wide">
				Google Play bağlantısı
				<input type="url" placeholder="https://play.google.com/store/books/details?id=…" bind:value={f.googlePlay} />
			</label>
		{/if}

		<label class="wide">
			{kind === 'yayin' ? 'Tanıtım yazısı' : 'Açıklama'}
			{#if kind === 'ikinci-el'}<span class="hint">kitabın durumu, cilt sayısı, notlar…</span>{/if}
			<textarea rows="4" bind:value={f.description}></textarea>
		</label>

		<label>
			Kısa ad <span class="hint">sayfa adresi; başlıktan üretilir</span>
			<input
				value={slug}
				spellcheck="false"
				oninput={(e) => {
					slugTouched = true;
					f.slug = e.currentTarget.value;
				}}
			/>
		</label>
		{#if kind === 'yayin'}
			<label>
				Katalog no <span class="hint">bilinmiyorsa boş bırakın</span>
				<input inputmode="numeric" bind:value={f.catalogNo} />
			</label>
		{/if}
	</div>

	<div class="cover">
		<span class="cover-label">Kapak görseli</span>
		<div class="cover-box">
			{#if preview}
				<img src={preview} alt="Seçilen kapak önizlemesi" />
			{:else}
				<span>Görsel seçilmedi</span>
			{/if}
		</div>
		<input
			bind:this={coverInput}
			type="file"
			accept="image/jpeg,image/png,image/webp"
			aria-label="Kapak görseli seç"
			onchange={pickCover}
		/>
		{#if coverFile}
			<button class="link" type="button" onclick={clearCover}>Görseli kaldır</button>
		{/if}
		<p class="hint">Büyük fotoğraflar yüklenmeden önce otomatik küçültülür.</p>
	</div>

	<div class="actions">
		<button class="btn btn-primary" type="submit" disabled={status.state === 'saving'}>
			{status.state === 'saving'
				? 'Kaydediliyor…'
				: kind === 'yayin'
					? 'Yayını ekle'
					: 'Mağazaya ekle'}
		</button>
		{#if status.state === 'done' || status.state === 'error'}
			<p class="status {status.state}" role={status.state === 'error' ? 'alert' : 'status'}>
				{status.message}
			</p>
		{/if}
	</div>
</form>

<style>
	.book-form {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 220px;
		gap: 24px 36px;
		align-items: start;
	}
	.fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px 20px;
	}
	.wide {
		grid-column: 1 / -1;
	}
	.cover {
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-family: var(--sans);
	}
	.cover-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--muted);
	}
	.cover-box {
		aspect-ratio: 3 / 4;
		border: 1px dashed var(--line);
		border-radius: 3px;
		background: var(--paper);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.cover-box img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.cover input {
		font-size: 0.8rem;
		max-width: 100%;
	}
	.cover .link {
		align-self: flex-start;
		font-size: 0.8rem;
	}
	.actions {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
		padding-top: 8px;
		border-top: 1px solid var(--line);
	}
	.btn[disabled] {
		opacity: 0.6;
		cursor: wait;
	}
	@media (max-width: 760px) {
		.book-form,
		.fields {
			grid-template-columns: 1fr;
		}
		.cover {
			max-width: 220px;
		}
	}
</style>
