import { computed, type ComputedRef, onBeforeUnmount, type Ref, ref, shallowRef } from "vue";

import type { Choice } from "../constants/ChoiceEnum";
import { browserClock, type Clock, startCount } from "../domain/countdown";
import type { Mode, Side } from "../domain/match";
import { idleRound, type Phase, pickGesture, type Picks, type Reveal, type Round, throwHands } from "../domain/round";
import { randomGesture } from "../domain/rules";
import type { Cue } from "../feedback/sound";

export interface RoundOptions {
	mode: () => Mode;
	/** False while the match is over or the rules are open: a tap then does nothing. */
	canPlay: () => boolean;
	onThrow: (reveal: Reveal) => void;
	cue: (cue: Cue) => void;
	clock?: Clock;
	random?: () => number;
}

export interface RoundApi {
	phase: ComputedRef<Phase>;
	picks: ComputedRef<Picks>;
	reveal: ComputedRef<Reveal | null>;
	beat: Ref<number>;
	acting: Ref<boolean>;
	pick: (side: Side, choice: Choice) => void;
	reset: () => void;
}

/** The winner acts on the loser this long after both hands open. */
export const ACT_DELAY_MS = 300;

/** Binds the pure round to the count's clock, the bot's draw and the feedback cues. */
export function useRound(options: RoundOptions): RoundApi {
	const clock = options.clock ?? browserClock;
	const round = shallowRef<Round>(idleRound());
	const beat = ref<number>(-1);
	const acting = ref<boolean>(false);
	let cancel: (() => void) | null = null;
	let actTimer: ReturnType<typeof setTimeout> | null = null;

	function stopActing(): void {
		if (actTimer) {
			clearTimeout(actTimer);
		}
		actTimer = null;
		acting.value = false;
	}

	function land(): void {
		cancel = null;
		beat.value = -1;
		// The bot draws on the last beat, blind to the hand it faces.
		const other = options.mode() === "solo" ? randomGesture(options.random) : round.value.picks[2];
		round.value = throwHands(round.value, other);
		const { reveal } = round.value;
		if (!reveal) {
			return;
		}
		options.onThrow(reveal);
		actTimer = setTimeout(() => (acting.value = true), ACT_DELAY_MS);
	}

	function pick(side: Side, choice: Choice): void {
		if (!options.canPlay()) {
			return;
		}
		const result = pickGesture(round.value, options.mode(), side, choice);
		if (result.round === round.value) {
			return;
		}
		round.value = result.round;
		// The count takes its start before any sound: the first sound builds the AudioContext, which took
		// 256 ms on a phone-sized run and pushed the reveal to 1753 ms when it went first.
		if (result.starts) {
			stopActing();
			cancel = startCount(clock, {
				onBeat: (index) => {
					beat.value = index;
					options.cue(index === 4 ? "throw" : "beat");
				},
				onThrow: land,
			});
		}
		options.cue("tap");
	}

	/** Drops the round in play: it is never counted (closing mid-count, switching mode, rematch). */
	function reset(): void {
		cancel?.();
		cancel = null;
		stopActing();
		beat.value = -1;
		round.value = idleRound();
	}

	onBeforeUnmount(reset);

	return {
		phase: computed(() => round.value.phase),
		picks: computed(() => round.value.picks),
		reveal: computed(() => round.value.reveal),
		beat,
		acting,
		pick,
		reset,
	};
}
