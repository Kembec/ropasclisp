import { afterEach, describe, expect, it } from "vitest";
import { type Component, nextTick } from "vue";

import { Choice } from "../../constants/ChoiceEnum";
import { type GameState, newGame, playRound, switchMode } from "../../domain/match";
import MatchEnd from "../MatchEnd.vue";
import { mount } from "./mount";

const { Rock, Paper, Scissors, Spock } = Choice;
let unmount: (() => void) | null = null;
afterEach(() => unmount?.());

function finished(state: GameState, rounds: [Choice, Choice][]): GameState {
	return rounds.reduce((s, [a, b]) => playRound(s, a, b), state);
}

describe("MatchEnd", () => {
	it("solo win: score, one row per round including draws, streak, and Rematch focused", async () => {
		const state = finished(newGame(), [
			[Spock, Scissors],
			[Rock, Rock],
			[Rock, Paper],
			[Rock, Scissors],
			[Paper, Rock],
		]);
		let rematches = 0;
		const m = mount(MatchEnd as Component, { state, onRematch: () => rematches++ });
		unmount = m.unmount;
		await nextTick();
		expect(m.el.querySelector("h2")?.textContent).toBe("You win 3–1");
		expect([...m.el.querySelectorAll(".rounds li .rule")].map((e) => e.textContent)).toEqual([
			"Spock smashes scissors",
			"Both rock",
			"Paper covers rock",
			"Rock crushes scissors",
			"Paper covers rock",
		]);
		expect(m.el.querySelector(".carry")?.textContent?.trim()).toBe("1 in a row");
		const rematch = m.el.querySelector<HTMLButtonElement>(".primary");
		if (!rematch) {
			throw new Error("no Rematch button");
		}
		expect(document.activeElement).toBe(rematch);
		rematch.click();
		expect(rematches).toBe(1);
	});

	it("2 players: the winner by name and the series", () => {
		let state = switchMode(newGame(), "duo");
		state = { ...state, duoNames: ["Ana", "Luis"] };
		state = finished(state, [
			[Rock, Paper],
			[Rock, Paper],
			[Rock, Scissors],
			[Rock, Paper],
		]);
		const m = mount(MatchEnd as Component, { state });
		unmount = m.unmount;
		expect(m.el.querySelector("h2")?.textContent).toBe("Luis wins 3–1");
		expect(m.el.querySelector(".carry")?.textContent?.trim()).toBe("Ana 0 · Luis 1");
		expect(m.el.querySelectorAll("input")).toHaveLength(2);
	});
});
