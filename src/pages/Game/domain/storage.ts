import { cleanName, type GameState, matchWinner, newGame, type Pair, type RoundRecord, TARGET } from "./match";
import { isGesture, judge } from "./rules";

export const GAME_KEY = "ropasclisp:game:v1";
export const MUTED_KEY = "ropasclisp:muted";
// Keys of the previous flow: the saved page made a reload drop 2 players, and `result` grew without end.
const LEGACY_KEYS = ["page", "result", "firstTime"];

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function count(value: unknown): number {
	return Number.isInteger(value) && (value as number) >= 0 ? (value as number) : 0;
}

function pair(value: unknown): Pair {
	return Array.isArray(value) ? [count(value[0]), count(value[1])] : [0, 0];
}

// A round is kept only if its gestures are real; the outcome is recomputed, never trusted from storage.
function round(value: unknown): RoundRecord | null {
	const raw = value as Partial<RoundRecord> | null;
	if (!raw || !isGesture(raw.p1) || !isGesture(raw.p2)) {
		return null;
	}

	return { ...judge(raw.p1, raw.p2), p1: raw.p1, p2: raw.p2 };
}

/** Parses what a previous visit saved; anything unreadable falls back to a new game. */
export function parseGame(text: string | null): GameState {
	const fallback = newGame();
	if (!text) {
		return fallback;
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		return fallback;
	}
	if (!parsed || typeof parsed !== "object") {
		return fallback;
	}
	const raw = parsed as Partial<GameState>;
	const rounds = Array.isArray(raw.match?.rounds)
		? raw.match.rounds.map(round).filter((r): r is RoundRecord => r !== null)
		: [];
	const score = pair(raw.match?.score).map((n) => Math.min(n, TARGET)) as Pair;
	const names = Array.isArray(raw.duoNames) ? raw.duoNames : [];

	return {
		mode: raw.mode === "duo" ? "duo" : "solo",
		duoNames: [cleanName(String(names[0] ?? ""), 1), cleanName(String(names[1] ?? ""), 2)],
		match: { score, rounds, over: matchWinner({ score, rounds, over: false }) !== null },
		streak: count(raw.streak),
		best: Math.max(count(raw.best), count(raw.streak)),
		series: { solo: pair(raw.series?.solo), duo: pair(raw.series?.duo) },
	};
}

export function loadGame(store: Store): GameState {
	for (const key of LEGACY_KEYS) {
		store.removeItem(key);
	}

	return parseGame(store.getItem(GAME_KEY));
}

export function saveGame(store: Store, state: GameState): void {
	store.setItem(GAME_KEY, JSON.stringify(state));
}

export function loadMuted(store: Store): boolean {
	return store.getItem(MUTED_KEY) === "1";
}

export function saveMuted(store: Store, muted: boolean): void {
	store.setItem(MUTED_KEY, muted ? "1" : "0");
}
