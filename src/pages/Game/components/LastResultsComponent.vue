<script setup lang="ts">
	import { computed } from "vue";

	import type Result from "../interfaces/ResultInterface";
	// Intrefaces
	export interface Props {
		lastResults: Result[];
	}
	export interface Emits {
		(event: "changeResult"): void;
	}

	//Prop
	const props = defineProps<Props>();

	//Emit
	const emit = defineEmits<Emits>();

	// Computed: newest first, on a copy so the parent's array is never mutated
	const lastResults = computed<Result[]>(() => [...props.lastResults].reverse());

	// Methods
	function clearLocalStorage() {
		localStorage.result = JSON.stringify([]);
		emit("changeResult");
	}
</script>
<template>
	<section class="last-results">
		<div class="title">
			<h2>Last results</h2>
			<button
				id="clear-last-results"
				type="button"
				aria-label="Clear last results"
				@click="clearLocalStorage()"
			>
				<font-awesome-icon
					icon="fa solid fa-eraser"
					aria-hidden="true"
				/>
			</button>
		</div>
		<div
			v-for="(l, i) in lastResults"
			:key="i"
			class="result"
		>
			<div class="player">{{ l.p1 }}</div>
			<div class="vs">vs</div>
			<div class="player">{{ l.p2 }}</div>
			<div class="icon">
				<font-awesome-icon :icon="'fa-regular ' + l.choice1" />
			</div>
			<div class="icon">
				<font-awesome-icon :icon="'fa-regular ' + l.choice2" />
			</div>
			<div class="message">{{ l.message }}</div>
		</div>
	</section>
</template>
<style lang="postcss" scoped>
	.last-results {
		@apply flex flex-col border-t border-ink;
		margin-top: var(--kembec-space-bloque);
		padding-top: var(--kembec-space-grupo);
	}
	.last-results > .title {
		@apply flex items-center justify-between pb-4;
	}
	.title h2 {
		font-size: var(--kembec-subtitulo);
		line-height: var(--kembec-subtitulo-line);
		font-weight: var(--kembec-subtitulo-weight);
	}
	#clear-last-results {
		@apply flex h-11 w-11 items-center justify-center text-secondary transition-colors hover:text-ink;
	}
	.result {
		@apply grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-2 border-t border-rule py-4;
	}
	.result > * {
		@apply flex;
	}
	.result > .player:first-child,
	.result > .icon:nth-of-type(4) {
		@apply justify-end text-right;
	}
	.player {
		@apply truncate font-bold;
	}
	.vs {
		@apply row-span-2 text-secondary;
		font-family: var(--kembec-font-code);
		font-size: var(--kembec-rotulo);
		letter-spacing: var(--kembec-rotulo-tracking);
	}
	.icon {
		font-size: 28px;
	}
	.message {
		@apply col-span-full justify-center text-secondary;
		font-size: var(--kembec-apoyo);
		line-height: var(--kembec-apoyo-line);
	}
</style>
