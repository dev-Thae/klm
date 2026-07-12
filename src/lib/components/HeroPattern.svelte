<script>
	import { onMount } from 'svelte';

	let canvas;

	onMount(() => {
		const ctx = canvas.getContext('2d');

		// khatam (eight-pointed star) line lattice: two rotated squares per cell
		function draw() {
			const host = canvas.parentElement;
			if (!host) return;
			const dpr = window.devicePixelRatio || 1;
			const w = host.clientWidth;
			const h = host.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, w, h);
			const gold =
				getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#A8842F';
			ctx.strokeStyle = gold;
			ctx.lineWidth = 1;
			const s = 104;
			const a = s * 0.36;
			for (let cy = s / 2; cy < h + s; cy += s) {
				for (let cx = s / 2; cx < w + s; cx += s) {
					ctx.globalAlpha = 0.28;
					ctx.strokeRect(cx - a, cy - a, a * 2, a * 2);
					ctx.save();
					ctx.translate(cx, cy);
					ctx.rotate(Math.PI / 4);
					ctx.strokeRect(-a, -a, a * 2, a * 2);
					ctx.restore();
					ctx.globalAlpha = 0.1;
					ctx.beginPath();
					ctx.moveTo(cx + a, cy);
					ctx.lineTo(cx + s - a, cy);
					ctx.moveTo(cx, cy + a);
					ctx.lineTo(cx, cy + s - a);
					ctx.stroke();
				}
			}
			ctx.globalAlpha = 1;
		}

		draw();

		const ro = new ResizeObserver(draw);
		ro.observe(canvas.parentElement);
		const mo = new MutationObserver(draw);
		mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

		return () => {
			ro.disconnect();
			mo.disconnect();
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
