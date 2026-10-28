<script setup lang="ts">
	import { Choice } from "./Game/constants/ChoiceEnum";
</script>
<template>
	<section class="rules">
		<h1>How to play</h1>
		<p class="lead">Each gesture beats two and loses to two. Same gesture is a draw.</p>
		<!-- Rock -->
		<div class="winner">
			<div class="icon">
				<font-awesome-icon :icon="'fa-regular ' + Choice.Rock" />
			</div>
			<span class="win title">Rock</span>
		</div>
		<div class="wins-to">
			<h2>beats</h2>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Scissors" />
				</div>
				<span class="lose title">Scissors</span>
			</div>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Lizard" />
				</div>
				<span class="lose title">Lizard</span>
			</div>
		</div>
		<!-- Paper -->
		<div class="winner">
			<div class="icon">
				<font-awesome-icon :icon="'fa-regular ' + Choice.Paper" />
			</div>
			<span class="win title">Paper</span>
		</div>
		<div class="wins-to">
			<h2>beats</h2>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Rock" />
				</div>
				<span class="lose title">Rock</span>
			</div>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Spock" />
				</div>
				<span class="lose title">Spock</span>
			</div>
		</div>
		<!-- Scissors -->
		<div class="winner">
			<div class="icon">
				<font-awesome-icon :icon="'fa-regular ' + Choice.Scissors" />
			</div>
			<span class="win title">Scissors</span>
		</div>
		<div class="wins-to">
			<h2>beats</h2>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Paper" />
				</div>
				<span class="lose title">Paper</span>
			</div>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Lizard" />
				</div>
				<span class="lose title">Lizard</span>
			</div>
		</div>
		<!-- Spock -->
		<div class="winner">
			<div class="icon">
				<font-awesome-icon :icon="'fa-regular ' + Choice.Spock" />
			</div>
			<span class="win title">Spock</span>
		</div>
		<div class="wins-to">
			<h2>beats</h2>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Rock" />
				</div>
				<span class="lose title">Rock</span>
			</div>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Scissors" />
				</div>
				<span class="lose title">Scissors</span>
			</div>
		</div>
		<!-- Lizard -->
		<div class="winner">
			<div class="icon">
				<font-awesome-icon :icon="'fa-regular ' + Choice.Lizard" />
			</div>
			<span class="win title">Lizard</span>
		</div>
		<div class="wins-to">
			<h2>beats</h2>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Paper" />
				</div>
				<span class="lose title">Paper</span>
			</div>
			<div>
				<div class="icon">
					<font-awesome-icon :icon="'fa-regular ' + Choice.Spock" />
				</div>
				<span class="lose title">Spock</span>
			</div>
		</div>
		<RouterLink
			class="play-game"
			to="/"
		>
			Play Game
		</RouterLink>
	</section>
</template>
<style lang="postcss" scoped>
	.rules {
		@apply grid w-full grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center pb-12;
		padding-inline: var(--kembec-margin);
		padding-top: var(--kembec-space-grupo);
	}
	h1 {
		@apply col-span-full;
		font-size: var(--kembec-titular);
		line-height: var(--kembec-titular-line);
		font-weight: var(--kembec-titular-weight);
		letter-spacing: var(--kembec-titular-tracking);
	}
	.lead {
		@apply col-span-full text-secondary;
		font-size: var(--kembec-entradilla);
		line-height: var(--kembec-entradilla-line);
		margin: var(--kembec-space-par) 0 var(--kembec-space-bloque);
	}
	.winner,
	.wins-to {
		@apply flex h-full items-center gap-4 border-t border-rule py-5;
	}
	.winner .icon {
		font-size: clamp(36px, 6vw, 64px);
	}
	.winner .title {
		font-size: var(--kembec-subtitulo);
		font-weight: var(--kembec-subtitulo-weight);
	}
	.wins-to {
		@apply flex-wrap gap-x-8;
	}
	.wins-to > h2 {
		@apply text-secondary;
		font-family: var(--kembec-font-code);
		font-size: var(--kembec-rotulo);
		letter-spacing: var(--kembec-rotulo-tracking);
		text-transform: uppercase;
	}
	.wins-to > div {
		@apply flex items-center gap-3;
	}
	.wins-to .icon {
		font-size: clamp(24px, 3vw, 36px);
	}
	.wins-to .title {
		font-size: var(--kembec-apoyo);
	}
	.play-game {
		@apply col-span-full mt-10 flex min-h-[56px] items-center justify-center bg-ink px-8 font-bold text-paper transition-colors hover:bg-secondary sm:justify-self-start;
	}
</style>
