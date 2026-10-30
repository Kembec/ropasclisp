<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";

	import { type GameState, matchWinner, namesOf, type Side } from "../domain/match";

	export interface Props {
		state: GameState;
	}
	export interface Emits {
		(event: "rematch"): void;
		(event: "changeMode"): void;
		(event: "rename", side: Side, name: string): void;
	}
	const props = defineProps<Props>();
	const emit = defineEmits<Emits>();

	const rematchButton = ref<HTMLButtonElement | null>(null);
	const solo = computed<boolean>(() => props.state.mode === "solo");
	const names = computed(() => namesOf(props.state));
	const winner = computed<Side>(() => matchWinner(props.state.match) ?? 1);

	const headline = computed<string>(() => {
		const [a, b] = props.state.match.score;
		if (solo.value) {
			return winner.value === 1 ? `You win ${a}–${b}` : `You lose ${a}–${b}`;
		}
		const [w, l] = winner.value === 1 ? [a, b] : [b, a];

		return `${names.value[winner.value - 1]} wins ${w}–${l}`;
	});
	const carry = computed<string>(() => {
		if (!solo.value) {
			const [s1, s2] = props.state.series.duo;

			return `${names.value[0]} ${s1} · ${names.value[1]} ${s2}`;
		}
		if (props.state.streak > 0) {
			return `${props.state.streak} in a row`;
		}

		return props.state.best > 0 ? `Streak over · best ${props.state.best}` : "";
	});

	// The end of a match is a new screen: focus goes to the next match, so Enter plays again.
	onMounted(() => rematchButton.value?.focus());

	function onName(side: Side, event: Event): void {
		emit("rename", side, (event.target as HTMLInputElement).value);
	}
</script>
<template>
	<section
		class="end"
		aria-labelledby="end-title"
		:data-outcome="solo ? (winner === 1 ? 'win' : 'lose') : 'duo'"
	>
		<h2 id="end-title">{{ headline }}</h2>
		<ol
			class="rounds"
			aria-label="Rounds"
		>
			<li
				v-for="(r, i) in state.match.rounds"
				:key="i"
				:data-winner="r.winner"
			>
				<span
					class="pair"
					aria-hidden="true"
				>
					<font-awesome-icon :icon="'fa-regular ' + r.p1" />
					<font-awesome-icon :icon="'fa-regular ' + r.p2" />
				</span>
				<span class="rule">{{ r.rule }}</span>
			</li>
		</ol>
		<p
			v-if="carry"
			class="carry"
		>
			{{ carry }}
		</p>
		<div
			v-if="!solo"
			class="names"
		>
			<label
				v-for="side in [1, 2] as Side[]"
				:key="side"
			>
				<span>Player {{ side }}</span>
				<input
					type="text"
					:value="state.duoNames[side - 1]"
					maxlength="16"
					autocomplete="off"
					@change="onName(side, $event)"
				/>
			</label>
		</div>
		<div class="actions">
			<button
				ref="rematchButton"
				type="button"
				class="primary"
				@click="emit('rematch')"
			>
				Rematch
			</button>
			<button
				type="button"
				class="secondary"
				@click="emit('changeMode')"
			>
				Change mode
			</button>
		</div>
	</section>
</template>
<style lang="postcss" scoped>
	.end {
		display: flex;
		min-height: 100dvh;
		width: 100%;
		max-width: 640px;
		margin-inline: auto;
		flex-direction: column;
		justify-content: center;
		gap: var(--kembec-space-grupo);
		padding: var(--kembec-space-grupo) var(--kembec-margin);
	}
	h2 {
		font-size: var(--kembec-display);
		line-height: var(--kembec-display-line);
		font-weight: var(--kembec-display-weight);
		letter-spacing: var(--kembec-display-tracking);
	}
	.rounds > li {
		display: flex;
		align-items: center;
		gap: var(--kembec-space-par);
		padding-block: 10px;
		border-bottom: 1px solid var(--kembec-rule);
	}
	.pair {
		display: inline-flex;
		min-width: 64px;
		gap: 8px;
		font-size: 22px;
	}
	.rounds > li[data-winner="0"] .rule {
		color: var(--kembec-secondary);
	}
	/* Each round keeps its winner in ink; the hand that lost goes quiet, as on the board. */
	.rounds > li[data-winner="1"] .pair > :last-child,
	.rounds > li[data-winner="2"] .pair > :first-child {
		color: var(--kembec-secondary);
		scale: 0.8;
	}
	.end[data-outcome="win"] h2 {
		color: var(--kembec-seal);
	}
	.carry {
		font-size: var(--kembec-subtitulo);
		line-height: var(--kembec-subtitulo-line);
		font-weight: 700;
	}
	.names {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--kembec-space-par);
	}
	.names label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: var(--kembec-rotulo);
		color: var(--kembec-secondary);
	}
	.names input {
		min-height: 44px;
		padding-inline: 10px;
		border: 1px solid var(--kembec-ink);
		background: var(--kembec-paper);
		color: var(--kembec-ink);
		font-size: var(--kembec-cuerpo);
		user-select: text;
	}
	.actions {
		display: grid;
		gap: var(--kembec-space-par);
	}
	.actions > button {
		min-height: 56px;
		font-size: var(--kembec-subtitulo-compact);
		font-weight: 700;
	}
	.primary {
		background: var(--kembec-ink);
		color: var(--kembec-paper);
	}
	.secondary {
		border: 1px solid var(--kembec-ink);
	}
</style>
