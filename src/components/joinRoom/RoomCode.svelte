<script>
	export let inRoom = true;
	let one;
	let two;
	let three;
	let four;

	let inputValue = [null, null, null, null];

	$: inputValueInvalid = inputValue.includes(null);


	// 键入数字时会自动跳转到下一个输入框
	const focusToNext = (next) => {
		if (next == 'two') {
			two.focus();
		} else if (next == 'three') {
			three.focus();
		} else if (next == 'four') {
			four.focus();
		}
	};

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const joinRoom = () => {
		dispatch('joinRoom', {
			code: inputValue.join('')
		});
	};

    export const clearRoomCode = () => {
        inputValue = ['', '', '', ''];
    }
</script>

<div class="inline-flex gap-1">
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-600"
		maxlength="1"
		type="text"
        inputmode="numeric"
		bind:this={one}
		bind:value={inputValue[0]}
		on:input={() => focusToNext('two')}
	/>
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-600"
		maxlength="1"
		type="text"
        inputmode="numeric"
		bind:this={two}
		bind:value={inputValue[1]}
		on:input={() => focusToNext('three')}
	/>
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-600"
		maxlength="1"
		type="text"
        inputmode="numeric"
		bind:this={three}
		bind:value={inputValue[2]}
		on:input={() => focusToNext('four')}
	/>
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-600"
		maxlength="1"
		type="text"
        inputmode="numeric"
		bind:this={four}
		bind:value={inputValue[3]}
	/>
	<button
		class="border border-slate-400 disabled:border-slate-100 disabled:dark:border-slate-600 rounded-md disabled:text-slate-100 dark:disabled:text-slate-600 px-2"
		disabled={inRoom || inputValueInvalid}
		on:click={joinRoom}>加入</button
	>
</div>
