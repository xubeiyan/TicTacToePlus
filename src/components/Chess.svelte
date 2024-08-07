<script>
	export let color = 'red';
	export let size = 's';

	$: colorStyle = color == 'red' ? 'bg-red-300' : color == 'blue' ? 'bg-blue-300' : '';
    $: sizeStyle = size == 's' ? 'size-8' : size == 'm' ? 'size-10' : size == 'l' ? 'size-14' : 'bg-transparent size-14';
</script>

<div class="{sizeStyle} {colorStyle} rounded-t-[50%]"></div>
