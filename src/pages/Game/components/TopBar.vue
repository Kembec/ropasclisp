<script setup lang="ts">
	import type { Mode } from "../domain/match";

	export interface Props {
		mode: Mode;
		muted: boolean;
		/** Beat being counted: the wordmark spells itself out with the count. */
		beat: number;
	}
	export interface Emits {
		(event: "mode", mode: Mode): void;
		(event: "mute"): void;
		(event: "rules"): void;
	}
	defineProps<Props>();
	const emit = defineEmits<Emits>();

	const SYLLABLES = ["Ro", "pa", "sc", "li", "sp"];
</script>
<template>
	<header class="bar">
		<h1
			class="wordmark"
			aria-label="Ropasclisp"
		>
			<span
				v-for="(s, i) in SYLLABLES"
				:key="s"
				:data-lit="beat >= i ? '' : undefined"
				aria-hidden="true"
				>{{ s }}</span
			>
		</h1>
		<div
			class="modes"
			role="group"
			aria-label="Mode"
		>
			<button
				type="button"
				:aria-pressed="mode === 'solo'"
				@click="emit('mode', 'solo')"
			>
				vs Bot
			</button>
			<button
				type="button"
				:aria-pressed="mode === 'duo'"
				@click="emit('mode', 'duo')"
			>
				2 players
			</button>
		</div>
		<button
			type="button"
			class="icon"
			aria-label="How to play"
			@click="emit('rules')"
		>
			<font-awesome-icon
				:icon="['fas', 'question']"
				aria-hidden="true"
			/>
		</button>
		<button
			type="button"
			class="icon"
			aria-label="Sound"
			:aria-pressed="!muted"
			@click="emit('mute')"
		>
			<font-awesome-icon
				:icon="['fas', muted ? 'volume-xmark' : 'volume-high']"
				aria-hidden="true"
			/>
		</button>
	</header>
</template>
<style lang="postcss" scoped>
	.bar {
		display: flex;
		align-items: center;
		gap: var(--kembec-space-dentro);
		padding: var(--kembec-space-dentro) var(--kembec-margin);
		border-bottom: 1px solid var(--kembec-rule);
	}
	.wordmark {
		margin-inline-end: auto;
		font-size: var(--kembec-subtitulo-compact);
		line-height: var(--kembec-subtitulo-compact-line);
		font-weight: var(--kembec-titular-weight);
		letter-spacing: var(--kembec-titular-tracking);
	}
	.wordmark > [data-lit] {
		color: var(--kembec-seal);
	}
	.modes {
		display: inline-flex;
		border: 1px solid var(--kembec-ink);
	}
	.modes > button {
		min-height: 44px;
		padding-inline: 10px;
		font-size: var(--kembec-apoyo);
		font-weight: 600;
		white-space: nowrap;
	}
	.modes > button[aria-pressed="true"] {
		background: var(--kembec-ink);
		color: var(--kembec-paper);
	}
	.icon {
		display: flex;
		height: 44px;
		width: 44px;
		flex: none;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--kembec-ink);
	}
	.icon[aria-pressed="false"] {
		color: var(--kembec-secondary);
		border-color: var(--kembec-rule);
	}
	@media (max-width: 380px) {
		.wordmark {
			font-size: var(--kembec-apoyo);
		}
	}
</style>
