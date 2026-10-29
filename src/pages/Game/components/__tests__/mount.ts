import { type Component, createApp, h } from "vue";

export interface Mounted {
	el: HTMLElement;
	unmount: () => void;
}

/** Mounts a component in jsdom with the icon component stubbed; returns the host and an unmount. */
export function mount(component: Component, props: Record<string, unknown> = {}): Mounted {
	const el = document.createElement("div");
	document.body.appendChild(el);
	const app = createApp({ render: () => h(component, props) });
	app.component("font-awesome-icon", { props: ["icon"], render: () => h("i") });
	app.mount(el);

	return {
		el,
		unmount: () => {
			app.unmount();
			el.remove();
		},
	};
}
