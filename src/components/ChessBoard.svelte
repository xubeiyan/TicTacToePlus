<!-- 棋盘 -->
<script>
	import Chess from './Chess.svelte';

	export let board = ['', '', '', '', '', '', '', '', ''];
	export let winText = null;

	const getSize = (str) => {
		if (str.length != 2) return '';
		return str[1];
	};

	const getColor = (str) => {
		if (str.length != 2) return '';
		return str[0] == 'r' ? 'red' : str[0] == 'b' ? 'blue' : '';
	};

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// 放置棋子
	const putChess = (index) => {
		dispatch('putChess', {
			index
		});
	};
</script>

<div class="relative">
	<div class="grid grid-cols-3 grid-rows-3 gap-2">
		{#each board as one, index}
			<button
				class="size-[5em] bg-slate-200 p-1 flex justify-center items-center"
				on:click={() => putChess(index)}
			>
				<Chess size={getSize(one)} color={getColor(one)} />
			</button>
		{/each}
	</div>
	{#if winText != null}
		<div class="absolute inset-0 flex justify-center items-center z-10 bg-slate-200/50">
			<span>{winText}</span>
		</div>
	{/if}
</div>
