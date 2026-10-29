import { describe, expect, it } from "vitest";

import { Choice } from "../../constants/ChoiceEnum";
import { beatenBy, beaters, BEATS, GESTURES, judge, randomGesture, RULE_CHAIN } from "../rules";

describe("rules", () => {
	it("each gesture beats exactly two and loses to exactly two, and they never overlap", () => {
		for (const g of GESTURES) {
			expect(beatenBy(g)).toHaveLength(2);
			expect(beaters(g)).toHaveLength(2);
			expect(beatenBy(g).filter((x) => beaters(g).includes(x))).toEqual([]);
			expect(beatenBy(g)).toEqual(GESTURES.filter((x) => BEATS[g][x]));
		}
	});

	it("judge names the winning side and the rule with its verb", () => {
		expect(judge(Choice.Spock, Choice.Scissors)).toEqual({
			winner: 1,
			rule: "Spock smashes scissors",
			verb: "smashes",
		});
		expect(judge(Choice.Rock, Choice.Paper)).toEqual({ winner: 2, rule: "Paper covers rock", verb: "covers" });
		expect(judge(Choice.Lizard, Choice.Lizard)).toEqual({ winner: 0, rule: "Both lizard", verb: null });
		expect(judge(Choice.Spock, Choice.Spock).rule).toBe("Both Spock");
	});

	it("judge is antisymmetric over all 25 pairs", () => {
		for (const a of GESTURES) {
			for (const b of GESTURES) {
				const ab = judge(a, b);
				const ba = judge(b, a);
				expect(ab.rule).toBe(ba.rule);
				expect(ab.winner === 0 ? 0 : 3 - ab.winner).toBe(ba.winner);
			}
		}
	});

	it("the chain says all ten rules once", () => {
		const keys = RULE_CHAIN.map(([w, l]) => `${w}>${l}`);
		expect(new Set(keys).size).toBe(10);
		for (const [w, l] of RULE_CHAIN) {
			expect(BEATS[w][l]).toBeTruthy();
		}
	});

	it("randomGesture covers the five uniformly from the random source", () => {
		expect([0, 0.2, 0.4, 0.6, 0.8, 0.9999].map((r) => randomGesture(() => r))).toEqual([
			Choice.Rock,
			Choice.Paper,
			Choice.Scissors,
			Choice.Lizard,
			Choice.Spock,
			Choice.Spock,
		]);
	});
});
