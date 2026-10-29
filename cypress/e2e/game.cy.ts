// The round as it is played: one tap starts the count, both hands open on "Spock!", first to 3.
// The bot's draw is pinned through Math.random so every outcome is reproducible.
const gesture = (side: 1 | 2, name: string) => `.area-p${side} .gesture[aria-label="${name}"]`;
const RAND: Record<string, number> = { Rock: 0, Paper: 0.2, Scissors: 0.4, Lizard: 0.6, Spock: 0.8 };

function visitClean(): void {
	cy.visit("/", {
		onBeforeLoad(win) {
			win.localStorage.clear();
		},
	});
	cy.get(".board").should("exist");
}

function botWillThrow(name: string): void {
	cy.window().then((win) => {
		cy.stub(win.Math, "random").returns(RAND[name]);
	});
}

describe("Ropasclisp round", () => {
	it("solo: one tap per round, the rule on the reveal, and the match ends at 3", () => {
		visitClean();
		cy.get(".gesture[aria-pressed='true']").should("not.exist");
		botWillThrow("Scissors");
		cy.get(gesture(1, "Spock")).trigger("pointerdown", { pointerType: "mouse", button: 0 });
		cy.get(".board").should("have.attr", "data-phase", "counting");
		cy.get(".area-p1 .gesture[data-rel='beats']").should("have.length", 2);
		cy.get("[data-rule]", { timeout: 2500 }).should("contain.text", "Spock smashes scissors");
		cy.get(".area-p1 .dots i[data-filled]").should("have.length", 1);
		for (let i = 0; i < 2; i++) {
			cy.get(gesture(1, "Spock")).trigger("pointerdown", { pointerType: "mouse", button: 0 });
			cy.get(".board", { timeout: 2500 }).should("have.attr", "data-phase", "revealed");
		}
		cy.get(".end h2", { timeout: 4000 }).should("have.text", "You win 3–0");
		cy.get(".end .rounds li").should("have.length", 3);
		cy.focused().should("have.text", "Rematch").click();
		cy.get(".area-p1 .dots i[data-filled]").should("have.length", 0);
	});

	it("2 players: the count waits for both, and a reload keeps the mode and the marks", () => {
		visitClean();
		cy.get(".modes button").contains("2 players").click();
		cy.get(gesture(1, "Rock")).trigger("pointerdown", { pointerType: "touch" });
		cy.get(".area-p1 .ready[data-on]").should("exist");
		cy.get(".area-p1 .gesture[aria-pressed], .area-p1 .gesture[data-rel]").should("not.exist");
		cy.get(".board").should("have.attr", "data-phase", "idle");
		cy.get(gesture(2, "Paper")).trigger("pointerdown", { pointerType: "touch" });
		cy.get(".board").should("have.attr", "data-phase", "counting");
		cy.get(".area-band .face:not(.twin) [data-rule]", { timeout: 2500 }).should("contain.text", "Paper covers rock");
		cy.get(".area-p2 .dots i[data-filled]").should("have.length", 1);
		cy.reload();
		cy.get(".board").should("have.attr", "data-mode", "duo");
		cy.get(".area-p2 .dots i[data-filled]").should("have.length", 1);
	});
});
