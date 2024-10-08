// 此文件用于处理websocket连接和消息
import { WebSocketServer } from "ws";
import { generateRandomRoomNameAndCode } from "./util.js";

// 最大房间数
const MAX_ROOM_LENGTH = process.env.MAX_ROOM || 5;

// 断连次数
const MAX_TIMEOUT_TIMES = 30;

// 房间列表
let room_lists = [];
// 监听端口
const port = process.env.PORT || 9876;

const wss = new WebSocketServer({ port });
console.log(`[GameServer] Started on port ${port}, max room size is ${MAX_ROOM_LENGTH}`);

wss.on('connection', (ws) => {
  let room_name = null;
  let role = null;
  let timeout_time = 0;
  ws.on('error', console.error);

  ws.send(JSON.stringify({
    v: "1", type: "server_status", content: {
      rooms: room_lists.length,
      max_room: MAX_ROOM_LENGTH,
    }
  }));

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
      // 检查是否有nickname
      if (!(data.content?.nick_name)) {
        ws.send(JSON.stringify({
          v: "1", type: "create_room_reply", content: {
            message: "fail", reason: "miss nick name"
          }
        }));
        return;
      }

      // 检查是否超过了最大房间数
      if (room_lists.length >= MAX_ROOM_LENGTH) {
        ws.send(JSON.stringify({
          v: "1", type: "create_room_reply", content: {
            message: "fail", reason: "room count reach max size"
          }
        }));
        return;
      }

      const { name, code } = generateRandomRoomNameAndCode(room_lists.length);
      room_name = name;
      role = 'host';

      room_lists.push({
        room_name,
        room_code: code,
        players: [{
          name: data.content.nick_name,
          ready: false,
        }],
        ws: [ws],
      });

      ws.send(JSON.stringify({ v: "1", type: "create_room_reply", content: { message: "success", room_name, room_code: code } }));
      ws.send(JSON.stringify({
        v: "1", type: "server_status", content: {
          rooms: room_lists.length,
          max_room: MAX_ROOM_LENGTH,
        }
      }));
      return;
    } else if (data.type == 'join_room') {
      // 检查是否有room_name和nickname
      if (!(data.content?.room_code && data.content?.nick_name)) {
        ws.send(JSON.stringify({
          v: "1", type: "join_room_reply", content: {
            message: "fail", reason: "miss room code or nick name"
          }
        }));
        return;
      }

      // 检查是否存在该room

      const filtered = room_lists.filter(one => one.room_code == data.content.room_code);
      if (filtered.length != 1) {
        ws.send(JSON.stringify({
          v: "1", type: "join_room_reply", content: {
            message: "fail", reason: "room code not exists"
          }
        }));
        return;
      }

      // 检查是否有空位
      if (filtered[0].players.length != 1) {
        ws.send(JSON.stringify({
          v: "1", type: "join_room_reply", content: {
            message: "fail", reason: "room already has 2 player"
          }
        }));
        return;
      }

      filtered[0].players.push({
        name: data.content.nick_name,
        ready: false,
      });
      filtered[0].ws.push(ws);
      ws.send(JSON.stringify({
        v: "1", type: "join_room_reply", content: {
          message: "success",
          room_name: filtered[0].room_name,
        }
      }));
      ws.send(JSON.stringify({
        v: "1", type: "server_status", content: {
          rooms: room_lists.length,
          max_room: MAX_ROOM_LENGTH,
        }
      }));

      room_name = filtered[0].room_name;
      role = 'client';
      // 向两个参与者发送请求确认消息
      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: "1", type: "start_request", content: {
            host: filtered[0].players[0].name,
            client: filtered[0].players[1].name
          }
        }));
      })
    } else if (data.type == 'start_confirm') {
      if (!(data.content?.room_name && data.content.from)) return;
      // 检查是否存在该room
      const filtered = room_lists.filter(one => one.room_name == data.content.room_name);
      if (filtered.length != 1) return;

      const { from, confirm } = data.content;

      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: "1", type: "confirm_change", content: {
            from,
            confirm,
          }
        }));
      });

      // 有人放弃则清除房间信息
      if (confirm == false) {
        room_lists = room_lists.filter(one => one.room_name != data.content.room_name);
      }

      // 两人都准备好了则
      if (from == 'host') {
        filtered[0].players[0].ready = true;
      } else if (from == 'client') {
        filtered[0].players[1].ready = true;
      }

      if (filtered[0].players[0].ready && filtered[0].players[1].ready) {
        const rand = Math.random();
        filtered[0].ws.forEach(socket => {
          socket.send(JSON.stringify({
            v: "1", type: "initial_roll", content: {
              initial: rand >= .5 ? 'host' : 'client',
            }
          }));
        })
      }
    } else if (data.type == 'select_chess') {
      // 检查是否存在该room
      const filtered = room_lists.filter(one => one.room_name == data.content.room_name);
      if (filtered.length != 1) return;
      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: "1", type: "select_chess_broadcast", content: {
            color: data.content.color,
            index: data.content.index,
          }
        }));
      })
    } else if (data.type == 'put_chess') {
      const filtered = room_lists.filter(one => one.room_name == data.content.room_name);
      if (filtered.length != 1) return;
      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: "1", type: "put_chess_broadcast", content: {
            role: data.content.role,
            color: data.content.color,
            board_index: data.content.board_index,
            holder_index: data.content.holder_index,
          }
        }));
      })
    } else if (data.type == 'win') {
      const filtered = room_lists.filter(one => one.room_name == data.content.room_name);
      if (filtered.length != 1) return;
      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: "1", type: "win_broadcast", content: {
            role: data.content.role,
            color: data.content.color,
            position: data.content.position,
            chess_put_order: data.content.chess_put_order,
          }
        }));
      })
    } else if (data.type == 'no_chess_put') {
      const filtered = room_lists.filter(one => one.room_name == data.content.room_name);
      if (filtered.length != 1) return;
      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: "1", type: "draw_broadcast", content: {
            color: data.content.color,
          }
        }));
      })
    }
  });

  const keepAliveTimer = setInterval(() => {
    // console.log('send keepalive message');
    timeout_time += 1;
    if (timeout_time > MAX_TIMEOUT_TIMES) {
      console.log(`[GameServer] Close a websocket cause TIMEOUT`);
      ws.close();
      clearInterval(keepAliveTimer);
    }
    ws.send(JSON.stringify({ v: "1", type: "keepalive", content: "ping" }));
  }, 1000);

  ws.on('close', () => {
    clearInterval(keepAliveTimer);
    console.log(`[GameServer] close a websocket`);
    if (room_name != null) {
      // 告诉另一个游戏者这人已经断开了
      console.log(`[GameServer] ${role} lost connecttion, send lost message to another`);
      const filtered = room_lists.filter(one => one.room_name == room_name);
      if (filtered.length != 1) return;
      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: '1', type: 'other_lost_connection', content: {
            from: role,
          }
        }));
      });

      room_lists = room_lists.filter(one => one.room_name != room_name);
      console.log(`[GameServer] room ${room_name} close`);
    }
  });
});