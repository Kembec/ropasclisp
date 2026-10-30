import type { Choice } from "../constants/ChoiceEnum";
import { judge, type RoundOutcome, type Winner } from "./rules";

/** First to this many round wins takes the match; draws do not count. */
export const TARGET = 3;
export const NAME_MAX = 16;
export const DEFAULT_DUO_NAMES: readonly [string, string] = ["Player 1", "Player 2"];
export const SOLO_NAMES: readonly [string, string] = ["You", "Bot"];

export type Mode = "solo" | "duo";
export type Side = 1 | 2;
export type Pair = [number, number];

export interface RoundRecord extends RoundOutcome {
	p1: Choice;
	p2: Choice;
}

export interface Match {
	score: Pair;
	rounds: RoundRecord[];
	over: boolean;
}

/** Everything that survives a reload: the match in play and what carries across matches. */
export interface GameState {
	mode: Mode;
	duoNames: [string, string];
	match: Match;
	/** Solo: matches won in a row; only losing a match resets it. */
	streak: number;
	best: number;
	/** Matches won per side: solo is [you, bot], duo is [player 1, player 2]. */
	series: { solo: Pair; duo: Pair };
}

export function freshMatch(): Match {
	return { score: [0, 0], rounds: [], over: false };
}

export function newGame(): GameState {
	return {
		mode: "solo",
		duoNames: [...DEFAULT_DUO_NAMES],
		match: freshMatch(),
		streak: 0,
		best: 0,
		series: { solo: [0, 0], duo: [0, 0] },
	};
}

export function namesOf(state: GameState): readonly [string, string] {
	return state.mode === "solo" ? SOLO_NAMES : state.duoNames;
}

export function matchWinner(match: Match): Side | null {
	if (match.score[0] >= TARGET) {
		return 1;
	}

	return match.score[1] >= TARGET ? 2 : null;
}

/** One side is a round away: the next count is the final round. */
export function isFinalRound(match: Match): boolean {
	return !match.over && Math.max(...match.score) === TARGET - 1;
}

function addTo(pair: Pair, winner: Winner): Pair {
	if (winner === 0) {
		return pair;
	}

	return winner === 1 ? [pair[0] + 1, pair[1]] : [pair[0], pair[1] + 1];
}

function closeMatch(state: GameState, winner: Side): GameState {
	const series = { ...state.series, [state.mode]: addTo(state.series[state.mode], winner) };
	if (state.mode === "duo") {
		return { ...state, series };
	}
	const streak = winner === 1 ? state.streak + 1 : 0;

	return { ...state, series, streak, best: Math.max(state.best, streak) };
}

/** Records a thrown round; once a side reaches TARGET the match is over and further rounds are ignored. */
export function playRound(state: GameState, p1: Choice, p2: Choice): GameState {
	if (state.match.over) {
		return state;
	}
	const outcome = judge(p1, p2);
	const score = addTo(state.match.score, outcome.winner);
	const match: Match = { score, rounds: [...state.match.rounds, { ...outcome, p1, p2 }], over: false };
	const winner = matchWinner(match);
	if (!winner) {
		return { ...state, match };
	}

	return closeMatch({ ...state, match: { ...match, over: true } }, winner);
}

export function rematch(state: GameState): GameState {
	return { ...state, match: freshMatch() };
}

/** Switching mode abandons the match in play: it neither counts nor breaks the streak. */
export function switchMode(state: GameState, mode: Mode): GameState {
	if (state.mode === mode) {
		return state;
	}

	return { ...state, mode, match: freshMatch() };
}

export function cleanName(raw: string, side: Side): string {
	const name = raw.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);

	return name || DEFAULT_DUO_NAMES[side - 1];
}

export function rename(state: GameState, side: Side, raw: string): GameState {
	const duoNames: [string, string] = [...state.duoNames];
	duoNames[side - 1] = cleanName(raw, side);

	return { ...state, duoNames };
}
