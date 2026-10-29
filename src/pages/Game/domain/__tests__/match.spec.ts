import { describe, expect, it } from "vitest";

import { Choice } from "../../constants/ChoiceEnum";
import { type GameState, isFinalRound, newGame, playRound, rematch, rename, switchMode, TARGET } from "../match";

const { Rock, Paper, Scissors } = Choice;

function play(state: GameState, rounds: [Choice, Choice][]): GameState {
	return rounds.reduce((s, [a, b]) => playRound(s, a, b), state);
}

describe("match", () => {
	it("ends exactly when a side reaches 3; draws do not count but are kept", () => {
		let s = play(newGame(), [
			[Rock, Scissors],
			[Rock, Rock],
			[Rock, Paper],
			[Rock, Scissors],
		]);
		expect(s.match.score).toEqual([2, 1]);
		expect(s.match.over).toBe(false);
		expect(isFinalRound(s.match)).toBe(true);
		s = playRound(s, Paper, Rock);
		expect(s.match.score).toEqual([TARGET, 1]);
		expect(s.match.over).toBe(true);
		expect(s.match.rounds).toHaveLength(5);
		expect(s.match.rounds[1].winner).toBe(0);
		expect(isFinalRound(s.match)).toBe(false);
		expect(playRound(s, Rock, Scissors)).toBe(s);
	});

	it("solo: a won match adds to the streak, a lost one resets it and keeps the best", () => {
		const win: [Choice, Choice][] = [
			[Rock, Scissors],
			[Rock, Scissors],
			[Rock, Scissors],
		];
		const lose: [Choice, Choice][] = win.map(([a, b]) => [b, a]);
		let s = play(newGame(), win);
		s = play(rematch(s), win);
		expect(s.streak).toBe(2);
		expect(s.series.solo).toEqual([2, 0]);
		s = play(rematch(s), lose);
		expect(s.streak).toBe(0);
		expect(s.best).toBe(2);
		expect(s.series.solo).toEqual([2, 1]);
	});

	it("rematch empties the marks and keeps names, mode and series", () => {
		let s = switchMode(newGame(), "duo");
		s = rename(s, 1, "  Ana  ");
		s = play(s, [
			[Rock, Scissors],
			[Rock, Scissors],
			[Rock, Scissors],
		]);
		const r = rematch(s);
		expect(r.match).toEqual({ score: [0, 0], rounds: [], over: false });
		expect(r.mode).toBe("duo");
		expect(r.duoNames).toEqual(["Ana", "Player 2"]);
		expect(r.series.duo).toEqual([1, 0]);
	});

	it("switching mode abandons the match without touching streak or series", () => {
		let s = play(newGame(), [
			[Rock, Scissors],
			[Rock, Scissors],
		]);
		s = { ...s, streak: 4, best: 4 };
		const d = switchMode(s, "duo");
		expect(d.match.score).toEqual([0, 0]);
		expect(d.streak).toBe(4);
		expect(d.series).toEqual(s.series);
		expect(switchMode(d, "duo")).toBe(d);
	});

	it("an empty or blank name falls back to the default", () => {
		expect(rename(newGame(), 2, "   ").duoNames[1]).toBe("Player 2");
		expect(rename(newGame(), 1, "x".repeat(40)).duoNames[0]).toHaveLength(16);
	});
});
