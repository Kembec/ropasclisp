import { describe, expect, it } from "vitest";

import { Sound } from "../sound";

function fakeAudio() {
	let created = 0;
	const param = () => ({ setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined });
	class FakeContext {
		public state = "running";
		public currentTime = 0;
		public destination = {};
		constructor() {
			created += 1;
		}

		public createOscillator() {
			return {
				type: "",
				frequency: param(),
				connect: (n: unknown) => n,
				start: () => undefined,
				stop: () => undefined,
			};
		}

		public createGain() {
			return { gain: param(), connect: (n: unknown) => n };
		}

		public async resume() {
			return Promise.resolve();
		}

		public async suspend() {
			return Promise.resolve();
		}
	}

	return { ctor: FakeContext as unknown as typeof AudioContext, created: () => created };
}

describe("sound", () => {
	it("muted never creates an AudioContext", () => {
		const audio = fakeAudio();
		const sound = new Sound(true, audio.ctor);
		sound.play("tap");
		sound.play("win");
		expect(audio.created()).toBe(0);
	});

	it("the first sound creates one context and later sounds reuse it", () => {
		const audio = fakeAudio();
		const sound = new Sound(false, audio.ctor);
		expect(audio.created()).toBe(0);
		sound.play("tap");
		sound.play("beat");
		sound.play("draw");
		expect(audio.created()).toBe(1);
	});

	it("without Web Audio it stays silent instead of failing", () => {
		expect(() => new Sound(false, undefined).play("win")).not.toThrow();
	});
});
