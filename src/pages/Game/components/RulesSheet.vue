<script setup lang="ts">
	import { onMounted, ref } from "vue";

	import type { Choice } from "../constants/ChoiceEnum";
	import { beatenBy, gestureName, GESTURES, RULE_CHAIN, ruleFor } from "../domain/rules";

	export interface Emits {
		(event: "close"): void;
	}
	const emit = defineEmits<Emits>();
	const dialog = ref<HTMLDialogElement | null>(null);

	// Five gestures on a pentagon, in row order; each one points at the two it beats.
	const R = 40;
	const point = (i: number): { x: number; y: number } => {
		const a = (-90 + i * 72) * (Math.PI / 180);

		return { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
	};
	const nodes = GESTURES.map((choice, i) => ({ choice, ...point(i) }));
	// Arrows stop short of the target so the head sits outside its icon.
	const arrows = GESTURES.flatMap((winner, i) =>
		beatenBy(winner).map((loser: Choice) => {
			const from = point(i);
			const to = point(GESTURES.indexOf(loser));
			const dx = to.x - from.x;
			const dy = to.y - from.y;
			const len = Math.hypot(dx, dy);
			const trim = 11 / len;

			return {
				key: `${winner}-${loser}`,
				x1: from.x + dx * trim,
				y1: from.y + dy * trim,
				x2: to.x - dx * trim,
				y2: to.y - dy * trim,
			};
		})
	);

	onMounted(() => dialog.value?.showModal());

	function onClick(event: MouseEvent): void {
		if (event.target === dialog.value) {
			dialog.value?.close();
		}
	}
</script>
<template>
	<dialog
		ref="dialog"
		class="sheet"
		aria-labelledby="rules-title"
		@click="onClick"
		@close="emit('close')"
	>
		<div class="content">
			<header>
				<h2 id="rules-title">How to play</h2>
				<button
					type="button"
					class="close"
					aria-label="Close"
					@click="dialog?.close()"
				>
					<font-awesome-icon
						:icon="['fas', 'xmark']"
						aria-hidden="true"
					/>
				</button>
			</header>
			<p class="lead">Tap a gesture. On “Spock!” both hands open. Each gesture beats two and loses to two.</p>
			<div
				class="pentagon"
				aria-hidden="true"
			>
				<svg viewBox="0 0 100 100">
					<defs>
						<marker
							id="head"
							viewBox="0 0 6 6"
							refX="5"
							refY="3"
							markerWidth="5"
							markerHeight="5"
							orient="auto-start-reverse"
						>
							<path d="M0,0 L6,3 L0,6 z" />
						</marker>
					</defs>
					<line
						v-for="a in arrows"
						:key="a.key"
						:x1="a.x1"
						:y1="a.y1"
						:x2="a.x2"
						:y2="a.y2"
						marker-end="url(#head)"
					/>
				</svg>
				<span
					v-for="n in nodes"
					:key="n.choice"
					class="node"
					:style="{ left: n.x + '%', top: n.y + '%' }"
				>
					<font-awesome-icon :icon="'fa-regular ' + n.choice" />
					<small>{{ gestureName(n.choice) }}</small>
				</span>
			</div>
			<ol class="chain">
				<li
					v-for="[w, l] in RULE_CHAIN"
					:key="w + l"
				>
					{{ ruleFor(w, l) }}
				</li>
			</ol>
		</div>
	</dialog>
</template>
<style lang="postcss" scoped>
	.sheet {
		margin: auto 0 0;
		width: 100%;
		max-width: none;
		max-height: 92dvh;
		border: 0;
		border-top: 1px solid var(--kembec-ink);
		background: var(--kembec-paper);
		color: var(--kembec-ink);
		padding: 0;
	}
	.sheet::backdrop {
		background: color-mix(in srgb, var(--kembec-paper) 70%, transparent);
	}
	.content {
		display: flex;
		max-width: 720px;
		margin-inline: auto;
		flex-direction: column;
		gap: var(--kembec-space-par);
		padding: var(--kembec-space-grupo) var(--kembec-margin);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	h2 {
		font-size: var(--kembec-subtitulo);
		line-height: var(--kembec-subtitulo-line);
		font-weight: 700;
	}
	.close {
		display: flex;
		height: 44px;
		width: 44px;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--kembec-ink);
	}
	.lead {
		color: var(--kembec-secondary);
		font-size: var(--kembec-apoyo);
		line-height: var(--kembec-apoyo-line);
	}
	.pentagon {
		position: relative;
		width: min(100%, 300px);
		aspect-ratio: 1;
		margin-inline: auto;
	}
	/* Only the arrow layer: the icons inside each node are svg too and must stay in the flow. */
	.pentagon > svg {
		position: absolute;
		inset: 0;
		stroke: var(--kembec-secondary);
		stroke-width: 0.5;
		fill: var(--kembec-secondary);
	}
	.node {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		line-height: 1;
		transform: translate(-50%, -50%);
		padding: 4px;
		background: var(--kembec-paper);
		font-size: 26px;
	}
	.node small {
		font-size: var(--kembec-rotulo);
		font-weight: 600;
		line-height: var(--kembec-rotulo-line);
	}
	.chain {
		columns: 2;
		column-gap: var(--kembec-space-grupo);
		font-size: var(--kembec-apoyo);
		line-height: var(--kembec-apoyo-line);
	}
	@media (min-width: 1024px) {
		.sheet {
			margin: auto;
			max-width: 720px;
			border: 1px solid var(--kembec-ink);
		}
	}
</style>
