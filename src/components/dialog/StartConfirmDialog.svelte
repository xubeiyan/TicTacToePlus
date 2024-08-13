<script>
	let open = false;
	export const toggleDialog = (operation) => {
		if (operation == 'open' || operation == 'close') {
			open = operation == 'open';
			return;
		}

		open = false;
	};

	export let playerName = {
		host: '未知',
		client: '未知'
	};

	export let hostReadyStatus = false;

    export let clientReadyStatus = false;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const confirm = (msg) => {
		dispatch('confirm', {
			confirm: msg == 'ready'
		});
	};
</script>

<dialog
	{open}
	class="border border-slate-700 bg-slate-100 dark:bg-slate-600  px-6 py-4 rounded-lg absolute top-[50%] translate-y-[-50%]"
>
	<div class="mb-2 dark:text-slate-50 text-lg">
		<span>点击“我准备好了”，以开始游戏</span>
	</div>
	<div class="mb-8 dark:text-slate-50">
		<p>{playerName.host} {hostReadyStatus ? '√' : ''}</p>
		<p>{playerName.client} {clientReadyStatus ? '√' : ''}</p>
	</div>
	<div class="absolute bottom-2 right-2">
		<button class="border bg-slate-300 rounded-md py-1 px-3" on:click={() => confirm('ready')}
			>我准备好了</button
		>
		<button class="border bg-slate-300 rounded-md py-1 px-3" on:click={() => confirm('')}
			>放弃</button
		>
	</div>
</dialog>
