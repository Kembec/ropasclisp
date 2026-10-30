/** Rock · Paper · Scissors · Lizard · Spock!: five beats, the throw lands when the fifth one ends. */
export const BEAT_MS = 300;
export const BEAT_COUNT = 5;
export const COUNT_MS = BEAT_MS * BEAT_COUNT;

export interface Clock {
	now(): number;
	/** Calls back once `delayMs` from now (or later, never earlier in spirit: the count re-reads `now`). */
	next(callback: () => void, delayMs: number): unknown;
	cancel(handle: unknown): void;
}

// A timer aimed at the next beat, not a poll per animation frame: with the machine loaded, frames came
// 100 ms apart and the throw landed at 1616 ms instead of 1500 (medicion.json, 390, 14:05Z).
export const browserClock: Clock = {
	now: () => performance.now(),
	next: (callback, delayMs) => setTimeout(callback, Math.max(0, delayMs)),
	cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export interface CountHandlers {
	onBeat(index: number): void;
	onThrow(): void;
}

/**
 * Runs the count on one clock: every wake-up reads the elapsed time from the same start and fires the
 * beats it has passed, so a late wake-up never shifts the ones after it the way chained per-beat
 * timers do. Each wake-up is aimed at the next beat's boundary. Returns a cancel function.
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
		const nextAt = fired + 1 < BEAT_COUNT ? (fired + 1) * BEAT_MS : COUNT_MS;
		handle = clock.next(frame, nextAt - elapsed);
	};
	frame();

	return () => {
		if (!done && handle !== null) {
			clock.cancel(handle);
		}
		done = true;
	};
}
