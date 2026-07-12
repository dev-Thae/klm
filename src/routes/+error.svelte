<script>
	import { page } from '$app/state';
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>{page.status} — KLM Yayınları</title>
</svelte:head>

<section class="err">
	<div class="wrap">
		<span class="eyebrow">{page.status}</span>
		<h1>{page.error?.message ?? 'Sayfa bulunamadı'}</h1>
		<p>Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.</p>
		<a class="btn btn-primary" href={`${base}/`}>Anasayfaya dön</a>
	</div>
</section>

<style>
	.err {
		padding: 120px 0 160px;
		text-align: center;
	}
	.err h1 {
		margin: 12px 0 14px;
		font-size: clamp(1.8rem, 3.6vw, 2.5rem);
		font-weight: 500;
	}
	.err p {
		color: var(--muted);
		margin: 0 0 28px;
	}
</style>
