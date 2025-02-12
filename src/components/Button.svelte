<script>
	export let type = 'info';

	$: bgStyle =
		type == 'primary'
			? 'bg-blue-200/80 dark:bg-blue-500/80 hover:bg-blue-200 dark:hover:bg-blue-500'
			: 'bg-slate-200/80 dark:bg-slate-500/80 hover:bg-slate-200 dark:hover:bg-slate-500';
</script>

<button class="{bgStyle} dark:text-slate-100 rounded-md px-2 py-0.5" on:click>
	<slot />
</button>
