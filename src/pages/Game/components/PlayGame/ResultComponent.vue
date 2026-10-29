<script setup lang="ts">
	import { computed, onMounted, ref } from "vue";

	import { gestureName } from "../../classes/GameClass";
	import type { Choice } from "../../constants/ChoiceEnum";
	import type { RoundOutcome } from "../../interfaces/ResultInterface";

	export interface Props {
		outcome: RoundOutcome;
		p1Name: string;
		p2Name: string;
		p1Choice: Choice;
		p2Choice: Choice;
		solo: boolean;
	}
	export interface Emits {
		(event: "close"): void;
	}
	const props = defineProps<Props>();
	const emit = defineEmits<Emits>();

	const dialog = ref<HTMLDialogElement | null>(null);

	// In one-player mode the person is player 1, so the verdict speaks to them.
	const headline = computed<string>(() => {
		const { winner } = props.outcome;
		if (winner === 0) {
			return "Draw";
		}
		if (props.solo) {
			return winner === 1 ? "You win" : "You lose";
		}

		return `${winner === 1 ? props.p1Name : props.p2Name} wins`;
	});
	const sideClass = (side: 1 | 2): string | undefined => {
		const { winner } = props.outcome;
		if (winner === 0) {
			return undefined;
		}

		return winner === side ? "won" : "lost";
	};

	// showModal makes the rest of the page inert, so Enter cannot reach the play button underneath.
	onMounted(() => {
		dialog.value?.showModal();
	});

	function close(): void {
		dialog.value?.close();
	}
	// The dialog fills the viewport; a click on it outside the content band is a click on the backdrop.
	function onClick(event: MouseEvent): void {
		if (event.target === dialog.value) {
			close();
		}
	}
</script>
<template>
	<dialog
		id="result"
		ref="dialog"
		aria-labelledby="result-title"
		aria-describedby="result-rule"
		@click="onClick"
		@close="emit('close')"
	>
		<div class="content">
			<h2 id="result-title">{{ headline }}</h2>
			<p
				id="result-rule"
				class="rule"
			>
				{{ outcome.rule }}
			</p>
			<div class="clash">
				<figure :class="sideClass(1)">
					<font-awesome-icon :icon="'fa-regular ' + p1Choice" />
					<figcaption>
						<span class="who">{{ p1Name }}</span>
						<span class="what">{{ gestureName(p1Choice) }}</span>
					</figcaption>
				</figure>
				<span
					class="vs"
					aria-hidden="true"
					>vs</span
				>
				<figure :class="sideClass(2)">
					<font-awesome-icon :icon="'fa-regular ' + p2Choice" />
					<figcaption>
						<span class="who">{{ p2Name }}</span>
						<span class="what">{{ gestureName(p2Choice) }}</span>
					</figcaption>
				</figure>
			</div>
			<button
				type="button"
				class="next"
				autofocus
				@click="close"
			>
				Next round
			</button>
		</div>
	</dialog>
</template>
<style lang="postcss" scoped>
	dialog {
		@apply fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-paper p-0 text-ink;
		height: 100dvh;
	}
	dialog::backdrop {
		background: transparent;
	}
	.content {
		@apply absolute inset-x-0 top-1/2 mx-auto flex w-full max-w-3xl -translate-y-1/2 flex-col border-y border-ink py-8 lg:py-10;
		gap: var(--kembec-space-bloque, 32px);
		padding-inline: var(--kembec-margin);
	}
	h2 {
		font-size: var(--kembec-titular);
		line-height: var(--kembec-titular-line);
		font-weight: var(--kembec-titular-weight);
		letter-spacing: var(--kembec-titular-tracking);
	}
	.rule {
		@apply -mt-4;
		font-size: var(--kembec-subtitulo);
		line-height: var(--kembec-subtitulo-line);
		font-weight: var(--kembec-subtitulo-weight);
		letter-spacing: var(--kembec-subtitulo-tracking);
	}
	.clash {
		@apply grid items-end border-t border-rule pt-6;
		grid-template-columns: 1fr auto 1fr;
		column-gap: 16px;
	}
	figure {
		@apply flex min-w-0 flex-col items-center gap-3 border-b-2 border-transparent pb-3;
	}
	figure > svg {
		font-size: clamp(56px, 12vw, 120px);
	}
	figure.won {
		@apply border-ink;
	}
	figure.lost {
		@apply text-secondary;
	}
	figcaption {
		@apply flex min-w-0 max-w-full flex-col items-center text-center;
	}
	.who {
		@apply max-w-full truncate;
		font-family: var(--kembec-font-code);
		font-size: var(--kembec-rotulo);
		line-height: var(--kembec-rotulo-line);
		letter-spacing: var(--kembec-rotulo-tracking);
		text-transform: uppercase;
	}
	.what {
		font-weight: 700;
	}
	.vs {
		@apply self-center text-secondary;
		font-family: var(--kembec-font-code);
		font-size: var(--kembec-dato);
		letter-spacing: var(--kembec-rotulo-tracking);
	}
	.next {
		@apply flex min-h-[56px] w-full items-center justify-center bg-ink px-6 text-paper transition-colors hover:bg-secondary sm:w-auto sm:self-start sm:px-10;
		font-size: var(--kembec-subtitulo-compact);
		line-height: var(--kembec-subtitulo-compact-line);
		font-weight: 700;
	}
	.next:focus-visible {
		outline: 2px solid var(--kembec-focus);
		outline-offset: 3px;
	}
</style>
