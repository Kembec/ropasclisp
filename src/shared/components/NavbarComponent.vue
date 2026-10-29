<script setup lang="ts"></script>
<template>
	<nav>
		<RouterLink
			to="/"
			class="wordmark"
			>Ropasclisp</RouterLink
		>
	</nav>
</template>
<style lang="postcss" scoped>
	nav {
		@apply flex w-full flex-col flex-nowrap h-[5rem] lg:h-[6.5rem];
		padding-inline: var(--kembec-margin);
	}
	nav > a {
		@apply my-auto flex min-h-[44px] items-center self-start;
	}
	.wordmark {
		font-size: var(--kembec-subtitulo);
		font-weight: var(--kembec-titular-weight);
		letter-spacing: var(--kembec-titular-tracking);
	}
</style>
