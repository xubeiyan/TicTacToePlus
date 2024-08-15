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

	$: boardBgColor = self ? 'bg-cyan-50 dark:bg-gray-600' : 'bg-slate-200/50';
	$: leftStyle = self ? 'self-end md:self-center' : 'self-start md:self-center';
	$: activeBoardStyle = yourTurn ? 'animate-background bg-[length:_400%_400%] bg-gradient-to-r from-blue-500 via-green-500 to-sky-500' : '';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// 选择棋子
	const pickChess = (index) => {
		dispatch('pickChess', {
			index
		});
	};
</script>

<div
	class="{leftStyle} {activeBoardStyle} p-0.5 rounded-md"
>
	<div class="{boardBgColor} md:p-8 rounded-md grid grid-cols-3 grid-rows-3 relative">
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
	</div>
</div>
