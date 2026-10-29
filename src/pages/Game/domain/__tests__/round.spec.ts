import { describe, expect, it } from "vitest";

import { Choice } from "../../constants/ChoiceEnum";
import { idleRound, pickGesture, type Round, throwHands } from "../round";

const counting = (p1: Choice | null, p2: Choice | null): Round => ({
	phase: "counting",
	picks: { 1: p1, 2: p2 },
	reveal: null,
});

describe("round", () => {
	it("solo: the first pick starts the count; side 2 cannot pick", () => {
		const bot = pickGesture(idleRound(), "solo", 2, Choice.Rock);
		expect(bot.starts).toBe(false);
		expect(bot.round).toEqual(idleRound());

		const first = pickGesture(idleRound(), "solo", 1, Choice.Lizard);
		expect(first.starts).toBe(true);
		expect(first.round).toEqual(counting(Choice.Lizard, null));
	});

	it("2 players: one side ready waits, the second ready side starts the count", () => {
		const one = pickGesture(idleRound(), "duo", 2, Choice.Paper);
		expect(one.starts).toBe(false);
		expect(one.round.phase).toBe("idle");
		const two = pickGesture(one.round, "duo", 1, Choice.Rock);
		expect(two.starts).toBe(true);
		expect(two.round).toEqual(counting(Choice.Rock, Choice.Paper));
	});

	it("a pick during the count changes the hand without restarting it", () => {
		const changed = pickGesture(counting(Choice.Rock, Choice.Paper), "duo", 1, Choice.Scissors);
		expect(changed.starts).toBe(false);
		expect(changed.round).toEqual(counting(Choice.Scissors, Choice.Paper));
	});

	it("a pick after a reveal keeps the reveal until the count starts, then clears it", () => {
		const revealed = throwHands(counting(Choice.Rock, Choice.Paper));
		const waiting = pickGesture(revealed, "duo", 1, Choice.Spock);
		expect(waiting.round.reveal).toEqual(revealed.reveal);
		const next = pickGesture(waiting.round, "duo", 2, Choice.Lizard);
		expect(next.round.reveal).toBeNull();
		expect(next.round.phase).toBe("counting");
	});

	it("the throw opens both hands with the rule; the other hand can come from outside (bot or server)", () => {
		const own = throwHands(counting(Choice.Spock, Choice.Scissors));
		expect(own.phase).toBe("revealed");
		expect(own.picks).toEqual({ 1: null, 2: null });
		expect(own.reveal?.outcome).toEqual({ winner: 1, rule: "Spock smashes scissors", verb: "smashes" });

		const external = throwHands(counting(Choice.Rock, null), Choice.Paper);
		expect(external.reveal).toMatchObject({
			p1: Choice.Rock,
			p2: Choice.Paper,
			outcome: { winner: 2, rule: "Paper covers rock" },
		});
	});

	it("a throw without both hands, or outside the count, has no result", () => {
		expect(throwHands(counting(Choice.Rock, null))).toEqual(idleRound());
		expect(throwHands(idleRound(), Choice.Rock)).toEqual(idleRound());
	});
});
