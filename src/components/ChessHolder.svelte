<!-- 放置棋子的盘 -->
<script>
	import Chess from './Chess.svelte';

	export let self = false;
	export let yourTurn = false;
	export let cellSize = '12';
	export let selectChess = {
		color: null,
		index: null
	};
	export let color = 'red';
	export let chess = ['s', 'm', 'l', 's', 'm', 'l', 's', 'm', 'l'];

	$: boardBgColor = self ? 'bg-cyan-50' : 'bg-slate-200/50';
	$: leftStyle = self ? 'self-end md:self-center' : 'self-start md:self-center';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// 选择棋子
	const pickChess = (index) => {
		dispatch('pickChess', {
			index
		});
	};
</script>

<div class="{boardBgColor} {leftStyle} p-1 md:p-8 rounded-md grid grid-cols-3 grid-rows-3 relative">
	{#each chess as one, index}
		<button
			class="size-{cellSize} flex p-1 justify-center items-center {selectChess.color == color &&
			index == selectChess.index
				? 'outline outline-green-400 rounded-md'
				: ''}"
			on:click={() => pickChess(index)}
		>
			<Chess {color} size={one} />
		</button>
	{/each}
	{#if yourTurn}
		<div class="absolute dark:text-slate-800 bottom-1 left-[50%] translate-x-[-50%]">该你了</div>
	{/if}
</div>
