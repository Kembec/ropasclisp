<script lang="ts" setup>
	import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
	import { useRoute, useRouter } from "vue-router";

	import CountBand from "./Game/components/CountBand.vue";
	import MatchEnd from "./Game/components/MatchEnd.vue";
	import PlayerHalf, { type HandRole } from "./Game/components/PlayerHalf.vue";
	import RulesSheet from "./Game/components/RulesSheet.vue";
	import TopBar from "./Game/components/TopBar.vue";
	import { useRound } from "./Game/composables/useRound";
	import {
		isFinalRound,
		type Mode,
		namesOf,
		playRound,
		rematch,
		rename,
		type Side,
		switchMode,
	} from "./Game/domain/match";
	import type { Reveal } from "./Game/domain/round";
	import { GESTURES } from "./Game/domain/rules";
	import { loadGame, loadMuted, saveGame, saveMuted } from "./Game/domain/storage";
	import { vibrate } from "./Game/feedback/haptics";
	import { type Cue, Sound } from "./Game/feedback/sound";

	/** The last reveal stays readable this long before the end-of-match screen replaces the board. */
	const END_DELAY_MS = 1400;
	const KEYS: Record<Side, readonly string[]> = { 1: ["1", "2", "3", "4", "5"], 2: ["6", "7", "8", "9", "0"] };

	const route = useRoute();
	const router = useRouter();

	const state = ref(loadGame(localStorage));
	const muted = ref<boolean>(loadMuted(localStorage));
	const sound = new Sound(muted.value);
	const showEnd = ref<boolean>(state.value.match.over);
	let endTimer: ReturnType<typeof setTimeout> | null = null;

	const solo = computed<boolean>(() => state.value.mode === "solo");
	const names = computed(() => namesOf(state.value));
	const rulesOpen = computed<boolean>(() => route.params.sheet === "help");

	function cue(name: Cue): void {
		sound.play(name);
		vibrate(name);
	}

	function outcomeCue(reveal: Reveal): Cue {
		const { winner } = reveal.outcome;
		if (winner === 0) {
			return "draw";
		}

		return !solo.value || winner === 1 ? "win" : "lose";
	}

	function onThrow(reveal: Reveal): void {
		state.value = playRound(state.value, reveal.p1, reveal.p2);
		cue(outcomeCue(reveal));
		if (!state.value.match.over) {
			return;
		}
		const won = !solo.value || state.value.match.score[0] > state.value.match.score[1];
		endTimer = setTimeout(() => {
			showEnd.value = true;
			cue(won ? "matchWin" : "matchLose");
		}, END_DELAY_MS);
	}

	const round = useRound({
		mode: () => state.value.mode,
		canPlay: () => !state.value.match.over && !rulesOpen.value,
		onThrow,
		cue,
	});

	function role(side: Side): HandRole {
		const reveal = round.reveal.value;
		if (!reveal) {
			return null;
		}
		const { winner } = reveal.outcome;
		if (winner === 0) {
			return "draw";
		}

		return winner === side ? "won" : "lost";
	}
	function hand(side: Side) {
		const reveal = round.reveal.value;

		return reveal ? (side === 1 ? reveal.p1 : reveal.p2) : null;
	}

	const verdict = computed<string>(() => {
		const reveal = round.reveal.value;
		if (!reveal || reveal.outcome.winner === 0) {
			return "Draw";
		}
		if (solo.value) {
			return reveal.outcome.winner === 1 ? "You win" : "You lose";
		}

		return `${names.value[reveal.outcome.winner - 1]} wins`;
	});
	const lastRound = computed(() => state.value.match.rounds.at(-1) ?? null);

	function clearEnd(): void {
		if (endTimer) {
			clearTimeout(endTimer);
		}
		endTimer = null;
		showEnd.value = false;
	}
	function setMode(mode: Mode): void {
		if (mode === state.value.mode) {
			return;
		}
		round.reset();
		clearEnd();
		state.value = switchMode(state.value, mode);
	}
	function onRematch(): void {
		round.reset();
		clearEnd();
		state.value = rematch(state.value);
	}
	function onChangeMode(): void {
		setMode(solo.value ? "duo" : "solo");
	}
	function toggleMute(): void {
		muted.value = !muted.value;
		sound.setMuted(muted.value);
		saveMuted(localStorage, muted.value);
	}

	// Keyboard: 1–5 is player 1 (left hand), 6–0 is player 2 (right hand); in solo only 1–5 plays.
	function onKey(event: KeyboardEvent): void {
		if (event.repeat || event.metaKey || event.ctrlKey || event.altKey || showEnd.value || rulesOpen.value) {
			return;
		}
		if ((event.target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable='true']")) {
			return;
		}
		const sides: Side[] = solo.value ? [1] : [1, 2];
		for (const side of sides) {
			const index = KEYS[side].indexOf(event.key);
			if (index >= 0) {
				event.preventDefault();
				round.pick(side, GESTURES[index]);

				return;
			}
		}
	}

	watch(state, (value) => saveGame(localStorage, value), { deep: true });
	onMounted(() => window.addEventListener("keydown", onKey));
	onBeforeUnmount(() => {
		window.removeEventListener("keydown", onKey);
		clearEnd();
	});
</script>
<template>
	<MatchEnd
		v-if="showEnd"
		:state="state"
		@rematch="onRematch"
		@change-mode="onChangeMode"
		@rename="(side, name) => (state = rename(state, side, name))"
	/>
	<article
		v-else
		id="game"
		class="board"
		:data-mode="state.mode"
		:data-phase="round.phase.value"
	>
		<TopBar
			class="area-bar"
			:mode="state.mode"
			:muted="muted"
			:beat="round.phase.value === 'counting' ? round.beat.value : -1"
			@mode="setMode"
			@mute="toggleMute"
			@rules="router.push('/help')"
		/>
		<PlayerHalf
			class="area-p2"
			:side="2"
			:name="names[1]"
			:score="state.match.score[1]"
			:hand="hand(2)"
			:role="role(2)"
			:acting="round.acting.value"
			:verb="round.reveal.value?.outcome.verb ?? null"
			:beat="round.phase.value === 'counting' ? round.beat.value : -1"
			:playable="!solo"
			:secret="!solo"
			:ready="!!round.picks.value[2]"
			:selected="null"
			:keys="KEYS[2]"
			@pick="round.pick(2, $event)"
		/>
		<CountBand
			class="area-band"
			:phase="round.phase.value"
			:beat="round.beat.value"
			:reveal="round.reveal.value"
			:verdict="verdict"
			:final="isFinalRound(state.match)"
			:last="lastRound"
			:twin="!solo"
		/>
		<PlayerHalf
			class="area-p1"
			:side="1"
			:name="names[0]"
			:score="state.match.score[0]"
			:hand="hand(1)"
			:role="role(1)"
			:acting="round.acting.value"
			:verb="round.reveal.value?.outcome.verb ?? null"
			:beat="round.phase.value === 'counting' ? round.beat.value : -1"
			:playable="true"
			:secret="!solo"
			:ready="!!round.picks.value[1]"
			:selected="round.picks.value[1]"
			:keys="KEYS[1]"
			@pick="round.pick(1, $event)"
		/>
	</article>
	<RulesSheet
		v-if="rulesOpen"
		@close="router.push('/')"
	/>
</template>
<style lang="postcss" scoped>
	/* Phone: the opponent on top, you at the thumb. Face to face, the top half turns to the far player. */
	.board {
		display: grid;
		height: 100dvh;
		grid-template-rows: auto minmax(0, 1fr) auto minmax(0, 1fr);
		grid-template-areas: "bar" "p2" "band" "p1";
		touch-action: manipulation;
	}
	.area-bar {
		grid-area: bar;
	}
	.area-band {
		grid-area: band;
	}
	.area-p1 {
		grid-area: p1;
		--toward-y: calc(-1 * var(--kembec-space-grupo));
	}
	.area-p2 {
		grid-area: p2;
		--toward-y: var(--kembec-space-grupo);
	}
	/* Solo: the bot's name and marks sit above its fist. */
	.board[data-mode="solo"] .area-p2 {
		flex-direction: column-reverse;
		justify-content: flex-end;
	}
	.board[data-mode="duo"] .area-p2 {
		transform: rotate(180deg);
		--toward-y: calc(-1 * var(--kembec-space-grupo));
	}

	/* Desktop: side by side, player 1 on the left hand's keys, player 2 on the right. */
	/* Capped at a table's width: two hands face to face across the count, never at the screen's edges. */
	@media (min-width: 1024px) {
		.board {
			width: 100%;
			max-width: 1280px;
			margin-inline: auto;
			grid-template-columns: minmax(0, 1fr) minmax(320px, 440px) minmax(0, 1fr);
			grid-template-rows: auto minmax(0, 1fr);
			grid-template-areas: "bar bar bar" "p1 band p2";
		}
		/* Solo: the bot has no row; the same space under its fist keeps both hands at one height. */
		.board[data-mode="solo"] .area-p2 {
			padding-bottom: calc(80px + 2 * var(--kembec-space-grupo));
		}
		.area-p1,
		.area-p2,
		.board[data-mode="solo"] .area-p2,
		.board[data-mode="duo"] .area-p2 {
			flex-direction: column;
			justify-content: center;
			transform: none;
			--toward-y: 0px;
		}
		.area-p1 {
			--toward-x: var(--kembec-space-bloque);
		}
		.area-p2 {
			--toward-x: calc(-1 * var(--kembec-space-bloque));
		}
		.area-p1 :deep(.marks),
		.area-p2 :deep(.marks) {
			order: -1;
		}
		/* The right-hand fist faces left, toward its opponent; flipped on the icon so the lunge keeps its direction. */
		.area-p2 :deep(.hand svg) {
			scale: -1 1;
		}
	}
</style>
