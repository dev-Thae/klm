<svelte:head>
	<title>İletişim — KLM Yayınları</title>
	<meta
		name="description"
		content="KLM Yayınları iletişim: yayın başvuruları, sipariş ve sorularınız için bize ulaşın."
	/>
</svelte:head>

<section class="contact-page">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">İletişim</span>
			<h2>Bize ulaşın</h2>
			<p>Yayın başvuruları, sipariş talepleri ve sorularınız için tek adres e-postamızdır.</p>
		</div>

		<div class="contact-grid">
			<div class="card main">
				<h3>E-posta</h3>
				<p>
					Yayın teklifi gönderirken çalışmanızın dosyasını veya özetini eklemeniz değerlendirmeyi
					hızlandırır.
				</p>
				<a class="btn btn-primary" href="mailto:klmyayinlari@gmail.com">klmyayinlari@gmail.com</a>
			</div>
			<div class="card">
				<h3>Satış kanalları</h3>
				<p>
					Matbu kitaplarımız <a href="https://www.n11.com/arama?q=klm%20yay%C4%B1nlar%C4%B1" target="_blank" rel="noopener">N11 mağazamızda</a>,
					e‑kitaplarımız Google Books üzerinde satıştadır.
				</p>
			</div>
			<div class="card">
				<h3>Yazarlar için</h3>
				<p>
					Tezinizi veya kitabınızı yayımlatmak mı istiyorsunuz? Dosyanızı e-posta ile gönderin;
					yayın kurulumuz alan uygunluğunu değerlendirir.
				</p>
			</div>
			<div class="card">
				<h3>Sosyal medya</h3>
				<p>
					Facebook ve Twitter hesaplarımızdan duyurularımızı takip edebilirsiniz.
					<em>(Profil bağlantıları eklenecek.)</em>
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.contact-page {
		padding: 56px 0 80px;
	}
	.contact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 20px;
	}
	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 24px 22px;
	}
	.card.main {
		grid-column: 1 / -1;
		border-top: 4px solid var(--gold);
	}
	.card h3 {
		margin: 0 0 8px;
		font-size: 1.15rem;
		font-weight: 600;
	}
	.card p {
		margin: 0 0 16px;
		font-size: 0.94rem;
		color: var(--muted);
		line-height: 1.55;
	}
	.card p:last-child {
		margin-bottom: 0;
	}
	.card em {
		font-size: 0.85rem;
	}
</style>
