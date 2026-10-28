<script lang="ts" setup>
	import { computed, onBeforeMount, onMounted, ref } from "vue";

	import { Game } from "../classes/GameClass";
	import { Choice } from "../constants/ChoiceEnum";
	import Result from "./PlayGame/ResultComponent.vue";

	// Interfaces
	export interface Props {
		players: 1 | 2;
	}
	export interface Emits {
		(event: "changeResult"): void;
		(event: "selectPlayers"): void;
	}

	// Props
	const prop = defineProps<Props>();

	// Emits
	const emit = defineEmits<Emits>();

	// Data
	const player1Name = ref<string>("Player 1");
	const player2Name = ref<string>();
	const player1Choice = ref<Choice>(Choice.Rock);
	const player2Choice = ref<Choice>();
	const resultMessage = ref<string>();
	const firstTime = ref<boolean>(false);
	const turn = ref<1 | 2>(1);

	// Mounted
	onMounted(() => {
		if (prop.players === 2) {
			player2Name.value = "Player 2";
		}
		focusAndSelect("player_1");
	});
	onBeforeMount(() => {
		const ft = localStorage.getItem("firstTime");

		if (ft) {
			firstTime.value = true;
		}
	});

	// Computed
	const p1choice = computed<Choice | null>(() => {
		if (turn.value !== 1) {
			return null;
		}

		return player1Choice.value;
	});
	const p2choice = computed<Choice | null>(() => {
		if (turn.value !== 2 || !player2Choice.value) {
			return null;
		}

		return player2Choice.value;
	});
	const buttonText = computed<string>(() => {
		if (turn.value === 1 && prop.players === 2) {
			// if it is player 1's turn and there are 2 players
			return "Next Player";
		}

		return "Play Game";
	});

	// Methods
	function startGame(): void {
		if (!firstTime.value) {
			firstTime.value = true;
			localStorage.setItem("firstTime", "true");
		}

		if (prop.players === 2 && turn.value === 1) {
			// if there are 2 players and it is player 1's turn
			turn.value = 2;
			player2Name.value === "Player 2" ? focusAndSelect("player_2") : null;

			return;
		}
		const game = new Game(player1Name.value, player1Choice.value, player2Name.value, player2Choice.value);
		player1Name.value = game.player1.name;
		player1Choice.value = game.player1.choice;
		player2Name.value = game.player2.name;
		player2Choice.value = game.player2.choice;

		// create a new Game with the given player names and choices
		resultMessage.value = `The winner is: ${game.play()}`;
		saveResult();
		emit("changeResult");
	}
	function clearData(): void {
		turn.value = 1;
		player1Choice.value = Choice.Rock;
		player2Choice.value = Choice.Rock;
		resultMessage.value = "";
	}
	function changeName(event: Event | null | undefined, player: 1 | 2): void {
		if (!event || (player === 2 && prop.players !== 2)) {
			return;
		}
		const playerName = (event.target as HTMLInputElement).textContent;
		if (player === 1) {
			player1Name.value = (playerName ?? "Player 1").trim();

			return;
		}
		player2Name.value = (playerName ?? "Player 2").trim();
	}
	function saveResult(): void {
		// saves the game result to local storage
		if (!localStorage.result) {
			localStorage.result = JSON.stringify([]);
		}
		const result = JSON.parse(localStorage.result);
		const data = {
			p1: player1Name.value,
			choice1: player1Choice.value,
			p2: player2Name.value,
			choice2: player2Choice.value,
			message: resultMessage.value,
		};
		result.push(data);
		localStorage.result = JSON.stringify(result);
	}
	function focusAndSelect(id: string): void {
		if (firstTime.value) {
			return;
		}

		const element = document.getElementById(id) as HTMLHeadingElement;
		if (!element) {
			return;
		}

		element.setAttribute("readonly", "true");
		element.focus();
		element.removeAttribute("readonly");

		const range = document.createRange();
		range.selectNodeContents(element);
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);

		setTimeout(() => {
			selection?.removeAllRanges();
		}, 3000);
	}
	function selectPlayers(): void {
		emit("selectPlayers");
	}
</script>

<template>
	<section>
		<div class="play-game">
			<div
				class="player_1"
				:class="turn === 1 ? 'on' : 'off'"
			>
				<h2
					id="player_1"
					contenteditable="true"
					@input="changeName($event, 1)"
				>
					{{ player1Name || "??" }}
				</h2>
				<div
					class="selected-hand"
					:show="p1choice"
				>
					<Transition name="hand">
						<font-awesome-icon
							v-if="p1choice"
							:key="p1choice"
							:icon="'fa-regular ' + p1choice"
						/>
						<span
							v-else
							class="unknown"
							aria-label="Hidden choice"
							>?</span
						>
					</Transition>
				</div>
				<div class="hands">
					<button
						v-for="(h, n) in Choice"
						:class="player1Choice === h ? 'on' : undefined"
						:key="n"
						type="button"
						:aria-label="String(n)"
						:aria-pressed="player1Choice === h"
						@click="player1Choice = h"
					>
						<font-awesome-icon :icon="'fa-regular ' + h" />
					</button>
				</div>
			</div>
			<div
				class="player_2"
				:class="turn === 2 ? 'on' : 'off'"
			>
				<h2 v-if="prop.players === 1">BOT</h2>
				<h2
					v-else
					id="player_2"
					:contenteditable="players === 2"
					@input="changeName($event, 2)"
				>
					{{ player2Name || "??" }}
				</h2>
				<div
					class="selected-hand"
					:show="p2choice"
				>
					<Transition
						name="hand"
						mode="out-in"
					>
						<font-awesome-icon
							v-if="p2choice"
							:key="p2choice"
							:icon="'fa-regular ' + p2choice"
						/>
						<span
							v-else
							class="unknown"
							aria-label="Hidden choice"
							>?</span
						>
					</Transition>
				</div>
				<div class="hands">
					<button
						v-for="(h, n) in Choice"
						:class="player2Choice === h ? 'on' : undefined"
						:key="n"
						type="button"
						:aria-label="String(n)"
						:aria-pressed="player2Choice === h"
						@click="player2Name ? (player2Choice = h) : null"
					>
						<font-awesome-icon :icon="'fa-regular ' + h" />
					</button>
				</div>
			</div>
			<div class="footer">
				<button
					id="play-game"
					@click="startGame()"
				>
					{{ buttonText }}
				</button>
				<button
					id="select-players"
					@click="selectPlayers()"
				>
					Select Players
				</button>
			</div>
		</div>
		<Result
			v-if="resultMessage"
			:message="resultMessage"
			:p1Choice="player1Choice"
			:p2Choice="player2Choice"
			@close="clearData"
		/>
	</section>
</template>

<style lang="postcss" scoped>
	.play-game {
		@apply grid grid-cols-2;
		row-gap: var(--kembec-space-bloque);
	}
	.play-game > * {
		@apply relative flex flex-col;
	}
	.player_1 {
		@apply border-r border-rule pr-4 lg:pr-12;
	}
	.player_2 {
		@apply pl-4 lg:pl-12;
	}
	.play-game > * > h2 {
		@apply truncate border-b border-ink pb-2 outline-none;
		font-size: var(--kembec-subtitulo);
		line-height: var(--kembec-subtitulo-line);
		font-weight: var(--kembec-subtitulo-weight);
		letter-spacing: var(--kembec-subtitulo-tracking);
	}
	.play-game > * > h2:focus-visible {
		outline: 2px solid var(--kembec-focus);
	}
	.play-game > .off {
		@apply before:absolute before:inset-0 before:z-30 before:cursor-not-allowed before:bg-surface;
	}
	.play-game > .player_1.off {
		@apply before:right-4 lg:before:right-12;
	}
	.play-game > .player_2.off {
		@apply before:left-4 lg:before:left-12;
	}

	.player_1 > .selected-hand,
	.player_1 > .hands {
		transform: scaleX(-1);
	}

	.selected-hand {
		@apply relative my-6 flex h-[clamp(120px,22vw,260px)] items-center justify-center text-ink lg:my-10;
		font-size: clamp(72px, 14vw, 180px);
	}
	.selected-hand > svg,
	.selected-hand > .unknown {
		@apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2;
	}
	.unknown {
		font-family: var(--kembec-font-code);
		@apply text-secondary;
	}

	.hands {
		@apply grid grid-cols-3 border-t border-rule sm:grid-cols-5;
	}
	.hands > button {
		@apply flex min-h-[48px] items-center justify-center border-b-2 border-transparent py-3 text-secondary transition-colors hover:text-ink;
		font-size: clamp(24px, 3vw, 36px);
	}
	.hands > button.on {
		@apply border-ink text-ink;
	}

	.footer {
		@apply col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2;
	}
	.footer > button {
		@apply flex min-h-[56px] w-full items-center justify-center px-6 transition-colors;
		font-size: var(--kembec-subtitulo-compact);
		line-height: var(--kembec-subtitulo-compact-line);
		font-weight: 700;
	}
	#play-game {
		@apply bg-ink text-paper hover:bg-secondary;
	}
	#select-players {
		@apply border border-ink text-ink hover:bg-surface;
	}

	.hand-enter-active,
	.hand-leave-active {
		transition: opacity 0.2s ease, transform 0.2s ease;
	}
	.hand-enter-from,
	.hand-leave-to {
		opacity: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.hand-enter-active,
		.hand-leave-active {
			transition: none;
		}
	}
</style>
