<script setup lang="ts">
	import type { Choice } from "../constants/ChoiceEnum";
	import { beatenBy, beaters, gestureName, GESTURES } from "../domain/rules";

	export interface Props {
		/** 2 players: a tap must not show which gesture it was, so no pressed state and no preview. */
		secret: boolean;
		selected: Choice | null;
		/** The beat being counted lights the gesture it names; -1 when not counting. */
		beat: number;
		/** Key drawn on each button (1–5 or 6–0); empty when the row has no keys. */
		keys: readonly string[];
	}
	export interface Emits {
		(event: "pick", choice: Choice): void;
	}
	const props = defineProps<Props>();
	const emit = defineEmits<Emits>();

	function relation(choice: Choice): "picked" | "beats" | "loses" | undefined {
		if (props.secret || !props.selected) {
			return undefined;
		}
		if (choice === props.selected) {
			return "picked";
		}

		return beatenBy(props.selected).includes(choice)
			? "beats"
			: beaters(props.selected).includes(choice)
				? "loses"
				: undefined;
	}

	// pointerdown, not click: two players tapping the same phone at once is multi-touch, and the second
	// touch does not always produce a click. The click that follows a pointer is skipped (detail > 0);
	// a click with detail 0 is Enter or Space on a focused button.
	function onPointer(event: PointerEvent, choice: Choice): void {
		if (event.pointerType === "mouse" && event.button !== 0) {
			return;
		}
		emit("pick", choice);
		if (props.secret) {
			(event.currentTarget as HTMLElement).blur();
		}
	}
	function onClick(event: MouseEvent, choice: Choice): void {
		if (event.detail === 0) {
			emit("pick", choice);
		}
	}
</script>
<template>
	<div
		class="row"
		role="group"
		aria-label="Gestures"
	>
		<button
			v-for="(choice, i) in GESTURES"
			:key="choice"
			type="button"
			class="gesture"
			:aria-label="gestureName(choice)"
			:aria-pressed="secret ? undefined : selected === choice"
			:data-rel="relation(choice)"
			:data-lit="beat === i ? '' : undefined"
			@pointerdown="onPointer($event, choice)"
			@click="onClick($event, choice)"
		>
			<span
				v-if="relation(choice) === 'beats'"
				class="check"
				aria-hidden="true"
				><font-awesome-icon :icon="['fas', 'check']"
			/></span>
			<font-awesome-icon
				class="icon"
				:icon="'fa-regular ' + choice"
				aria-hidden="true"
			/>
			<span
				class="name"
				aria-hidden="true"
				>{{ gestureName(choice) }}</span
			>
			<kbd
				v-if="keys[i]"
				aria-hidden="true"
				>{{ keys[i] }}</kbd
			>
		</button>
	</div>
</template>
<style lang="postcss" scoped>
	/* Five keys under the thumb, all the same width: the row is an instrument, not a menu. */
	.row {
		display: grid;
		grid-template-columns: repeat(5, minmax(48px, 1fr));
		gap: 6px;
	}
	.gesture {
		position: relative;
		display: flex;
		min-height: 64px;
		min-width: 48px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 8px 2px 10px;
		border: 1px solid var(--kembec-rule);
		background: var(--kembec-paper);
		color: var(--kembec-ink);
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition:
			background-color var(--kembec-dur-instant) linear,
			color var(--kembec-dur-instant) linear,
			opacity var(--kembec-dur-quick) linear;
	}
	/* Hover only where a pointer hovers, and only in solo: in 2 players the pressed button must not
	   differ from its neighbours, and aria-pressed is absent there. */
	@media (hover: hover) {
		.gesture[aria-pressed]:hover {
			border-color: var(--kembec-ink);
		}
	}
	.icon {
		font-size: 28px;
	}
	.name {
		font-size: var(--kembec-rotulo);
		line-height: var(--kembec-rotulo-line);
		font-weight: 600;
	}
	kbd {
		display: none;
		min-width: 22px;
		padding: 0 4px;
		border: 1px solid var(--kembec-rule);
		font-family: var(--kembec-font-code);
		font-size: 12px;
		line-height: 18px;
		color: var(--kembec-secondary);
	}
	@media (hover: hover) and (pointer: fine) {
		kbd {
			display: inline-block;
		}
	}
	/* The count names a gesture on each beat; the row underlines it in the beat's colour. The same key
	   lights in both rows, so it says nothing about anyone's pick. */
	.gesture::after {
		content: "";
		position: absolute;
		inset: auto -1px -1px;
		height: 4px;
		background: transparent;
	}
	.gesture[data-lit]::after {
		background: var(--kembec-seal);
	}
	.gesture[data-rel="picked"] {
		border-color: var(--kembec-ink);
		background: var(--kembec-ink);
		color: var(--kembec-paper);
	}
	.gesture[data-rel="picked"] kbd {
		color: var(--kembec-paper);
	}
	/* Preview of the pick: what it beats gets a check and a solid frame; what beats it is dashed,
	   struck through and dimmed. Shape and line carry it, so it reads without colour. */
	.gesture[data-rel="beats"] {
		border: 2px solid var(--kembec-ink);
	}
	.check {
		position: absolute;
		top: -10px;
		right: -6px;
		display: flex;
		height: 20px;
		width: 20px;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--kembec-paper);
		border-radius: var(--kembec-radius-circle);
		background: var(--kembec-ink);
		color: var(--kembec-paper);
		font-size: 10px;
	}
	.gesture[data-rel="loses"] {
		border-style: dashed;
		border-color: var(--kembec-secondary);
		color: var(--kembec-secondary);
	}
	.gesture[data-rel="loses"] .name {
		text-decoration: line-through;
		text-decoration-thickness: 2px;
	}
</style>
