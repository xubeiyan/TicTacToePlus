<script>
	import { onMount } from 'svelte';
	import { PUBLIC_WEBSOCKET_ADDRESS } from '$env/static/public';

	import { generateRandomPlayerName, generateRandomRoomName } from '$lib/utils';

	// 状态
	const status = {
		connected: false,
		inRoom: false,
		game: 'idle'
	};

	// 玩家
	const players = {
		host: '',
		client: ''
	};

	// 房间
	const room = {
		name: '',
		failMessage: undefined,
		yourRole: undefined,
		readyStatus: [null, null]
	};

	// 确认对话框
	const confirmDialog = {
		open: false
	};

	let ws = null;

	$: statusText = status.connected ? '已连接' : '未连接';

	// 恢复初始状态
	const resetAll = () => {
		status.inRoom = false;
		status.game = 'idle';
		players.host = '';
		players.client = '';
		room.name = '';
		room.yourRole = undefined;
		room.readyStatus = [null, null];
		confirmDialog.open = false;
	};

	// 连接websocket
	const connect = () => {
		ws = new WebSocket(PUBLIC_WEBSOCKET_ADDRESS);

		ws.addEventListener('open', () => {
			ws.send(JSON.stringify({ v: '1', type: 'login', content: '12345678' }));
			status.connected = true;
		});

		ws.addEventListener('close', () => {
			ws = null;
			status.connected = false;
		});

		ws.addEventListener('message', (msg) => {
			const dataStr = msg.data;
			const data = JSON.parse(dataStr);
			if (data == undefined) return;
			// 如果是keepalive消息。回复pong的消息
			if (data.type == 'keepalive' && data.content == 'ping') {
				ws.send(JSON.stringify({ v: '1', type: 'keepalive', content: 'pong' }));
				return;
				// 创建房间回复
			} else if (data.type == 'create_room_reply') {
				if (data.content == undefined) return;
				if (data.content.message == 'success') {
					status.inRoom = true;
				} else if (data.content.message == 'fail') {
					room.failMessage = data.content.reason;
				}
				// 加入房间回复
			} else if (data.type == 'join_room_reply') {
				if (data.content == undefined) return;
				if (data.content.message == 'fail') {
					room.failMessage = data.content.reason;
				} else if (data.content.message == 'success') {
					status.inRoom = true;
				}
				// 请求游戏开始
			} else if (data.type == 'start_request') {
				status.game = 'confirm';
				confirmDialog.open = true;
				players.host = data.content.host;
				players.client = data.content.client;
				// 开始消息
			} else if (data.type == 'confirm_change') {
				if (data.content == undefined) return;

				// 有人点了放弃
				if (data.content.confirm == false) {
					resetAll();
					return;
				}

				if (data.content.from == 'host') {
					room.readyStatus[0] = data.content.confirm;
				} else if (data.content.from == 'client') {
					room.readyStatus[1] = data.content.confirm;
				}

				if (room.readyStatus[0] && room.readyStatus[1]) {
					confirmDialog.open = false;
					status.game = 'started';
				}
			}
		});
	};

	// 断开连接
	const disconnect = () => {
		if (ws == null) return;
		ws.close();
	};

	// 新建房间
	const createRoom = () => {
		if (ws == null) return;
		const roomName = generateRandomRoomName();
		const playerName = generateRandomPlayerName();
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'create_room',
				content: {
					nick_name: playerName,
					room_name: roomName
				}
			})
		);
		players.host = playerName;
		status.game = 'waitForAnother';
		room.name = roomName;
		room.yourRole = 'host';
	};

	// 加入房间
	const joinRoom = () => {
		if (ws == null) return;
		players.client = generateRandomPlayerName();
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'join_room',
				content: {
					nick_name: players.client,
					room_name: room.name
				}
			})
		);
		room.yourRole = 'client';
	};

	// 确认或退出游戏
	const confirm = (msg) => {
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'start_confirm',
				content: {
					room_name: room.name,
					from: room.yourRole,
					confirm: msg == 'ready' ? true : false
				}
			})
		);
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
	{#if status.game == 'idle'}
		<button
			class="border border-neutral-600 rounded-md disabled:text-neutral-100"
			on:click={createRoom}
			disabled={status.inRoom}>新建房间</button
		>
		<form>
			<input class="border rounded-md" placeholder="输入要加入的房间名称" bind:value={room.name} />
			<button
				class="border border-neutral-600 rounded-md disabled:text-neutral-100"
				disabled={status.inRoom || room.name == ''}
				on:click={joinRoom}>加入房间</button
			>
		</form>
	{/if}
	{#if status.inRoom}
		<span>在房间：{room.name} 中</span>
	{/if}
	<p>
		游戏状态:

		{#if status.game == 'idle'}
			<span>空闲中</span>
		{:else if status.game == 'waitForAnother'}
			<span>等待另一玩家加入</span>
		{:else if status.game == 'confirm'}
			<span>开始确认</span>
			<span class={room.yourRole == 'host' ? 'font-bold' : ''}>房主：{players.host}</span>
			<span class={room.yourRole == 'client' ? 'font-bold' : ''}>参加者：{players.client}</span>
		{:else if status.game == 'started'}
			<span>游戏开始</span>
		{/if}
	</p>
	<dialog
		open={confirmDialog.open}
		class="border border-slate-700 bg-slate-100 px-10 py-8 rounded-lg relative"
	>
		<div class="mb-2">
			<span>点击“我准备好了”，以开始游戏</span>
		</div>
		<div class="mb-6">
			<p>{players.host} {room.readyStatus[0] ? '√' : ''}</p>
			<p>{players.client} {room.readyStatus[1] ? '√' : ''}</p>
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
</div>
