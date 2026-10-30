<script setup lang="ts">
	import { computed } from "vue";

	import type { RoundRecord } from "../domain/match";
	import type { Phase, Reveal } from "../domain/round";

	export interface Props {
		phase: Phase;
		beat: number;
		reveal: Reveal | null;
		verdict: string;
		final: boolean;
		last: RoundRecord | null;
		/** Face to face on a phone: everything is written twice, the top copy turned for the far side. */
		twin: boolean;
	}
	const props = defineProps<Props>();

	// The count is the game's name: the first two letters of each word spell RO-PA-SC-LI-SP.
	const WORDS: readonly [string, string][] = [
		["Ro", "ck"],
		["Pa", "per"],
		["Sc", "issors"],
		["Li", "zard"],
		["Sp", "ock!"],
	];

	function wordState(i: number): "past" | "now" | "next" {
		if (props.phase !== "counting" || i > props.beat) {
			return "next";
		}

		return i === props.beat ? "now" : "past";
	}

	const announcement = computed<string>(() =>
		props.phase === "revealed" && props.reveal ? `${props.reveal.outcome.rule}. ${props.verdict}.` : ""
	);
</script>
<template>
	<div
		class="band"
		:data-phase="phase"
	>
		<div
			v-for="copy in twin ? [2, 1] : [1]"
			:key="copy"
			class="face"
			:class="{ twin: copy === 2 }"
			:aria-hidden="copy === 2 ? 'true' : undefined"
		>
			<p
				v-if="final"
				class="final"
			>
				Final round
			</p>
			<template v-if="phase === 'revealed' && reveal">
				<p
					class="rule"
					data-rule
				>
					{{ reveal.outcome.rule }}
				</p>
				<p class="verdict">{{ verdict }}</p>
			</template>
			<template v-else>
				<p
					class="count"
					:aria-hidden="phase === 'counting' ? undefined : 'true'"
				>
					<span
						v-for="([lead, rest], i) in WORDS"
						:key="lead"
						class="word"
						:data-state="wordState(i)"
						><b>{{ lead }}</b
						>{{ rest }}</span
					>
				</p>
				<p
					v-if="last && phase === 'idle'"
					class="last"
				>
					<span class="last-hands"
						><font-awesome-icon :icon="'fa-regular ' + last.p1" /><font-awesome-icon
							:icon="'fa-regular ' + last.p2"
					/></span>
					{{ last.rule }}
				</p>
			</template>
		</div>
		<p
			class="sr-only"
			aria-live="polite"
		>
			{{ announcement }}
		</p>
	</div>
</template>
<style lang="postcss" scoped>
	.band {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--kembec-space-dentro);
		padding: var(--kembec-space-dentro) var(--kembec-margin);
		border-block: 1px solid var(--kembec-ink);
		text-align: center;
	}
	.face {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--kembec-space-dentro);
	}
	.twin {
		transform: rotate(180deg);
		padding-bottom: var(--kembec-space-dentro);
		border-bottom: 1px dashed var(--kembec-rule);
	}
	.final {
		font-family: var(--kembec-font-code);
		font-size: var(--kembec-rotulo);
		line-height: var(--kembec-rotulo-line);
		letter-spacing: var(--kembec-rotulo-tracking);
		text-transform: uppercase;
		color: var(--kembec-seal);
	}
	/* The count is the name of the game: RO PA SC LI SP in five fixed columns, the rest of each word
	   under its syllable. Nothing changes size on the beat, so the line never jumps and reduced motion
	   sees the same count: only colour and the bar move along it. */
	.count {
		display: grid;
		width: min(100%, 420px);
		grid-template-columns: repeat(5, minmax(0, 1fr));
		column-gap: 4px;
	}
	.word {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding-bottom: 6px;
		font-family: var(--kembec-font-code);
		font-size: 12px;
		line-height: 16px;
		letter-spacing: var(--kembec-rotulo-tracking);
		text-transform: uppercase;
		color: var(--kembec-secondary);
	}
	.word b {
		font-family: var(--kembec-font);
		font-size: clamp(28px, 4.2dvh, 44px);
		line-height: 1;
		font-weight: var(--kembec-titular-weight);
		letter-spacing: var(--kembec-titular-tracking);
	}
	.word::after {
		content: "";
		height: 4px;
		width: 70%;
		margin-top: 2px;
	}
	.word[data-state="past"] {
		color: var(--kembec-ink);
	}
	.word[data-state="now"] {
		color: var(--kembec-ink);
	}
	.word[data-state="now"] b {
		color: var(--kembec-seal);
	}
	.word[data-state="now"]::after {
		background: var(--kembec-seal);
	}
	.band[data-phase="idle"] .word b {
		color: var(--kembec-ink);
	}
	.rule {
		max-width: 16ch;
		font-size: var(--kembec-titular);
		line-height: var(--kembec-titular-line);
		font-weight: var(--kembec-titular-weight);
		letter-spacing: var(--kembec-titular-tracking);
		text-wrap: balance;
	}
	/* The verdict lands as a stamp: framed, tilted the brand's two degrees, in the seal colour. */
	.verdict {
		padding: 3px 12px;
		border: 2px solid currentColor;
		font-family: var(--kembec-font-code);
		font-size: 16px;
		line-height: 20px;
		letter-spacing: var(--kembec-rotulo-tracking);
		font-weight: 700;
		text-transform: uppercase;
		color: var(--kembec-seal);
		rotate: var(--kembec-stamp-tilt);
		animation: stamp var(--kembec-dur-stamp) var(--kembec-ease-stamp) var(--kembec-stamp-drop) backwards;
	}
	@keyframes stamp {
		from {
			scale: 1.8;
			opacity: 0;
		}
		40% {
			opacity: 1;
		}
	}
	.last {
		display: inline-flex;
		align-items: center;
		gap: var(--kembec-space-dentro);
		font-size: var(--kembec-apoyo);
		line-height: var(--kembec-apoyo-line);
		color: var(--kembec-secondary);
	}
	.last-hands {
		display: inline-flex;
		gap: 4px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	@media (min-width: 1024px) {
		.twin {
			display: none;
		}
		.band {
			gap: var(--kembec-space-par);
			padding-inline: var(--kembec-space-grupo);
			border-block: 0;
			border-inline: 1px solid var(--kembec-rule);
		}
		.word b {
			font-size: clamp(32px, 4.6dvh, 44px);
		}
		.verdict {
			font-size: 18px;
			line-height: 24px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.verdict {
			animation: none;
		}
	}
</style>
