import { afterEach, describe, expect, it } from "vitest";
import { type Component, nextTick, reactive } from "vue";

import { Choice } from "../../constants/ChoiceEnum";
import { beatenBy, beaters } from "../../domain/rules";
import GestureRow from "../GestureRow.vue";
import { mount } from "./mount";

let unmount: (() => void) | null = null;
afterEach(() => unmount?.());

function buttons(el: HTMLElement): HTMLButtonElement[] {
	return [...el.querySelectorAll<HTMLButtonElement>("button.gesture")];
}

describe("GestureRow", () => {
	it("five gestures in name order, each with its visible name, none pressed at first", () => {
		const m = mount(GestureRow as Component, { secret: false, selected: null, beat: -1, keys: [] });
		unmount = m.unmount;
		const row = buttons(m.el);
		expect(row.map((b) => b.getAttribute("aria-label"))).toEqual(["Rock", "Paper", "Scissors", "Lizard", "Spock"]);
		expect(row.map((b) => b.querySelector(".name")?.textContent)).toEqual([
			"Rock",
			"Paper",
			"Scissors",
			"Lizard",
			"Spock",
		]);
		expect(row.filter((b) => b.getAttribute("aria-pressed") === "true")).toHaveLength(0);
	});

	it("solo: the picked gesture marks the 2 it beats and the 2 that beat it", () => {
		for (const pick of Object.values(Choice)) {
			const m = mount(GestureRow as Component, { secret: false, selected: pick, beat: -1, keys: [] });
			const rel = (r: string) =>
				buttons(m.el)
					.filter((b) => b.dataset.rel === r)
					.map((b) => b.getAttribute("aria-label"));
			const names = (cs: Choice[]) =>
				cs.map((c) => Object.keys(Choice).find((k) => Choice[k as keyof typeof Choice] === c));
			expect(rel("beats")).toEqual(names(beatenBy(pick)));
			expect(rel("loses")).toEqual(names(beaters(pick)));
			expect(m.el.querySelectorAll(".check")).toHaveLength(2);
			m.unmount();
		}
	});

	it("2 players: a pick changes nothing on the row (no pressed state, no relation, same classes)", async () => {
		const props = reactive<{ secret: boolean; selected: Choice | null; beat: number; keys: string[] }>({
			secret: true,
			selected: null,
			beat: -1,
			keys: [],
		});
		const m = mount(GestureRow as Component, props);
		unmount = m.unmount;
		const before = m.el.innerHTML;
		props.selected = Choice.Lizard;
		await nextTick();
		expect(m.el.innerHTML).toBe(before);
		expect(buttons(m.el).some((b) => b.hasAttribute("aria-pressed") || b.dataset.rel)).toBe(false);
	});

	it("emits the gesture on pointerdown, and on a keyboard click (detail 0) but not on the pointer's own click", () => {
		const picks: Choice[] = [];
		const m = mount(GestureRow as Component, {
			secret: false,
			selected: null,
			beat: -1,
			keys: [],
			onPick: (c: Choice) => picks.push(c),
		});
		unmount = m.unmount;
		const spock = buttons(m.el)[4];
		spock.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
		spock.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
		spock.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
		expect(picks).toEqual([Choice.Spock, Choice.Spock]);
	});
});
