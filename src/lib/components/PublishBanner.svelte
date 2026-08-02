<script>
	import { base } from '$app/paths';
	import HeroPattern from './HeroPattern.svelte';
</script>

<section class="publish-ad">
	<div class="pattern"><HeroPattern /></div>
	<div class="wrap ad-inner">
		<div class="ad-copy">
			<span class="eyebrow">Yayına Hazırlık Hizmeti</span>
			<h2>
				Kitaplarınızı<br />
				<em>elektronik</em> ve <em>matbu</em><br />
				olarak yayımlıyoruz
			</h2>
			<p class="lede">
				Tezlerinizi veya kitaplarınızı titiz bir yayıma hazırlık sürecinin ardından e‑kitap veya
				matbu kitap olarak yayımlıyoruz.
			</p>
			<a class="btn btn-gold" href={`${base}/iletisim`}>Bize ulaşın</a>
		</div>
		<div class="ad-figure">
			<img src={`${base}/tanitim-gorsel.svg`} alt="" loading="lazy" />
		</div>
	</div>
</section>

<style>
	.publish-ad {
		--ad-bg: #1b2437;
		--ad-fg: #f6f5f1;
		position: relative;
		overflow: hidden;
		background: var(--ad-bg);
		color: var(--ad-fg);
		padding: 0;
	}
	:global(:root[data-theme='dark']) .publish-ad {
		--ad-bg: #0c1220;
	}
	.pattern {
		position: absolute;
		inset: 0;
	}
	.publish-ad::after {
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
	.ad-inner {
		position: relative;
		z-index: 2;
		padding: 88px 24px;
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 56px;
		align-items: center;
	}
	.ad-copy {
		text-align: left;
	}
	.ad-copy .eyebrow {
		color: var(--gold);
	}
	.ad-copy h2 {
		margin: 16px 0 20px;
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 500;
		line-height: 1.15;
		letter-spacing: -0.01em;
	}
	.ad-copy h2 em {
		font-style: italic;
		color: var(--gold);
	}
	.ad-copy .lede {
		max-width: 48ch;
		margin: 0 0 32px;
		font-size: 1.1rem;
		opacity: 0.88;
		text-wrap: pretty;
	}
	.btn-gold {
		background: var(--gold);
		color: var(--ad-bg);
	}
	.ad-figure {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 20px 48px -20px rgba(0, 0, 0, 0.55);
		border: 1px solid color-mix(in srgb, var(--ad-fg) 18%, transparent);
	}
	.ad-figure img {
		display: block;
		width: 100%;
		height: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}
	@media (max-width: 760px) {
		.ad-inner {
			grid-template-columns: 1fr;
			text-align: center;
		}
		.ad-copy {
			text-align: center;
		}
		.ad-figure {
			order: -1;
			max-width: 420px;
			margin: 0 auto;
		}
	}
</style>
