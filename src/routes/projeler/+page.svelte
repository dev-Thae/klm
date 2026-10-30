<script>
	// PLACEHOLDER CONTENT: the live site's Projeler page is empty. These mock
	// projects show the intended layout; replace with real project data.
	const projects = [
		{
			title: 'Sosyal Kelam Projesi',
			status: 'Devam ediyor',
			tone: 'active',
			summary:
				'Kelamın toplumsal meselelere — siyaset, insan hakları, din özgürlüğü, ekoloji — sistematik biçimde uygulanmasını amaçlayan disiplinlerarası araştırma ve yayın programı.',
			scope: ['6 yayımlanmış eser', 'Dizi: Sosyal Kelam', 'Yeni cilt çalışmaları sürüyor']
		},
		{
			title: 'Kelam Terimleri Sözlüğü',
			status: 'Hazırlık',
			tone: 'prep',
			summary:
				'Klasik ve çağdaş kelam literatüründeki temel kavramları Türkçe karşılıkları ve tanımlarıyla bir araya getiren başvuru sözlüğü.',
			scope: ['Madde listesi çıkarılıyor', 'Basılı + çevrimiçi sürüm planlanıyor']
		},
		{
			title: 'Kelam Klasikleri Çeviri Dizisi',
			status: 'Planlama',
			tone: 'plan',
			summary:
				'Kelam geleneğinin temel metinlerinin tahkikli çevirilerini notlandırılmış akademik baskılar hâlinde yayımlamayı hedefleyen dizi.',
			scope: ['Eser seçkisi değerlendiriliyor', 'Çevirmen ekibi oluşturuluyor']
		},
		{
			title: 'Genç Araştırmacılar Tez Yayın Programı',
			status: 'Başvuru açık',
			tone: 'open',
			summary:
				'Kelam ve din bilimleri alanındaki nitelikli yüksek lisans ve doktora tezlerini kitaplaştıran destek programı. Başvurular e-posta ile alınır.',
			scope: ['Yıllık seçki', 'Editöryal destek yayınevi tarafından karşılanır']
		}
	];
</script>

<svelte:head>
	<title>Projeler — KLM Yayınları</title>
	<meta name="description" content="KLM Yayınları'nın yürüttüğü araştırma ve yayın projeleri." />
	<!-- hidden page: built but not linked from the nav, kept out of search results -->
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="projects">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">Projeler</span>
			<h2>Araştırma ve yayın projeleri</h2>
			<p>
				Yayınevimiz, tekil eserlerin yanında uzun soluklu araştırma ve yayın projeleri yürütür.
			</p>
		</div>

		<p class="draft-note" role="note">
			Bu sayfadaki projeler yer tutucudur — tasarımı göstermek için örnek içerik kullanılmıştır.
			Gerçek proje bilgileri eklendiğinde bu not kaldırılacaktır.
		</p>

		<div class="project-grid">
			{#each projects as p (p.title)}
				<article class="project" data-tone={p.tone}>
					<div class="project-top">
						<span class="status">{p.status}</span>
					</div>
					<h3>{p.title}</h3>
					<p class="summary">{p.summary}</p>
					<ul class="scope">
						{#each p.scope as item (item)}
							<li>{item}</li>
						{/each}
					</ul>
				</article>
			{/each}
		</div>

		<div class="project-cta">
			<p>Bir projeye katkı sunmak veya ortak yayın önermek ister misiniz?</p>
			<a class="btn btn-primary" href="mailto:klmyayinlari@gmail.com">Bize yazın</a>
		</div>
	</div>
</section>

<style>
	.projects {
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
	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
	}
	.project {
		--pc: var(--gold);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 24px 22px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.project[data-tone='active'] {
		--pc: var(--c-sosyal);
	}
	.project[data-tone='prep'] {
		--pc: var(--c-sistematik);
	}
	.project[data-tone='plan'] {
		--pc: var(--c-yontembilim);
	}
	.project[data-tone='open'] {
		--pc: var(--c-mutenevvia);
	}
	.status {
		display: inline-block;
		font-family: var(--sans);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--pc);
		border: 1px solid color-mix(in srgb, var(--pc) 45%, transparent);
		border-radius: 999px;
		padding: 4px 12px;
	}
	.project h3 {
		margin: 0;
		font-size: 1.3rem;
		font-weight: 600;
		line-height: 1.25;
		text-wrap: balance;
	}
	.summary {
		margin: 0;
		font-size: 0.95rem;
		color: var(--muted);
		line-height: 1.55;
	}
	.scope {
		margin: auto 0 0;
		padding: 12px 0 0;
		border-top: 1px solid var(--line);
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.scope li {
		font-family: var(--sans);
		font-size: 0.82rem;
		color: var(--muted);
		padding-left: 16px;
		position: relative;
	}
	.scope li::before {
		content: '✦';
		position: absolute;
		left: 0;
		color: var(--pc);
		font-size: 0.7rem;
	}
	.project-cta {
		margin-top: 48px;
		text-align: center;
	}
	.project-cta p {
		color: var(--muted);
		margin: 0 0 16px;
	}
</style>
