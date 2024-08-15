<script>
	import { onMount } from 'svelte';

	import SunIcon from '$icons/sun.svelte';
	import MoonIcon from '$icons/moon.svelte';

	let dark = false;
	$: bgColor = dark ? 'bg-slate-600' : 'bg-slate-200';
	$: title = dark ? '明亮' : '黑暗';

	const toggleDark = () => {
		if (dark) {
			document.documentElement.classList.remove('dark');
			window.localStorage.setItem('colorScheme', 'light');
		} else {
			document.documentElement.classList.add('dark');
			window.localStorage.setItem('colorScheme', 'dark');
		}
		dark = !dark;
	};

	onMount(() => {
		const colorScheme = window.localStorage.getItem('colorScheme');
		if (colorScheme == undefined) {
			window.localStorage.setItem('colorScheme', 'light');
		} else if (colorScheme == 'dark' && dark == false) {
			toggleDark();
		}
	});
</script>

<button class="inline-flex items-center {bgColor} rounded-md p-1" title={title} on:click={toggleDark}>
	{#if dark}
		<SunIcon />
	{:else}
		<MoonIcon />
	{/if}
</button>
