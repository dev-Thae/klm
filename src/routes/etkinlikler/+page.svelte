<script>
	// PLACEHOLDER CONTENT: the original site has an empty Events section.
	// These mock events show the intended layout; replace with real event data.
	const events = [
		{
			title: 'Sosyal Kelam Sempozyumu',
			date: 'Tarih açıklanacak',
			place: 'Yer açıklanacak',
			status: 'Planlanıyor',
			summary:
				'Sosyal Kelam projesi kapsamında; siyaset, insan hakları ve ekoloji başlıklarında bildirilerin sunulacağı akademik sempozyum.'
		},
		{
			title: 'Yeni Kitap Tanıtımı ve İmza Günü',
			date: 'Tarih açıklanacak',
			place: 'Yer açıklanacak',
			status: 'Planlanıyor',
			summary:
				'Yayınevimizin yeni çıkan eserlerinin yazarlarıyla buluşma, tanıtım ve imza etkinliği.'
		},
		{
			title: 'Kelam Araştırmaları Atölyesi',
			date: 'Tarih açıklanacak',
			place: 'Çevrimiçi',
			status: 'Planlanıyor',
			summary:
				'Lisansüstü öğrenciler için araştırma yöntemleri ve akademik yazım üzerine uygulamalı atölye.'
		}
	];
</script>

<svelte:head>
	<title>Etkinlikler — KLM Yayınları</title>
	<meta name="description" content="KLM Yayınları etkinlikleri: sempozyumlar, tanıtımlar ve atölyeler." />
</svelte:head>

<section class="events">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">Etkinlikler</span>
			<h2>Sempozyumlar, tanıtımlar, atölyeler</h2>
			<p>Yayınevimizin düzenlediği ve katıldığı akademik etkinlikler.</p>
		</div>

		<p class="draft-note" role="note">
			Bu sayfadaki etkinlikler yer tutucudur — tasarımı göstermek için örnek içerik kullanılmıştır.
			Gerçek etkinlik takvimi eklendiğinde bu not kaldırılacaktır.
		</p>

		<div class="event-list">
			{#each events as e (e.title)}
				<article class="event">
					<div class="when">
						<span class="date">{e.date}</span>
						<span class="place">{e.place}</span>
					</div>
					<div class="what">
						<span class="status">{e.status}</span>
						<h3>{e.title}</h3>
						<p>{e.summary}</p>
					</div>
				</article>
			{/each}
		</div>

		<div class="event-cta">
			<p>Etkinlik duyurularını kaçırmamak için bize yazın; duyuru listemize ekleyelim.</p>
			<a class="btn btn-ghost" href="mailto:klmyayinlari@gmail.com">Duyuru listesine katıl</a>
		</div>
	</div>
</section>

<style>
	.events {
		padding: 56px 0 80px;
	}
	.draft-note {
		font-family: var(--sans);
		font-size: 0.82rem;
		color: var(--muted);
		background: var(--gold-soft);
		border: 1px dashed var(--gold);
		border-radius: 4px;
		padding: 10px 16px;
		max-width: 64ch;
		margin: 0 0 32px;
	}
	.event-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.event {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 24px;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 24px 22px;
	}
	@media (max-width: 640px) {
		.event {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}
	.when {
		display: flex;
		flex-direction: column;
		gap: 4px;
		border-right: 1px solid var(--line);
		padding-right: 24px;
	}
	@media (max-width: 640px) {
		.when {
			border-right: none;
			border-bottom: 1px solid var(--line);
			padding: 0 0 12px;
		}
	}
	.when .date {
		font-weight: 600;
		font-size: 1.02rem;
	}
	.when .place {
		font-family: var(--sans);
		font-size: 0.82rem;
		color: var(--muted);
	}
	.status {
		display: inline-block;
		font-family: var(--sans);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		border: 1px solid color-mix(in srgb, var(--gold) 45%, transparent);
		border-radius: 999px;
		padding: 3px 12px;
		margin-bottom: 10px;
	}
	.what h3 {
		margin: 0 0 8px;
		font-size: 1.25rem;
		font-weight: 600;
	}
	.what p {
		margin: 0;
		font-size: 0.94rem;
		color: var(--muted);
		line-height: 1.55;
	}
	.event-cta {
		margin-top: 48px;
		text-align: center;
	}
	.event-cta p {
		color: var(--muted);
		margin: 0 0 16px;
	}
</style>
