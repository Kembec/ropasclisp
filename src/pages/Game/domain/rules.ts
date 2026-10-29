import { Choice } from "../constants/ChoiceEnum";

/** The order of the count and of every row: the game's name is this order (RO-PA-SC-LI-SP). */
export const GESTURES: readonly Choice[] = [Choice.Rock, Choice.Paper, Choice.Scissors, Choice.Lizard, Choice.Spock];

// Each gesture beats exactly two others; the verb is the rule people say out loud.
export const BEATS: Readonly<Record<Choice, Partial<Record<Choice, string>>>> = {
	[Choice.Rock]: { [Choice.Scissors]: "crushes", [Choice.Lizard]: "crushes" },
	[Choice.Paper]: { [Choice.Rock]: "covers", [Choice.Spock]: "disproves" },
	[Choice.Scissors]: { [Choice.Paper]: "cuts", [Choice.Lizard]: "decapitates" },
	[Choice.Lizard]: { [Choice.Paper]: "eats", [Choice.Spock]: "poisons" },
	[Choice.Spock]: { [Choice.Rock]: "vaporizes", [Choice.Scissors]: "smashes" },
};

/** The side that won the round; 0 is a draw, never a player name. */
export type Winner = 0 | 1 | 2;

export interface RoundOutcome {
	winner: Winner;
	/** The rule that decided it ("Spock smashes scissors"), or on a draw what both showed ("Both rock"). */
	rule: string;
	/** The verb of the rule, so each verb can be acted out; null on a draw. */
	verb: string | null;
}

/** "Rock", "Spock": the enum key is the gesture's name. */
export function gestureName(choice: Choice): string {
	const key = (Object.keys(Choice) as (keyof typeof Choice)[]).find((k) => Choice[k] === choice);

	return key ?? "";
}

/** Inside a sentence the gesture goes lowercase, except Spock, who is a name. */
function inSentence(choice: Choice): string {
	return choice === Choice.Spock ? gestureName(choice) : gestureName(choice).toLowerCase();
}

/** The two gestures that `choice` beats, in row order. */
export function beatenBy(choice: Choice): Choice[] {
	return GESTURES.filter((g) => BEATS[choice][g] !== undefined);
}

/** The two gestures that beat `choice`, in row order. */
export function beaters(choice: Choice): Choice[] {
	return GESTURES.filter((g) => BEATS[g][choice] !== undefined);
}

export function ruleFor(winner: Choice, loser: Choice): string {
	return `${gestureName(winner)} ${BEATS[winner][loser]} ${inSentence(loser)}`;
}

/** The whole chain in the order it is said aloud, each rule leading into the next. */
export const RULE_CHAIN: readonly [Choice, Choice][] = [
	[Choice.Scissors, Choice.Paper],
	[Choice.Paper, Choice.Rock],
	[Choice.Rock, Choice.Lizard],
	[Choice.Lizard, Choice.Spock],
	[Choice.Spock, Choice.Scissors],
	[Choice.Scissors, Choice.Lizard],
	[Choice.Lizard, Choice.Paper],
	[Choice.Paper, Choice.Spock],
	[Choice.Spock, Choice.Rock],
	[Choice.Rock, Choice.Scissors],
];

export function judge(p1: Choice, p2: Choice): RoundOutcome {
	if (p1 === p2) {
		return { winner: 0, rule: `Both ${inSentence(p1)}`, verb: null };
	}
	const verb = BEATS[p1][p2];
	if (verb) {
		return { winner: 1, rule: ruleFor(p1, p2), verb };
	}

	return { winner: 2, rule: ruleFor(p2, p1), verb: BEATS[p2][p1] ?? null };
}

/** Uniform over the five, blind to the other hand: the bot picks on the last beat. */
export function randomGesture(random: () => number = Math.random): Choice {
	return GESTURES[Math.min(GESTURES.length - 1, Math.floor(random() * GESTURES.length))];
}

export function isGesture(value: unknown): value is Choice {
	return typeof value === "string" && (GESTURES as readonly string[]).includes(value);
}
