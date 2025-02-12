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
	import Button from '../Button.svelte';
	const dispatch = createEventDispatcher();

	const confirm = (msg) => {
		dispatch('confirm', {
			confirm: msg == 'ready'
		});
	};
</script>

<dialog
	{open}
	class="bg-slate-100 dark:bg-slate-600 px-6 py-4 rounded-lg absolute top-[50%] translate-y-[-50%]"
>
	<div class="mb-2 dark:text-slate-50 text-lg">
		<span>点击“我准备好了”，以开始游戏</span>
	</div>
	<div class="mb-2 dark:text-slate-50">
		<p>{playerName.host} {hostReadyStatus ? '√' : ''}</p>
		<p>{playerName.client} {clientReadyStatus ? '√' : ''}</p>
	</div>
	<div class="flex justify-end gap-2">
		<Button type="primary" on:click={() => confirm('ready')}>我准备好了</Button>
		<Button on:click={() => confirm('')}>放弃</Button>
	</div>
</dialog>
