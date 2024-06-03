<script>
	export let color = 'red';
	export let size = 's';
	export let selected = false;
    export let placement = 'idle';
	export let id = 0;
	$: colorClass = color == 'red' ? 'bg-red-300 rotate-180 md:rotate-0' : 'bg-blue-300';
	$: sizeClass = size == 's' ? 'size-4 md:size-8' : size == 'm' ? 'size-8 md:size-16' : 'size-16 md:size-24';
	$: selectedClass = selected ? 'outline outline-offset-2 outline-zinc-400' : '';
    $: showClass = placement == 'idle' ? '' : 'opacity-0';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const handleClick = () => {
		dispatch('selectChess', {
			id
		});
	};
</script>


<button
	type="button"
	class="{sizeClass} {colorClass} {selectedClass} {showClass} rounded-t-[50%] cursor-pointer"
	on:click={handleClick}
></button>
