import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

import { mount } from "../../components/__tests__/mount";
import { Choice } from "../../constants/ChoiceEnum";
import type { Clock } from "../../domain/countdown";
import type { Mode } from "../../domain/match";
import type { Reveal } from "../../domain/round";
import { useRound } from "../useRound";

/** Frames run on fake timers, so advancing time drives the single count clock. */
const timerClock: Clock = {
	now: () => Date.now(),
	next: (cb, delayMs) => setTimeout(cb, Math.max(0, delayMs)),
	cancel: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

function setup(mode: Mode, random = () => 0, onCue: (cue: string) => void = () => undefined) {
	const throws: Reveal[] = [];
	const cues: string[] = [];
	let round!: ReturnType<typeof useRound>;
	const Host = defineComponent({
		setup() {
			round = useRound({
				mode: () => mode,
				canPlay: () => true,
				onThrow: (r) => throws.push(r),
				cue: (c) => {
					cues.push(c);
					onCue(c);
				},
				clock: timerClock,
				random,
			});

			return () => h("div");
		},
	});
	const m = mount(Host);

	return { round, throws, cues, unmount: m.unmount };
}

let unmount: (() => void) | null = null;
beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	unmount?.();
	vi.useRealTimers();
});

describe("useRound", () => {
	it("solo: one tap starts the count and the round lands 1.5 s later with the bot's hand", () => {
		const t = setup("solo", () => 0.99);
		unmount = t.unmount;
		t.round.pick(1, Choice.Rock);
		expect(t.round.phase.value).toBe("counting");
		vi.advanceTimersByTime(1400);
		expect(t.throws).toHaveLength(0);
		vi.advanceTimersByTime(120);
		expect(t.throws).toEqual([
			{
				p1: Choice.Rock,
				p2: Choice.Spock,
				outcome: { winner: 2, rule: "Spock vaporizes rock", verb: "vaporizes" },
			},
		]);
		expect(t.round.phase.value).toBe("revealed");
		expect(t.cues.filter((c) => c === "beat")).toHaveLength(4);
		expect(t.cues.filter((c) => c === "throw")).toHaveLength(1);
	});

	it("a first sound that blocks 256 ms (building the AudioContext) does not push back the throw", () => {
		let blocked = false;
		const t = setup(
			"solo",
			() => 0,
			() => {
				if (!blocked) {
					blocked = true;
					vi.setSystemTime(Date.now() + 256);
				}
			}
		);
		unmount = t.unmount;
		t.round.pick(1, Choice.Rock);
		vi.advanceTimersByTime(1500 - 256 - 20);
		expect(t.throws).toHaveLength(0);
		vi.advanceTimersByTime(40);
		expect(t.throws).toHaveLength(1);
	});

	it("solo: changing the gesture before the last beat changes what is thrown", () => {
		const t = setup("solo");
		unmount = t.unmount;
		t.round.pick(1, Choice.Rock);
		vi.advanceTimersByTime(1250);
		t.round.pick(1, Choice.Paper);
		vi.advanceTimersByTime(400);
		expect(t.throws.map((r) => r.p1)).toEqual([Choice.Paper]);
	});

	it("solo: the next tap after a reveal starts the next round, with nothing in between", () => {
		const t = setup("solo");
		unmount = t.unmount;
		t.round.pick(1, Choice.Rock);
		vi.advanceTimersByTime(1600);
		t.round.pick(1, Choice.Scissors);
		expect(t.round.phase.value).toBe("counting");
		expect(t.round.reveal.value).toBeNull();
		vi.advanceTimersByTime(1600);
		expect(t.throws).toHaveLength(2);
	});

	it("2 players: the count waits for both sides, then starts on its own", () => {
		const t = setup("duo");
		unmount = t.unmount;
		t.round.pick(1, Choice.Rock);
		vi.advanceTimersByTime(3000);
		expect(t.round.phase.value).toBe("idle");
		expect(t.round.picks.value[1]).toBe(Choice.Rock);
		t.round.pick(2, Choice.Paper);
		expect(t.round.phase.value).toBe("counting");
		vi.advanceTimersByTime(1600);
		expect(t.throws[0].outcome.rule).toBe("Paper covers rock");
		expect(t.round.picks.value).toEqual({ 1: null, 2: null });
	});

	it("reset during the count drops the round: nothing is thrown", () => {
		const t = setup("solo");
		unmount = t.unmount;
		t.round.pick(1, Choice.Rock);
		vi.advanceTimersByTime(900);
		t.round.reset();
		vi.advanceTimersByTime(2000);
		expect(t.throws).toHaveLength(0);
		expect(t.round.phase.value).toBe("idle");
	});

	it("the winner acts 300 ms after both hands open", () => {
		const t = setup("solo");
		unmount = t.unmount;
		t.round.pick(1, Choice.Rock);
		vi.advanceTimersByTime(1520);
		expect(t.round.acting.value).toBe(false);
		vi.advanceTimersByTime(300);
		expect(t.round.acting.value).toBe(true);
	});
});
