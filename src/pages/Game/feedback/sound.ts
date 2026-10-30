/**
 * Synthesised sounds, no audio files. The AudioContext is created on the first sound after a tap
 * (browsers only unlock audio inside a user gesture) and never while muted.
 */
export type Cue = "tap" | "beat" | "throw" | "win" | "lose" | "draw" | "matchWin" | "matchLose";

interface Note {
	at: number;
	from: number;
	to?: number;
	length: number;
	gain: number;
	wave: OscillatorType;
}

const knock = (at: number, gain: number, length = 0.07): Note => ({
	at,
	from: 190,
	to: 55,
	length,
	gain,
	wave: "sine",
});

// Win rises, lose falls, a draw is two flat knocks: the outcome is heard, not only read.
const CUES: Record<Cue, Note[]> = {
	tap: [{ at: 0, from: 1400, length: 0.025, gain: 0.08, wave: "square" }],
	beat: [knock(0, 0.5)],
	throw: [knock(0, 0.9, 0.14), { at: 0, from: 880, length: 0.05, gain: 0.08, wave: "square" }],
	win: [
		{ at: 0, from: 523.25, length: 0.12, gain: 0.25, wave: "triangle" },
		{ at: 0.12, from: 783.99, length: 0.2, gain: 0.25, wave: "triangle" },
	],
	lose: [{ at: 0, from: 392, to: 174.61, length: 0.38, gain: 0.25, wave: "triangle" }],
	draw: [knock(0, 0.6), knock(0.12, 0.6)],
	matchWin: [523.25, 659.25, 783.99, 1046.5].map((from) => ({
		at: 0,
		from,
		length: 0.6,
		gain: 0.12,
		wave: "triangle" as const,
	})),
	matchLose: [130.81, 155.56, 196].map((from) => ({
		at: 0,
		from,
		length: 0.7,
		gain: 0.16,
		wave: "sawtooth" as const,
	})),
};

type AudioCtor = typeof AudioContext;

function defaultAudio(): AudioCtor | undefined {
	if (typeof window === "undefined") {
		return undefined;
	}
	const scope = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };

	return scope.AudioContext ?? scope.webkitAudioContext;
}

function voice(context: AudioContext, start: number, note: Note): void {
	const osc = context.createOscillator();
	const amp = context.createGain();
	const t = start + note.at;
	osc.type = note.wave;
	osc.frequency.setValueAtTime(note.from, t);
	if (note.to) {
		osc.frequency.exponentialRampToValueAtTime(note.to, t + note.length);
	}
	amp.gain.setValueAtTime(note.gain, t);
	amp.gain.exponentialRampToValueAtTime(0.0001, t + note.length);
	osc.connect(amp).connect(context.destination);
	osc.start(t);
	osc.stop(t + note.length + 0.02);
}

export class Sound {
	private context: AudioContext | null = null;

	constructor(
		private muted: boolean,
		private readonly Audio: AudioCtor | undefined = defaultAudio()
	) {}

	public get isMuted(): boolean {
		return this.muted;
	}

	/** Created lazily: a muted game never builds an AudioContext. */
	private ensure(): AudioContext | null {
		if (this.muted || !this.Audio) {
			return null;
		}
		if (!this.context) {
			this.context = new this.Audio();
		}
		if (this.context.state === "suspended") {
			void this.context.resume();
		}

		return this.context;
	}

	public setMuted(muted: boolean): void {
		this.muted = muted;
		if (muted && this.context) {
			void this.context.suspend();
		}
		if (!muted && this.context) {
			void this.context.resume();
		}
	}

	public play(cue: Cue): void {
		const context = this.ensure();
		if (!context) {
			return;
		}
		const start = context.currentTime;
		for (const note of CUES[cue]) {
			voice(context, start, note);
		}
	}
}
