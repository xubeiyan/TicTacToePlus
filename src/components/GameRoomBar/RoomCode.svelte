<script>
	let inputArray = [null, null, null, null];

	let inputValue = [null, null, null, null];

	$: inputValueInvalid = inputValue.includes(null) || inputValue.includes('');

	// 键入数字时会自动跳转到下一个输入框，删除时跳到前一个输入框
	const handleValueChange = (data, index) => {
		// 为空表明是删除了，跳到上一个输入框
		if (data == null) {
			if (index == 0) return;
			inputArray[index - 1].focus();
		} else {
			if (index == inputArray.length - 1) return;
			inputArray[index + 1].focus();
		}
	};

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const joinRoom = () => {
		dispatch('joinRoom', {
			code: inputValue.join('')
		});
	};

	export function clearRoomCode() {
		inputValue = [null, null, null, null];
	}
</script>

<div class="inline-flex gap-1">
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-800"
		maxlength="1"
		type="text"
		inputmode="numeric"
		bind:this={inputArray[0]}
		bind:value={inputValue[0]}
		on:input={(e) => handleValueChange(e.data, 0)}
	/>
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-800"
		maxlength="1"
		type="text"
		inputmode="numeric"
		bind:this={inputArray[1]}
		bind:value={inputValue[1]}
		on:input={(e) => handleValueChange(e.data, 1)}
	/>
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-800"
		maxlength="1"
		type="text"
		inputmode="numeric"
		bind:this={inputArray[2]}
		bind:value={inputValue[2]}
		on:input={(e) => handleValueChange(e.data, 2)}
	/>
	<input
		class="px-1 w-[1.25em] rounded-md border border-slate-400 dark:bg-slate-800"
		maxlength="1"
		type="text"
		inputmode="numeric"
		bind:this={inputArray[3]}
		bind:value={inputValue[3]}
		on:input={(e) => handleValueChange(e.data, 3)}
	/>
	{#if !inputValueInvalid}
		<button class="bg-slate-200 dark:bg-slate-600 rounded-md px-2" on:click={joinRoom}>加入</button>
	{/if}
</div>
