<script>
	export let color = 'red';
	export let size = 's';

	$: colorStyle = color == 'red' ? 'bg-red-300' : color == 'blue' ? 'bg-blue-300' : '';
    $: sizeStyle = size == 's' ? 'size-4 md:size-8' : size == 'm' ? 'size-6 md:size-10' : size == 'l' ? 'size-10 md:size-14' : 'bg-transparent size-10 md:size-14';
</script>

<div class="{sizeStyle} {colorStyle} rounded-t-[50%]"></div>
