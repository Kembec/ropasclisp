import { Choice } from "../constants/ChoiceEnum";
import type GameInterface from "../interfaces/GameInterface";
import type { RoundOutcome } from "../interfaces/ResultInterface";
import { Player } from "./PlayerClass";

// Each gesture beats exactly two others; the verb is the rule people say out loud.
const BEATS: Record<Choice, Partial<Record<Choice, string>>> = {
	[Choice.Rock]: { [Choice.Scissors]: "crushes", [Choice.Lizard]: "crushes" },
	[Choice.Paper]: { [Choice.Rock]: "covers", [Choice.Spock]: "disproves" },
	[Choice.Scissors]: { [Choice.Paper]: "cuts", [Choice.Lizard]: "decapitates" },
	[Choice.Lizard]: { [Choice.Paper]: "eats", [Choice.Spock]: "poisons" },
	[Choice.Spock]: { [Choice.Rock]: "vaporizes", [Choice.Scissors]: "smashes" },
};

/** "Rock", "Spock": the enum key is the gesture's name. */
export function gestureName(choice: Choice): string {
	const key = (Object.keys(Choice) as (keyof typeof Choice)[]).find((k) => Choice[k] === choice);

	return key ?? "";
}

/** Inside a sentence the gesture goes lowercase, except Spock, who is a name. */
function inSentence(choice: Choice): string {
	return choice === Choice.Spock ? gestureName(choice) : gestureName(choice).toLowerCase();
}

export class Game implements GameInterface {
	public player1: Player;
	public player2: Player;

	constructor(player1Name: string, player1Choice: Choice, player2Name?: string, player2Choice?: Choice) {
		this.player1 = new Player(player1Name, player1Choice);
		this.player2 = new Player(player2Name, player2Choice);
	}

	public resolve(): RoundOutcome {
		const a = this.player1.choice;
		const b = this.player2.choice;

		if (a === b) {
			return { winner: 0, rule: `Both chose ${inSentence(a)}` };
		}
		const verbA = BEATS[a][b];
		if (verbA) {
			return { winner: 1, rule: `${gestureName(a)} ${verbA} ${inSentence(b)}` };
		}

		return { winner: 2, rule: `${gestureName(b)} ${BEATS[b][a]} ${inSentence(a)}` };
	}

	/** The winner's name; empty on a draw. */
	public play(): string {
		const { winner } = this.resolve();
		if (winner === 0) {
			return "";
		}

		return winner === 1 ? this.player1.name : this.player2.name;
	}
}
