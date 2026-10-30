import { describe, expect, it } from "vitest";

import { Choice } from "../../constants/ChoiceEnum";
import { newGame, playRound, switchMode } from "../match";
import { GAME_KEY, loadGame, loadMuted, parseGame, saveGame, saveMuted } from "../storage";

function memory(): Storage {
	const data = new Map<string, string>();

	return {
		get length() {
			return data.size;
		},
		clear: () => data.clear(),
		getItem: (k) => data.get(k) ?? null,
		key: (i) => [...data.keys()][i] ?? null,
		removeItem: (k) => void data.delete(k),
		setItem: (k, v) => void data.set(k, String(v)),
	};
}

describe("storage", () => {
	it("a 2-player match in play comes back as 2 players with names and marks", () => {
		const store = memory();
		let s = switchMode(newGame(), "duo");
		s = { ...s, duoNames: ["Ana", "Luis"] };
		s = playRound(s, Choice.Rock, Choice.Scissors);
		saveGame(store, s);
		const back = loadGame(store);
		expect(back.mode).toBe("duo");
		expect(back.duoNames).toEqual(["Ana", "Luis"]);
		expect(back.match.score).toEqual([1, 0]);
		expect(back.match.rounds[0].rule).toBe("Rock crushes scissors");
	});

	it("garbage, a wrong shape or forged rounds fall back safely", () => {
		expect(parseGame("{not json")).toEqual(newGame());
		expect(parseGame("42")).toEqual(newGame());
		const forged = parseGame(
			JSON.stringify({
				mode: "x",
				match: {
					score: [9, -1],
					rounds: [
						{ p1: "fa-hand-rock", p2: "nope" },
						{ p1: "fa-hand-rock", p2: "fa-hand-paper", rule: "Rock wins", winner: 1 },
					],
				},
			})
		);
		expect(forged.mode).toBe("solo");
		expect(forged.match.score).toEqual([3, 0]);
		expect(forged.match.over).toBe(true);
		expect(forged.match.rounds).toHaveLength(1);
		expect(forged.match.rounds[0]).toMatchObject({ winner: 2, rule: "Paper covers rock" });
	});

	it("removes the previous flow's keys, including the endless result list", () => {
		const store = memory();
		store.setItem("page", "PlayGame");
		store.setItem("result", "[]");
		store.setItem("firstTime", "true");
		loadGame(store);
		expect([store.getItem("page"), store.getItem("result"), store.getItem("firstTime")]).toEqual([
			null,
			null,
			null,
		]);
		expect(store.getItem(GAME_KEY)).toBeNull();
	});

	it("mute is remembered", () => {
		const store = memory();
		expect(loadMuted(store)).toBe(false);
		saveMuted(store, true);
		expect(loadMuted(store)).toBe(true);
	});
});
