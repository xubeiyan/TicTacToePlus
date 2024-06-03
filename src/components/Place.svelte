<script>
	import Chess from './Chess.svelte';

	export let chess;
    export let id = 0;
	$: color = chess == '' ? '' : chess[0] == 'r' ? 'red' : 'blue';
	$: size = chess == '' ? '' : chess[1] == 's' ? 's' : chess[1] == 'm' ? 'm' : 'l';

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	const handleClick = () => {
		dispatch('putOnBoard', {
			id
		});
	};
</script>

<button class="size-24 md:size-32 bg-slate-200 rounded-md flex justify-center items-center" on:click={handleClick}>
	{#if chess !== ''}
		<Chess {color} {size} />
	{/if}
</button>
