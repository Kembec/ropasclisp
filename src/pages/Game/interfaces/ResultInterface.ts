export default interface Result {
	p1: string;
	choice1: string;
	p2: string;
	choice2: string;
	message: string;
}

/** The side that won the round; 0 is a draw, never a player name. */
export type Winner = 0 | 1 | 2;

export interface RoundOutcome {
	winner: Winner;
	/** The rule that decided it ("Spock smashes scissors"), or on a draw what both showed ("Both chose rock"). */
	rule: string;
}
