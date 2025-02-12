// 此文件用于处理websocket连接和消息
import { WebSocketServer } from 'ws';
import { generateRandomPlayerName, generateRandomRoomNameAndCode } from './util.js';

import { sendMessage } from './message.js';

// 最大房间数
const MAX_ROOM_LENGTH = process.env.MAX_ROOM || 5;

// 断连次数
const MAX_TIMEOUT_TIMES = 30;

// 房间列表
let room_lists = [];
// 连接的客户端
let clients = [];
// 监听端口
const port = process.env.PORT || 9876;

// 客户端id
let next_client_id = 1;

const wss = new WebSocketServer({ port });
console.log(`[GameServer] Started on port ${port}, max room size is ${MAX_ROOM_LENGTH}`);

// 公布服务器状态
const boardcastServerStatus = () => {
	clients.forEach((c) => {
		sendMessage(c.ws, 'server_status', {
			rooms: room_lists.length,
			max_room: MAX_ROOM_LENGTH
		});
	});
};

wss.on('connection', (ws) => {
	let room_name = null;
	let role = null;
	let timeout_time = 0;

	// 错误打印
	ws.on('error', console.error);

	// 将这个WebSocket加入到clients中
	const player_id = next_client_id;
	clients.push({
		id: player_id,
		ws,
		in_room_name: null
	});
	console.log(`[GameServer] new client connect to server,  id = ${player_id}`);

	next_client_id += 1;

	// 发送服务器状态
	boardcastServerStatus();
	// 消息处理
	ws.on('message', (dataString) => {
		const data = JSON.parse(dataString);
		if (data == undefined) return;
		if (data.type == 'keepalive' && data.content == 'pong') {
			// console.log('receive keepalive reply');
			timeout_time -= 2;
			timeout_time = timeout_time < 0 ? 0 : timeout_time;
			// TODO: 增加处理逻辑
			return;
		} else if (data.type == 'create_room') {
			// 检查是否超过了最大房间数
			if (room_lists.length >= MAX_ROOM_LENGTH) {
				sendMessage(ws, 'create_room_reply', {
					message: 'fail',
					reason: 'room count reach max size'
				});
				return;
			}

			const { name, code } = generateRandomRoomNameAndCode(room_lists.length);
			room_name = name;
			role = 'host';

			const player_name = generateRandomPlayerName();

			room_lists.push({
				room_name,
				room_code: code,
				players: [
					{
						id: player_id,
						name: player_name,
						ready: false
					}
				]
			});

			ws.send(
				JSON.stringify({
					v: '1',
					type: 'create_room_reply',
					content: { message: 'success', player_name, room_name, room_code: code }
				})
			);

			// 告诉所有的房间服务器状态改变
			clients.forEach((client) => {
				sendMessage(client.ws, 'server_status', {
					rooms: room_lists.length,
					max_room: MAX_ROOM_LENGTH
				});
			});
			return;
		} else if (data.type == 'join_room') {
			// 检查是否有room_name和nickname
			if (!data.content?.room_code) {
				sendMessage(ws, 'join_room_reply', {
					message: 'fail',
					reason: 'miss room code'
				});
				return;
			}

			// 检查是否存在该room
			const filtered = room_lists.filter((one) => one.room_code == data.content.room_code);
			if (filtered.length != 1) {
				sendMessage(ws, 'join_room_reply', {
					message: 'fail',
					reason: 'room code not exists'
				});
				return;
			}

			// 检查是否有空位
			if (filtered[0].players.length != 1) {
				sendMessage(ws, 'join_room_reply', {
					message: 'fail',
					reason: 'room already has 2 player'
				});
				return;
			}

			// 生成昵称
			const other_player_name = filtered[0].players[0].name;
			const player_name = generateRandomPlayerName({ except: other_player_name });
			room_name = filtered[0].room_name;
			// 加入room信息
			filtered[0].players.push({
				id: player_id,
				name: player_name,
				ready: false
			});

			// 发送加入成功消息
			sendMessage(ws, 'join_room_reply', {
				message: 'success',
				room_name,
				player_name,
				other_player_name
			});

			role = 'client';
			// 向两个参与者发送请求确认消息
			const player_ids = filtered[0].players.map((p) => p.id);
			clients
				.filter((client) => player_ids.includes(client.id))
				.forEach((client) => {
					sendMessage(client.ws, 'start_request', {
						host: filtered[0].players[0].name,
						client: filtered[0].players[1].name
					});
				});
		} else if (data.type == 'start_confirm') {
			if (!(data.content?.room_name && data.content.from)) return;
			// 检查是否存在该room
			const filtered = room_lists.filter((one) => one.room_name == data.content.room_name);
			if (filtered.length != 1) return;

			const { from, confirm } = data.content;

			// 向两个参与者发送确认信息
			const player_ids = filtered[0].players.map((p) => p.id);
			clients
				.filter((client) => player_ids.includes(client.id))
				.forEach((client) => {
					sendMessage(client.ws, 'confirm_change', {
						from,
						confirm
					});
				});

			// 有人放弃则清除房间信息
			if (confirm == false) {
				room_lists = room_lists.filter((one) => one.room_name != data.content.room_name);
				boardcastServerStatus();
			}

			// 两人都准备好了则
			if (from == 'host' && confirm == true) {
				filtered[0].players[0].ready = true;
			} else if (from == 'client' && confirm == true) {
				filtered[0].players[1].ready = true;
			}

			if (filtered[0].players[0].ready && filtered[0].players[1].ready) {
				const rand = Math.random();
				// 向两个参与者发送开始比赛
				const player_ids = filtered[0].players.map((p) => p.id);
				clients
					.filter((client) => player_ids.includes(client.id))
					.forEach((client) => {
						sendMessage(client.ws, 'initial_roll', {
							initial: rand >= 0.5 ? 'host' : 'client'
						});
					});
			}
		} else if (data.type == 'select_chess') {
			// 检查是否存在该room
			const filtered = room_lists.filter((one) => one.room_name == data.content.room_name);
			if (filtered.length != 1) return;
			// 向两个参与者发送消息
			const player_ids = filtered[0].players.map((p) => p.id);
			clients
				.filter((client) => player_ids.includes(client.id))
				.forEach((client) => {
					sendMessage(client.ws, 'select_chess_broadcast', {
						color: data.content.color,
						index: data.content.index
					});
				});
		} else if (data.type == 'put_chess') {
			const filtered = room_lists.filter((one) => one.room_name == data.content.room_name);
			if (filtered.length != 1) return;
			// 向两个参与者发送消息
			const player_ids = filtered[0].players.map((p) => p.id);
			clients
				.filter((client) => player_ids.includes(client.id))
				.forEach((client) => {
					sendMessage(client.ws, 'put_chess_broadcast', {
						role: data.content.role,
						color: data.content.color,
						board_index: data.content.board_index,
						holder_index: data.content.holder_index
					});
				});
		} else if (data.type == 'win') {
			const filtered = room_lists.filter((one) => one.room_name == data.content.room_name);
			if (filtered.length != 1) return;
			// 向两个参与者发送消息
			const player_ids = filtered[0].players.map((p) => p.id);
			clients
				.filter((client) => player_ids.includes(client.id))
				.forEach((client) => {
					sendMessage(client.ws, 'win_broadcast', {
						role: data.content.role,
						color: data.content.color,
						position: data.content.position,
						chess_put_order: data.content.chess_put_order
					});
				});
		} else if (data.type == 'no_chess_put') {
			const filtered = room_lists.filter((one) => one.room_name == data.content.room_name);
			if (filtered.length != 1) return;
			// 向两个参与者发送消息
			const player_ids = filtered[0].players.map((p) => p.id);
			clients
				.filter((client) => player_ids.includes(client.id))
				.forEach((client) => {
					sendMessage(client.ws, 'draw_broadcast', {
						color: data.content.color
					});
				});
		}
	});

	const keepAliveTimer = setInterval(() => {
		// console.log('send keepalive message');
		timeout_time += 1;
		if (timeout_time > MAX_TIMEOUT_TIMES && process.env.PROD == 'true') {
			console.log(`[GameServer] Close a websocket cause TIMEOUT`);
			ws.close();
			clearInterval(keepAliveTimer);
		}
		if (process.env.PROD == 'true') {
			ws.send(JSON.stringify({ v: '1', type: 'keepalive', content: 'ping' }));
		}
	}, 1000);

	ws.on('close', () => {
		clearInterval(keepAliveTimer);
		console.log(`[GameServer] close a websocket`);
		if (room_name != null) {
			// 告诉另一个游戏者这人已经断开了
			console.log(`[GameServer] ${role} lost connecttion, send lost message to another`);
			const filtered = room_lists.filter((one) => one.room_name == room_name);
			if (filtered.length != 1) return;

			// 向另外一个人发送断开消息
			const player_ids = filtered[0].players.map((p) => p.id);
			clients
				.filter((client) => player_ids.includes(client.id))
				.forEach((client) => {
					sendMessage(client.ws, 'other_lost_connection', {
						from: role
					});
				});

			boardcastServerStatus();
			room_lists = room_lists.filter((one) => one.room_name != room_name);
			console.log(`[GameServer] room ${room_name} close`);
		}
	});
});
