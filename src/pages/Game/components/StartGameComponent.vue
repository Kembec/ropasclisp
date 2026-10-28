<script lang="ts" setup>
	import { Choice } from "../constants/ChoiceEnum";

	export interface Emits {
		(event: "selectPlayers", player: 1 | 2): void;
	}
	const emit = defineEmits<Emits>();

	// The same regular set the board and the result use, so the first screen already shows the hands.
	const gestures = Object.entries(Choice).map(([name, icon]) => ({ name, icon }));
</script>
<template>
	<section class="start">
		<h1>Rock, paper, scissors, lizard, Spock</h1>
		<ul
			class="gestures"
			aria-label="The five gestures"
		>
			<li
				v-for="g in gestures"
				:key="g.icon"
			>
				<font-awesome-icon
					:icon="'fa-regular ' + g.icon"
					aria-hidden="true"
				/>
				<span>{{ g.name }}</span>
			</li>
		</ul>
		<div
			class="players"
			role="group"
			aria-label="Choose a mode"
		>
			<button
				id="play-1-player"
				type="button"
				@click="emit('selectPlayers', 1)"
			>
				1 Player
				<small>against the bot</small>
			</button>
			<button
				id="play-2-player"
				type="button"
				@click="emit('selectPlayers', 2)"
			>
				2 Players
				<small>same screen</small>
			</button>
		</div>
	</section>
</template>
<style lang="postcss" scoped>
	.start {
		gap: var(--kembec-space-bloque);
	}
	h1 {
		font-size: var(--kembec-titular);
		line-height: var(--kembec-titular-line);
		font-weight: var(--kembec-titular-weight);
		letter-spacing: var(--kembec-titular-tracking);
		max-width: 14ch;
	}
	.gestures {
		@apply grid grid-cols-5 border-y border-rule;
	}
	.gestures > li {
		@apply flex flex-col items-start gap-2 border-r border-rule py-4 pr-2 last:border-r-0;
		padding-left: var(--kembec-space-dentro);
	}
	.gestures > li:first-child {
		padding-left: 0;
	}
	.gestures svg {
		font-size: clamp(28px, 6vw, 56px);
	}
	.gestures span {
		font-family: var(--kembec-font-code);
		font-size: var(--kembec-rotulo);
		line-height: var(--kembec-rotulo-line);
		letter-spacing: var(--kembec-rotulo-tracking);
		@apply uppercase text-secondary;
	}
	@media (max-width: 639px) {
		.gestures > li {
			padding-left: 6px;
		}
		.gestures span {
			font-size: 12px;
			letter-spacing: 0;
			text-transform: none;
		}
	}
	.players {
		@apply grid grid-cols-1 gap-4 sm:grid-cols-2;
	}
	.players > button {
		@apply flex min-h-[64px] w-full flex-col items-start justify-center bg-ink px-6 py-4 text-left text-paper transition-colors;
		font-size: var(--kembec-subtitulo);
		line-height: var(--kembec-subtitulo-line);
		font-weight: var(--kembec-subtitulo-weight);
	}
	.players > button:hover {
		@apply bg-secondary;
	}
	.players > button small {
		font-size: var(--kembec-apoyo);
		line-height: var(--kembec-apoyo-line);
		font-weight: 400;
		opacity: 0.8;
	}
</style>
