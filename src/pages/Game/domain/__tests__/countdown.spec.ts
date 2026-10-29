import { describe, expect, it } from "vitest";

import { BEAT_MS, type Clock, COUNT_MS, startCount } from "../countdown";

/** A clock stepped by hand: every wake-up advances `step` ms, or exactly the delay asked for when `step` is 0. */
function manualClock(step: number) {
	let t = 1000;
	let pending: (() => void) | null = null;
	let asked = 0;
	const clock: Clock = {
		now: () => t,
		next: (cb, delayMs) => {
			pending = cb;
			asked = delayMs;

			return 1;
		},
		cancel: () => (pending = null),
	};

	return {
		clock,
		run(maxFrames = 1000) {
			for (let i = 0; i < maxFrames && pending; i++) {
				const cb = pending;
				pending = null;
				t += step || asked;
				cb();
			}
		},
		get time() {
			return t;
		},
	};
}

describe("countdown", () => {
	it("five beats at 0, 300, 600, 900 and 1200 ms, then the throw at 1500", () => {
		const m = manualClock(10);
		const beats: [number, number][] = [];
		let thrownAt = -1;
		startCount(m.clock, {
			onBeat: (i) => beats.push([i, m.time - 1000]),
			onThrow: () => (thrownAt = m.time - 1000),
		});
		m.run();
		expect(beats).toEqual([0, 1, 2, 3, 4].map((i) => [i, i * BEAT_MS]));
		expect(thrownAt).toBe(COUNT_MS);
	});

	it("aims each wake-up at the next boundary: six wake-ups, none early, the throw exactly at 1500", () => {
		const m = manualClock(0);
		const events: [string, number][] = [];
		startCount(m.clock, {
			onBeat: (i) => events.push([`b${i}`, m.time - 1000]),
			onThrow: () => events.push(["throw", m.time - 1000]),
		});
		m.run(6);
		expect(events).toEqual([
			["b0", 0],
			["b1", 300],
			["b2", 600],
			["b3", 900],
			["b4", 1200],
			["throw", COUNT_MS],
		]);
	});

	it("a wake-up that comes late does not push back the beats after it", () => {
		const m = manualClock(0);
		const beats: number[] = [];
		let late = true;
		const clock: Clock = {
			...m.clock,
			next: (cb, delayMs) => m.clock.next(cb, late ? ((late = false), delayMs + 120) : delayMs),
		};
		startCount(clock, { onBeat: () => beats.push(m.time - 1000), onThrow: () => beats.push(m.time - 1000) });
		m.run();
		expect(beats).toEqual([0, 420, 600, 900, 1200, 1500]);
	});

	it("a stalled clock (a hidden tab) still fires every beat once, in order, before the throw", () => {
		const m = manualClock(2000);
		const events: string[] = [];
		startCount(m.clock, { onBeat: (i) => events.push(`b${i}`), onThrow: () => events.push("throw") });
		m.run();
		expect(events).toEqual(["b0", "b1", "b2", "b3", "b4", "throw"]);
	});

	it("cancel stops the count: no throw, so the round never counts", () => {
		const m = manualClock(10);
		let thrown = false;
		const cancel = startCount(m.clock, { onBeat: () => undefined, onThrow: () => (thrown = true) });
		cancel();
		m.run();
		expect(thrown).toBe(false);
	});
});
