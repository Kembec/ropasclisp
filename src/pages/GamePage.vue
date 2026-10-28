<script lang="ts" setup>
	import { computed, defineAsyncComponent, onBeforeMount, ref, watch } from "vue";
	import { useRouter } from "vue-router";

	import PlayGame from "./Game/components/PlayGameComponent.vue";
	import StartGame from "./Game/components/StartGameComponent.vue";
	import type Result from "./Game/interfaces/ResultInterface";

	const LastResults = defineAsyncComponent(() => import("./Game/components/LastResultsComponent.vue"));

	const router = useRouter();

	// Data
	const page = ref<string>("StartGame");
	const players = ref<1 | 2>(1);
	const result = ref<string | null>(localStorage.result || "");

	// Computed
	const lastResults = computed<Result[]>(() => {
		if (!result.value) {
			return false;
		}

		return JSON.parse(result.value);
	});
	const componentSelected = computed<typeof StartGame | typeof PlayGame>(() => {
		if (page.value === "PlayGame") {
			return PlayGame;
		}

		return StartGame;
	});

	// Methods
	function selectPlayers(e: 1 | 2): void {
		if (page.value === "PlayGame") {
			page.value = "StartGame";

			return;
		}

		players.value = e;
		page.value = "PlayGame";
	}
	function changeResult(): void {
		result.value = localStorage.result;
	}

	// Listeners
	watch(page, (value) => {
		localStorage.setItem("page", value);
	});

	// Mounted
	onBeforeMount(() => {
		const p = localStorage.getItem("page");

		if (p) {
			page.value = p;
		}
	});
</script>
<template>
	<article id="game">
		<button
			type="button"
			class="help"
			aria-label="How to play"
			@click="router.push('/help')"
		>
			<font-awesome-icon
				:icon="['fas', 'question']"
				aria-hidden="true"
			/>
		</button>
		<Transition
			name="slide-fade"
			mode="out-in"
		>
			<component
				:key="page"
				:is="componentSelected"
				:players="page === 'PlayGame' ? players : undefined"
				@selectPlayers="selectPlayers"
				@changeResult="changeResult"
			/>
		</Transition>

		<Transition
			name="fade"
			mode="in-out"
		>
			<LastResults
				v-if="lastResults"
				:lastResults="lastResults"
				@changeResult="changeResult"
			/>
		</Transition>
	</article>
</template>
<style lang="postcss" scoped>
	#game {
		@apply flex flex-col;
	}
	#game > :deep(section) {
		@apply lg:min-h-[calc(100dvh-6.5rem)] min-h-[calc(100dvh-5rem)];
		@apply py-5 lg:py-10 flex flex-col;
		padding-inline: var(--kembec-margin);
	}
	#game > :deep(section) > * {
		@apply first:mt-auto last:mb-auto;
	}

	.help {
		@apply fixed top-4 right-4 z-40 flex h-11 w-11 items-center justify-center border border-ink bg-paper text-ink transition-colors hover:bg-ink hover:text-paper lg:top-7 lg:right-10;
	}

	.slide-fade-enter-active,
	.slide-fade-leave-active {
		transition: all 0.5s ease-in-out;
	}

	.slide-fade-enter-from,
	.slide-fade-leave-to {
		opacity: 0;
	}

	.slide-fade-enter-to,
	.slide-fade-leave-from {
		opacity: 100;
	}
</style>
