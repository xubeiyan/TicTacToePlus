<script>
	import { onMount } from 'svelte';

	let dark = false;
	$: text = dark ? 'dark' : 'light';

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

<label>
	<input type="checkbox" on:change={toggleDark} />
	<span>{text}</span>
</label>
