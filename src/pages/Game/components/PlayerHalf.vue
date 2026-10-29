<script setup lang="ts">
	import { computed } from "vue";

	import { Choice } from "../constants/ChoiceEnum";
	import { type Side, TARGET } from "../domain/match";
	import GestureRow from "./GestureRow.vue";

	export type HandRole = "won" | "lost" | "draw" | null;

	export interface Props {
		side: Side;
		name: string;
		score: number;
		/** Revealed gesture; null keeps the closed fist of the count. */
		hand: Choice | null;
		role: HandRole;
		acting: boolean;
		verb: string | null;
		/** Beat being counted, so the fist pumps on each one; -1 at rest. */
		beat: number;
		/** Has a row to play with (the bot does not). */
		playable: boolean;
		secret: boolean;
		ready: boolean;
		selected: Choice | null;
		keys: readonly string[];
	}
	export interface Emits {
		(event: "pick", choice: Choice): void;
	}
	const props = defineProps<Props>();
	const emit = defineEmits<Emits>();

	const icon = computed<string>(() => `fa-regular ${props.hand ?? Choice.Rock}`);
	// Verbs grouped by how the losing hand is hit.
	const VERB_FAMILY: Record<string, string> = {
		crushes: "crush",
		smashes: "crush",
		covers: "cover",
		cuts: "cut",
		decapitates: "cut",
		eats: "eat",
		poisons: "eat",
		vaporizes: "vaporize",
		disproves: "tilt",
	};
	const family = computed<string | undefined>(() => (props.verb ? VERB_FAMILY[props.verb] : undefined));
</script>
<template>
	<section
		class="half"
		:data-side="side"
		:aria-label="name"
	>
		<div
			class="hand"
			:data-open="hand ? '' : undefined"
			:data-role="role ?? undefined"
			:data-acting="acting ? '' : undefined"
			:data-verb="family"
			aria-hidden="true"
		>
			<span
				:key="beat"
				class="pump"
				:data-beat="beat >= 0 ? beat : undefined"
			>
				<font-awesome-icon :icon="icon" />
			</span>
		</div>
		<div class="marks">
			<span class="who">{{ name }}</span>
			<span
				class="dots"
				role="img"
				:aria-label="`${score} of ${TARGET}`"
			>
				<i
					v-for="n in TARGET"
					:key="n"
					:data-filled="n <= score ? '' : undefined"
				/>
			</span>
			<span
				v-if="secret"
				class="ready"
				:data-on="ready ? '' : undefined"
				role="status"
			>
				<i aria-hidden="true" /><span>{{ ready ? "Ready" : "Pick" }}</span>
			</span>
		</div>
		<GestureRow
			v-if="playable"
			:secret="secret"
			:selected="secret ? null : selected"
			:beat="beat"
			:keys="keys"
			@pick="emit('pick', $event)"
		/>
	</section>
</template>
<style lang="postcss" scoped>
	.half {
		display: flex;
		min-height: 0;
		flex-direction: column;
		justify-content: flex-end;
		gap: var(--kembec-space-par);
		padding: var(--kembec-space-par) var(--kembec-margin);
	}
	.hand {
		display: flex;
		flex: 1 1 auto;
		min-height: 0;
		align-items: center;
		justify-content: center;
		font-size: clamp(64px, 11dvh, 160px);
		line-height: 1;
		color: var(--kembec-ink);
		transform: translate(0, 0);
		transition:
			transform var(--kembec-dur-move) var(--kembec-ease-stamp),
			color var(--kembec-dur-quick) linear,
			opacity var(--kembec-dur-move) linear,
			filter var(--kembec-dur-move) linear,
			clip-path var(--kembec-dur-move) var(--kembec-ease-out);
	}
	.pump {
		display: inline-flex;
	}
	/* Closed, the fist is the count, not a pick: drawn smaller and in the quiet tone, so a revealed
	   Rock (full size, in ink, stamped open) never reads as the same hand. */
	.hand:not([data-open]) {
		color: var(--kembec-secondary);
	}
	.hand:not([data-open]) .pump > :deep(svg) {
		scale: 0.78;
	}
	/* The fist pumps on every beat, as in the playground count. */
	.pump[data-beat] {
		animation: pump var(--kembec-dur-move) var(--kembec-ease-out);
	}
	@keyframes pump {
		40% {
			transform: translateY(calc(var(--toward-y, 0px) * 0.6)) translateX(calc(var(--toward-x, 0px) * 0.6));
		}
	}
	/* On the throw the hand opens like a stamp coming down. */
	.hand[data-open] .pump > :deep(svg) {
		animation: open var(--kembec-dur-stamp) var(--kembec-ease-stamp);
	}
	@keyframes open {
		from {
			scale: 1.4;
			opacity: 0;
		}
		30% {
			opacity: 1;
		}
	}
	/* The loser goes to the quiet tone in every motion setting: the outcome never depends on movement. */
	.hand[data-role="lost"] {
		color: var(--kembec-secondary);
	}
	.hand[data-role="won"][data-acting] {
		transform: translate(var(--toward-x, 0px), var(--toward-y, 0px)) scale(1.18);
	}
	/* Each family of verbs hits the losing hand its own way. */
	.hand[data-role="lost"][data-acting][data-verb="crush"] {
		transform-origin: 50% 85%;
		transform: scale(1.3, 0.42);
	}
	.hand[data-role="lost"][data-acting][data-verb="cover"] {
		transform: scale(0.86);
		opacity: 0.3;
		clip-path: inset(0 0 38% 0);
	}
	.hand[data-role="lost"][data-acting][data-verb="cut"] {
		transform: translate(4px, 12px) rotate(-10deg);
		clip-path: polygon(0 58%, 100% 30%, 100% 100%, 0 100%);
	}
	.hand[data-role="lost"][data-acting][data-verb="eat"] {
		transform: translate(var(--toward-x, 0px), var(--toward-y, 0px)) scale(0.38);
		opacity: 0.45;
	}
	.hand[data-role="lost"][data-acting][data-verb="vaporize"] {
		transform: translateY(-14px) scale(1.12);
		opacity: 0.22;
		filter: blur(7px);
	}
	.hand[data-role="lost"][data-acting][data-verb="tilt"] {
		transform-origin: 50% 90%;
		transform: rotate(-78deg);
		opacity: 0.55;
	}
	.hand[data-role="draw"][data-acting] {
		animation: clash var(--kembec-dur-enter) var(--kembec-ease-out);
	}
	@keyframes clash {
		35% {
			transform: translate(var(--toward-x, 0px), var(--toward-y, 0px));
		}
	}

	.marks {
		display: flex;
		min-height: 28px;
		align-items: center;
		gap: var(--kembec-space-dentro);
	}
	.who {
		font-size: var(--kembec-subtitulo-compact);
		line-height: var(--kembec-subtitulo-compact-line);
		font-weight: 700;
		max-width: 12ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* Match marks, one per round to win: an empty ring until a round is won, then stamped full. */
	.dots {
		display: inline-flex;
		gap: 6px;
	}
	.dots > i,
	.ready > i {
		display: block;
		height: 16px;
		width: 16px;
		border: 2px solid var(--kembec-ink);
		border-radius: var(--kembec-radius-circle);
	}
	.dots > i[data-filled] {
		background: var(--kembec-ink);
		animation: mark var(--kembec-dur-stamp) var(--kembec-ease-stamp);
	}
	@keyframes mark {
		from {
			scale: 2.2;
			opacity: 0;
		}
		40% {
			opacity: 1;
		}
	}
	.ready {
		margin-inline-start: auto;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--kembec-font-code);
		font-size: var(--kembec-rotulo);
		letter-spacing: var(--kembec-rotulo-tracking);
		text-transform: uppercase;
		color: var(--kembec-secondary);
	}
	.ready > i {
		height: 10px;
		width: 10px;
		border-color: var(--kembec-secondary);
	}
	.ready[data-on] {
		color: var(--kembec-ink);
	}
	.ready[data-on] > i {
		border-color: var(--kembec-seal);
		background: var(--kembec-seal);
	}

	/* Desktop: the hand is the stage, and the row sits under it at the width of a hand of keys. */
	@media (min-width: 1024px) {
		.half {
			align-items: center;
			justify-content: center;
			gap: var(--kembec-space-grupo);
			padding: var(--kembec-space-grupo);
		}
		.hand {
			width: 100%;
			flex: 0 1 auto;
			padding-block: var(--kembec-space-bloque);
			font-size: clamp(120px, 24dvh, 220px);
		}
		.marks {
			width: min(100%, 460px);
		}
		.half > :deep(.row) {
			width: min(100%, 460px);
		}
		.half :deep(.gesture) {
			min-height: 80px;
		}
	}

	/* Reduced motion: no pump, no stamp, no lunge in flight. The final poses still land, instantly,
	   so the verb stays readable as a state. */
	@media (prefers-reduced-motion: reduce) {
		.hand,
		.pump,
		.pump > :deep(svg),
		.dots > i {
			animation: none !important;
			transition: none !important;
		}
		.hand[data-role="won"][data-acting] {
			transform: scale(1.18);
		}
		.hand[data-role="lost"][data-acting][data-verb="eat"] {
			transform: scale(0.38);
		}
		.hand[data-role="lost"][data-acting][data-verb="vaporize"] {
			transform: none;
		}
	}
</style>
