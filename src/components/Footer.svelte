<script>
	import GithubIcon from '$icons/github.svelte';
	import DarkModeSwitch from './footer/DarkModeSwitch.svelte';

	import { version } from '$app/environment';

	import { createEventDispatcher } from 'svelte';
	import Button from './Button.svelte';
	const dispatch = createEventDispatcher();

	const toggleDialog = () => {
		dispatch('gameGuideToggle');
	};
</script>

<div class="w-full">
	<fieldset class="border border-slate-400 m-2 px-2 py-1 flex justify-between">
		<div class="flex items-center">
			<span class="mr-1">Tic-Tac-Toe Plus</span>
			<span class="mr-2">v{version}</span>
			<a href="https://github.com/xubeiyan/TicTacToePlus" target="_blank"><GithubIcon /></a>
		</div>
		<div class="flex items-center gap-1">
			<Button on:click={toggleDialog}>使用说明</Button>
			<DarkModeSwitch />
		</div>
	</fieldset>
</div>
