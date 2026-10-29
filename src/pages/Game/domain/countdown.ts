/** Rock · Paper · Scissors · Lizard · Spock!: five beats, the throw lands when the fifth one ends. */
export const BEAT_MS = 300;
export const BEAT_COUNT = 5;
export const COUNT_MS = BEAT_MS * BEAT_COUNT;

export interface Clock {
	now(): number;
	next(callback: () => void): unknown;
	cancel(handle: unknown): void;
}

export const browserClock: Clock = {
	now: () => performance.now(),
	next: (callback) =>
		typeof requestAnimationFrame === "function" ? requestAnimationFrame(callback) : setTimeout(callback, 16),
	cancel: (handle) =>
		typeof cancelAnimationFrame === "function"
			? cancelAnimationFrame(handle as number)
			: clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export interface CountHandlers {
	onBeat(index: number): void;
	onThrow(): void;
}

/**
 * Runs the count on one clock: every frame reads the elapsed time and fires the beats it has passed,
 * so the beats, the sound and the throw cannot drift apart the way chained per-beat timers do.
 * Returns a cancel function.
 */
export function startCount(clock: Clock, handlers: CountHandlers): () => void {
	const start = clock.now();
	let fired = -1;
	let handle: unknown = null;
	let done = false;

	const frame = (): void => {
		const elapsed = clock.now() - start;
		const due = Math.min(BEAT_COUNT - 1, Math.floor(elapsed / BEAT_MS));
		while (fired < due) {
			fired += 1;
			handlers.onBeat(fired);
		}
		if (elapsed >= COUNT_MS) {
			done = true;
			handlers.onThrow();

			return;
		}
		handle = clock.next(frame);
	};
	frame();

	return () => {
		if (!done && handle !== null) {
			clock.cancel(handle);
		}
		done = true;
	};
}
