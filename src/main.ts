import "./assets/main.css";

// Fontawesome
import { library } from "@fortawesome/fontawesome-svg-core";
import {
	faHandLizard,
	faHandPaper,
	faHandRock,
	faHandScissors,
	faHandSpock,
} from "@fortawesome/free-regular-svg-icons";
import { faCheck, faQuestion, faVolumeHigh, faVolumeXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { type Component, createApp } from "vue";

import App from "./App.vue";
import router from "./router";

const app = createApp(App as Component);
library.add(
	faHandRock,
	faHandPaper,
	faHandScissors,
	faHandLizard,
	faHandSpock,
	faCheck,
	faQuestion,
	faVolumeHigh,
	faVolumeXmark,
	faXmark
);

// Components
app.component("font-awesome-icon", FontAwesomeIcon);

// Use
app.use(router);

// Mount
app.mount("#app");
