<script>
	import { onMount } from 'svelte';
	import { PUBLIC_WEBSOCKET_ADDRESS } from '$env/static/public';

	import { generateRandomPlayerName } from '$lib/utils';
	import GameBoard from '../components/GameBoard.svelte';

	import Footer from '../components/Footer.svelte';
	import StartConfirmDialog from '../components/dialog/StartConfirmDialog.svelte';

	import ServerConnection from '../components/ServerConnection.svelte';
	import GameStatusBar from '../components/GameStatusBar.svelte';
	import GameRoomBar from '../components/GameRoomBar.svelte';
	import GameGuideDialog from '../components/dialog/GameGuideDialog.svelte';

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
		code: '',
		failMessage: undefined,
		yourRole: undefined,
		readyStatus: [null, null],
		turnRole: null,
		winner: null
	};

	// 服务器
	const serverStatus = {
		rooms: null,
		max_room: null
	};

	let ws = null;

	// 游戏主界面
	let gameBoard = null;
	// 确认对话框
	let confirmDialog = null;
	// 游戏指导对话框
	let gameGuideDialog = null;

	let urlCopied = false;

	// 恢复初始状态
	const resetAll = () => {
		status.inRoom = false;
		status.game = 'idle';
		players.host = '';
		players.client = '';
		room.name = '';
		room.code = '';
		room.yourRole = undefined;
		room.readyStatus = [null, null];
		confirmDialog.toggleDialog('close');
	};

	// 连接websocket
	const connect = () => {
		ws = new WebSocket(PUBLIC_WEBSOCKET_ADDRESS);

		ws.addEventListener('open', () => {
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
				// 服务器状态
			} else if (data.type == 'server_status') {
				serverStatus.rooms = data.content.rooms;
				serverStatus.max_room = data.content.max_room;
				// 创建房间回复
			} else if (data.type == 'create_room_reply') {
				if (data.content == undefined) return;
				if (data.content.message == 'success') {
					status.inRoom = true;
					room.name = data.content.room_name;
					room.code = data.content.room_code;
				} else if (data.content.message == 'fail') {
					room.failMessage = data.content.reason;
				}
				// 加入房间回复
			} else if (data.type == 'join_room_reply') {
				if (data.content == undefined) return;
				if (data.content.message == 'fail') {
					room.failMessage = data.content.reason;
					roomCode.clearRoomCode();
				} else if (data.content.message == 'success') {
					status.inRoom = true;
					room.name = data.content.room_name;
				}
				// 请求游戏开始
			} else if (data.type == 'start_request') {
				status.game = 'confirm';
				confirmDialog.toggleDialog('open');
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
			} else if (data.type == 'initial_roll') {
				confirmDialog.toggleDialog('close');
				status.game = 'started';
				room.turnRole = data.content.initial;
			} else if (data.type == 'select_chess_broadcast') {
				gameBoard.updateSelectChess(data.content);
			} else if (data.type == 'put_chess_broadcast') {
				if (data.content.role == 'host') {
					room.turnRole = 'client';
				} else {
					room.turnRole = 'host';
				}
				gameBoard.putChess(data.content);
			} else if (data.type == 'win_broadcast') {
				status.game = 'end';
				room.winner = data.content.role;
				gameBoard.win(data.content);
			}
		});
	};

	// 断开连接
	const disconnect = () => {
		if (ws == null) return;
		ws.close();
		resetAll();
	};

	// 新建房间
	const createRoom = () => {
		if (ws == null) return;
		const playerName = generateRandomPlayerName();
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'create_room',
				content: {
					nick_name: playerName
				}
			})
		);
		players.host = playerName;
		status.game = 'waitForAnother';
		room.yourRole = 'host';
	};

	// 加入房间
	const handleJoinRoom = (e) => {
		if (ws == null) return;
		players.client = generateRandomPlayerName();
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'join_room',
				content: {
					nick_name: players.client,
					room_code: e.detail.code
				}
			})
		);
		room.yourRole = 'client';
	};

	// 确认或退出游戏
	const handleConfirm = (e) => {
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'start_confirm',
				content: {
					room_name: room.name,
					from: room.yourRole,
					confirm: e.detail.confirm
				}
			})
		);
	};

	// 处理选择棋子
	const handlePickChess = (e) => {
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'select_chess',
				content: {
					room_name: room.name,
					color: e.detail.color,
					index: e.detail.index
				}
			})
		);
	};

	// 处理下棋
	const handlePutChess = (e) => {
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'put_chess',
				content: {
					role: room.yourRole,
					room_name: room.name,
					board_index: e.detail.board_index,
					color: e.detail.color,
					holder_index: e.detail.holder_index
				}
			})
		);
	};

	// 处理胜利
	const handleWin = (e) => {
		ws.send(
			JSON.stringify({
				v: '1',
				type: 'win',
				content: {
					room_name: room.name,
					color: e.detail.color,
					role: e.detail.role,
					position: e.detail.position
				}
			})
		);
	};

	const handleGameGuideOpen = () => {
		if (gameGuideDialog == null) return;
		gameGuideDialog.openDialog();
	};

	onMount(() => {
		connect();
	});
</script>

<div class="flex flex-col gap-2 min-h-screen dark:bg-slate-700 dark:text-slate-50 duration-300">
	<div class="flex flex-col md:flex-row md:gap-2 mx-2">
		<ServerConnection {status} {serverStatus} on:connect={connect} on:disconnect={disconnect} />
		<GameRoomBar
			{status}
			{room}
			{players}
			on:createRoom={createRoom}
			on:joinRoom={handleJoinRoom}
		/>
		<GameStatusBar {status} {room} {players} />
	</div>
	{#if status.game == 'started' || status.game == 'end'}
		<GameBoard
			bind:this={gameBoard}
			yourRole={room.yourRole}
			turnRole={room.turnRole}
			on:pickColorChessOnIndex={(e) => handlePickChess(e)}
			on:putColorChessOnIndex={(e) => handlePutChess(e)}
			on:win={(e) => handleWin(e)}
		/>
	{/if}
	<Footer on:gameGuideToggle={handleGameGuideOpen} />
</div>

<StartConfirmDialog
	bind:this={confirmDialog}
	playerName={players}
	hostReadyStatus={room.readyStatus[0]}
	clientReadyStatus={room.readyStatus[1]}
	on:confirm={handleConfirm}
/>

<GameGuideDialog bind:this={gameGuideDialog} />
