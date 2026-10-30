import type { Cue } from "./sound";

// Win is two short pulses, lose one long, a draw none: the fourth channel that tells them apart.
// Safari on iPhone has no navigator.vibrate; there the count is heard and seen only.
const PATTERNS: Partial<Record<Cue, number | number[]>> = {
	tap: 10,
	beat: 10,
	throw: 30,
	win: [25, 60, 25],
	lose: 180,
	matchWin: [25, 60, 25, 60, 25],
};

export function vibrate(cue: Cue): void {
	const pattern = PATTERNS[cue];
	if (pattern === undefined || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
		return;
	}
	try {
		navigator.vibrate(pattern);
	} catch {
		// A browser that blocks vibration (no user activation yet) is not an error for the game.
	}
}
