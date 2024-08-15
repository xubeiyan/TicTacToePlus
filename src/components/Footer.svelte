<script>
    import GithubIcon from '$icons/github.svelte';
    import DarkModeSwitch from './footer/DarkModeSwitch.svelte';

	import { version } from '$app/environment';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const toggleDialog = () => {
		dispatch('gameGuideToggle')
	}
</script>

<div class="absolute w-full bottom-0">
	<fieldset class="border border-slate-400 m-2 px-2 py-1 flex justify-between">
		<div class="flex items-center">
			<span class="mr-2">Tic-Tac-Toe Plus</span>
			<a href="https://github.com/xubeiyan/TicTacToePlus" target="_blank"><GithubIcon /></a>
			<span class="ml-2">v{version}</span>
		</div>
		<div class="flex items-center gap-1">
			<button class="bg-slate-200 dark:bg-slate-600 px-2 rounded-md" on:click={toggleDialog}> 查看规则 </button>
			<DarkModeSwitch />
		</div>
	</fieldset>
</div>
