<script>
	import CloseIcon from '$icons/close.svelte';

	let dialog = null;
	export const openDialog = () => {
		dialog.showModal();
	};

	const closeDialog = () => {
		dialog.close();
	};
</script>

<dialog
	bind:this={dialog}
	class="backdrop:bg-black/30 dark:backdrop:bg-slate-500/70 absolute inset-0 bg-slate-100 dark:bg-slate-700 dark:text-slate-50 w-[90%] md:w-[30em] 
			p-4 rounded-md"
>
	<button class="float-right" on:click={closeDialog}>
		<CloseIcon />
	</button>
	<h1 class="text-xl py-2">使用说明</h1>
	<p>1. 确保“连接状态”为已连接，一位玩家点击“房间”框中的“新建房间”获取房间号。</p>
	<p>2. 确保“连接状态”为已连接，另一位玩家输入上一步得到的房间号，点击“加入”。</p>
	<p>3. 双方确认后即可开始下棋。</p>
</dialog>
