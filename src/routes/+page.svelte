<script>
	import { base } from '$app/paths';
	import { seriesList } from '$lib/data/series.js';
	import { CONTACT_EMAIL } from '$lib/data/site.js';
	import BookCover from '$lib/components/BookCover.svelte';
	import HeroPattern from '$lib/components/HeroPattern.svelte';

	let { data } = $props();

	const submitHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Yayın başvurusu')}`;

	const steps = [
		{
			title: 'Dosyanızı gönderin',
			text: 'Tezinizi veya kitap dosyanızı, kısa bir özetle birlikte e‑posta ile iletin.'
		},
		{
			title: 'Değerlendirme',
			text: 'Yayın kurulumuz çalışmanızın alan uygunluğunu değerlendirir ve size dönüş yapar.'
		},
		{
			title: 'Yayına hazırlık',
			text: 'Kabul edilen eser, yayımlanmadan önce titiz bir yayına hazırlık sürecinden geçer.'
		},
		{
			title: 'Yayın',
			text: "Eseriniz e‑kitap olarak Google Play'de, matbu olarak satış kanallarımızda okuyucuyla buluşur."
		}
	];
</script>

<svelte:head>
	<title>KLM Yayınları — Kitabınızı yayımlayalım</title>
	<meta
		name="description"
		content="KLM Yayınları: tezlerinizi ve kitaplarınızı titiz bir yayına hazırlık sürecinin ardından e-kitap veya matbu kitap olarak yayımlıyoruz."
	/>
</svelte:head>

<section class="hero">
	<div class="pattern"><HeroPattern /></div>
	<div class="wrap hero-inner">
		<div class="hero-copy">
			<span class="eyebrow">Yayına Hazırlık Hizmeti</span>
			<h1>
				Kitabınızı <em>elektronik</em> ve <em>matbu</em> olarak yayımlıyoruz
			</h1>
			<p class="lede">
				Tezlerinizi veya kitaplarınızı titiz bir yayına hazırlık sürecinin ardından e‑kitap veya
				matbu kitap olarak yayımlıyoruz.
			</p>
			<div class="hero-actions">
				<a class="btn btn-gold" href={submitHref}>Dosyanızı gönderin</a>
				<a class="btn btn-outline" href={`${base}/katalog`}>Yayınlarımızı inceleyin</a>
			</div>
			<div class="hero-stats">
				<div><span class="num">{data.total}</span><span class="lbl">Yayımlanan eser</span></div>
				<div><span class="num">{seriesList.length}</span><span class="lbl">Dizi</span></div>
				<div><span class="num">2</span><span class="lbl">Format</span></div>
			</div>
		</div>
		<div class="hero-figure">
			<img src={`${base}/tanitim-gorsel.svg`} alt="" />
		</div>
	</div>
</section>

<section class="process">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">Nasıl çalışıyoruz</span>
			<h2>Dosyadan kitaba dört adım</h2>
			<p>Kelam ve din bilimleri alanındaki çalışmalarınızı akademik bir yayınevi çatısı altında okurla buluşturun.</p>
		</div>
		<ol class="steps">
			{#each steps as step, i (step.title)}
				<li>
					<span class="step-no">{i + 1}</span>
					<h3>{step.title}</h3>
					<p>{step.text}</p>
				</li>
			{/each}
		</ol>
		<div class="process-cta">
			<a class="btn btn-primary" href={submitHref}>Yayın başvurusu yapın</a>
			<span>veya yazın: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
		</div>
	</div>
</section>

<section class="shelf">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">Yayınlarımız</span>
			<h2>Yayımladığımız son eserler</h2>
		</div>
		<div class="covers-row">
			{#each data.row as book (book.slug)}
				<BookCover {book} />
			{/each}
		</div>
		<div class="shelf-cta">
			<a class="btn btn-ghost" href={`${base}/katalog`}>Tüm yayınlarımız · {data.total} eser</a>
		</div>
	</div>
</section>

<style>
	/* hero: the publishing-service advert */
	.hero {
		--ad-bg: #1b2437;
		--ad-fg: #f6f5f1;
		position: relative;
		overflow: hidden;
		background: var(--ad-bg);
		color: var(--ad-fg);
		padding: 0;
	}
	:global(:root[data-theme='dark']) .hero {
		--ad-bg: #0c1220;
	}
	.pattern {
		position: absolute;
		inset: 0;
	}
	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at 20% 30%,
			color-mix(in srgb, var(--ad-bg) 55%, transparent) 0%,
			var(--ad-bg) 70%
		);
		pointer-events: none;
	}
	.hero-inner {
		position: relative;
		z-index: 2;
		padding-top: 96px;
		padding-bottom: 88px;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 56px;
		align-items: center;
	}
	.hero h1 {
		margin: 16px 0 20px;
		font-size: clamp(2.2rem, 5vw, 3.4rem);
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: -0.015em;
		text-wrap: balance;
	}
	.hero h1 em {
		font-style: italic;
		color: var(--gold);
	}
	.lede {
		max-width: 48ch;
		margin: 0 0 32px;
		font-size: 1.1rem;
		opacity: 0.88;
		text-wrap: pretty;
	}
	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.btn-gold {
		background: var(--gold);
		color: var(--ad-bg);
	}
	.btn-outline {
		color: var(--ad-fg);
		border-color: color-mix(in srgb, var(--ad-fg) 40%, transparent);
	}
	.hero-stats {
		display: flex;
		gap: 40px;
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid color-mix(in srgb, var(--ad-fg) 20%, transparent);
		max-width: 520px;
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
		opacity: 0.75;
	}
	.hero-figure {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 20px 48px -20px rgba(0, 0, 0, 0.55);
		border: 1px solid color-mix(in srgb, var(--ad-fg) 18%, transparent);
	}
	.hero-figure img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}
	@media (max-width: 760px) {
		.hero-inner {
			grid-template-columns: 1fr;
			padding-top: 56px;
			padding-bottom: 64px;
			gap: 36px;
		}
		/* decorative only: on phones the headline comes first */
		.hero-figure {
			display: none;
		}
		.hero-stats {
			gap: 28px;
		}
	}

	/* process */
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 20px;
	}
	.steps li {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 24px 22px;
	}
	.step-no {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--gold-soft);
		color: var(--gold);
		font-family: var(--sans);
		font-weight: 700;
		font-size: 0.9rem;
	}
	.steps h3 {
		margin: 14px 0 6px;
		font-size: 1.15rem;
		font-weight: 600;
	}
	.steps p {
		margin: 0;
		font-size: 0.94rem;
		color: var(--muted);
		line-height: 1.55;
	}
	.process-cta {
		margin-top: 32px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
		font-family: var(--sans);
		font-size: 0.9rem;
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
	.shelf-cta {
		margin-top: 28px;
		text-align: center;
	}
</style>
