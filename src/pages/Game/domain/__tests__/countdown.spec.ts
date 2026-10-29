import { describe, expect, it } from "vitest";

import { BEAT_MS, type Clock, COUNT_MS, startCount } from "../countdown";

/** A clock whose frames are stepped by hand: every frame advances `step` ms. */
function manualClock(step: number) {
	let t = 1000;
	let pending: (() => void) | null = null;
	const clock: Clock = {
		now: () => t,
		next: (cb) => {
			pending = cb;

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
				t += step;
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
