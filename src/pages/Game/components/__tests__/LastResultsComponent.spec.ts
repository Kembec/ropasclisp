import { describe, expect, it } from "vitest";
import { computed, createApp, defineComponent, h, nextTick, ref } from "vue";

import type Result from "../../interfaces/ResultInterface";
import LastResults from "../LastResultsComponent.vue";

function round(n: number): Result {
	return { p1: `P1-${n}`, choice1: "fa-hand", p2: `P2-${n}`, choice2: "fa-hand", message: `round ${n}` };
}

// Mirrors GamePage: the history lives in localStorage and is re-read on changeResult.
function mountWithParent() {
	localStorage.result = JSON.stringify([]);
	const stored = ref<string>(localStorage.result);
	const results = computed<Result[]>(() => JSON.parse(stored.value));
	const Parent = defineComponent({
		setup() {
			return () =>
				h(LastResults, {
					lastResults: results.value,
					onChangeResult: () => (stored.value = localStorage.result),
				});
		},
	});
	const el = document.createElement("div");
	document.body.appendChild(el);
	const app = createApp(Parent);
	app.component("font-awesome-icon", { render: () => h("i") });
	app.mount(el);

	return {
		el,
		results,
		async play(n: number) {
			const list = JSON.parse(localStorage.result);
			list.push(round(n));
			localStorage.result = JSON.stringify(list);
			stored.value = localStorage.result;
			await nextTick();
		},
	};
}

describe("LastResultsComponent", () => {
	it("shows every new round, newest first, without mutating the prop", async () => {
		const { el, results, play } = mountWithParent();
		await play(1);
		await play(2);
		await play(3);

		const rows = el.querySelectorAll(".result");
		expect(rows.length).toBe(3);
		expect(rows[0].querySelector(".message")?.textContent).toBe("round 3");
		expect(results.value.map((r) => r.message)).toEqual(["round 1", "round 2", "round 3"]);
	});

	it("shows zero rows after Clear last results", async () => {
		const { el, play } = mountWithParent();
		await play(1);
		await play(2);
		await play(3);

		(el.querySelector("#clear-last-results") as HTMLButtonElement).click();
		await nextTick();

		expect(el.querySelectorAll(".result").length).toBe(0);
	});
});
