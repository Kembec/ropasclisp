import { type Component } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import GamePage from "../pages/GamePage.vue";

// The board is the only page: /help opens the rules over it, and any other path lands on the board.
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: "/:sheet(help)?", name: "game", component: GamePage as Component },
		{ path: "/:any(.*)*", redirect: "/" },
	],
});

export default router;
