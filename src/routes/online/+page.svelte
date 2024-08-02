<script>
	import { onMount } from 'svelte';

	const status = {
		connected: false
	};

	let ws = null;

	$: statusText = status.connected ? '已连接' : '未连接';

	// 连接websocket
	const connect = () => {
		ws = new WebSocket('ws://localhost:8080');

		ws.addEventListener('open', () => {
			ws.send('I am the Client');
			status.connected = true;
		});

		ws.addEventListener('close', () => {
			ws = null;
			status.connected = false;
		});
	};

	// 断开连接
	const disconnect = () => {
		if (ws == null) return;
		ws.close();
	};

	onMount(() => {
		connect();
	});
</script>

<div>
	<span>连接状态：</span>
	<span>{statusText}</span>
	{#if status.connected}
		<button on:click={disconnect}>断开连接</button>
	{:else}
		<button on:click={connect}>重新连接</button>
	{/if}
</div>
