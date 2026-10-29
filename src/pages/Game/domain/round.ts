import type { Choice } from "../constants/ChoiceEnum";
import type { Mode, Side } from "./match";
import { judge, type RoundOutcome } from "./rules";

/**
 * One round as a value, with no clock and no view: a pick may start the count, the throw opens both
 * hands. The online mode reuses it unchanged; there the other hand comes from the server's reveal
 * instead of the bot's draw.
 */
export type Phase = "idle" | "counting" | "revealed";
export type Picks = Readonly<Record<Side, Choice | null>>;

export interface Reveal {
	p1: Choice;
	p2: Choice;
	outcome: RoundOutcome;
}

export interface Round {
	phase: Phase;
	picks: Picks;
	/** The last throw stays in the arena until the next count starts. */
	reveal: Reveal | null;
}

export interface PickResult {
	round: Round;
	/** True when this pick is the one that starts the count. */
	starts: boolean;
}

export function idleRound(): Round {
	return { phase: "idle", picks: { 1: null, 2: null }, reveal: null };
}

/** Solo needs one hand to start; two players need both, so the second ready side starts it. */
function readyToCount(picks: Picks, mode: Mode): boolean {
	return mode === "solo" ? picks[1] !== null : picks[1] !== null && picks[2] !== null;
}

/**
 * A side marks a gesture. During the count it only changes the hand (the one held on the last beat
 * is thrown); otherwise it may start the count. In solo only side 1 plays.
 */
export function pickGesture(round: Round, mode: Mode, side: Side, choice: Choice): PickResult {
	if (mode === "solo" && side !== 1) {
		return { round, starts: false };
	}
	const picks: Picks = { ...round.picks, [side]: choice };
	if (round.phase === "counting" || !readyToCount(picks, mode)) {
		return { round: { ...round, picks }, starts: false };
	}

	return { round: { phase: "counting", picks, reveal: null }, starts: true };
}

/**
 * The last beat: both hands open at once. `other` is the hand of side 2 decided at this instant
 * (the bot's blind draw, or a server's reveal); without it, side 2's own pick is thrown.
 * A missing hand drops the round back to idle without a result.
 */
export function throwHands(round: Round, other: Choice | null = round.picks[2]): Round {
	const p1 = round.picks[1];
	if (round.phase !== "counting" || !p1 || !other) {
		return idleRound();
	}

	return { phase: "revealed", picks: { 1: null, 2: null }, reveal: { p1, p2: other, outcome: judge(p1, other) } };
}
