// 此文件用于处理websocket连接和消息
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 6789 });

// 最大房间数
const MAX_ROOM_LENGTH = 5;

const room_lists = [];

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', (dataString) => {
    const data = JSON.parse(dataString);
    if (data == undefined) return;
    if (data.type == 'keepalive' && data.content == 'pong') {
      // console.log('receive keepalive reply');
      // TODO: 增加处理逻辑
      return;
    } else if (data.type == 'create_room') {
      // 检查是否有room_name和nickname
      if (!(data.content?.room_name && data.content?.nick_name)) {
        ws.send(JSON.stringify({
          v: "1", type: "create_room_reply", content: {
            message: "fail", reason: "miss room name or nick name"
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

      // 检查是否存在该room
      const filtered = room_lists.filter(one => one.room_name == data.content.room_name);
      if (filtered.length > 0) {
        ws.send(JSON.stringify({
          v: "1", type: "create_room_reply", content: {
            message: "fail", reason: "room name exists"
          }
        }));
        return;
      }

      room_lists.push({
        room_name: data.content.room_name,
        players: [data.content.nick_name],
        ws: [ws],
      });

      ws.send(JSON.stringify({ v: "1", type: "create_room_reply", content: { message: "success" } }));
      return;
    } else if (data.type == 'join_room') {
      // 检查是否有room_name和nickname
      if (!(data.content?.room_name && data.content?.nick_name)) {
        ws.send(JSON.stringify({
          v: "1", type: "join_room_reply", content: {
            message: "fail", reason: "miss room name or nick name"
          }
        }));
        return;
      }

      // 检查是否存在该room
      const filtered = room_lists.filter(one => one.room_name == data.content.room_name);
      if (filtered.length != 1) {
        ws.send(JSON.stringify({
          v: "1", type: "join_room_reply", content: {
            message: "fail", reason: "room name not exists"
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

      filtered[0].players.push(data.content.nick_name);
      filtered[0].ws.push(ws);
      ws.send(JSON.stringify({
        v: "1", type: "join_room_reply", content: {
          message: "success"
        }
      }));
      // 向两个参与者发送加入游戏开始消息
      filtered[0].ws.forEach(socket => {
        socket.send(JSON.stringify({
          v: "1", type: "start_game", content: {
            host: filtered[0].players[0],
            client: filtered[0].players[1]
          }
        }));
      })
    }
  });

  const keepAliveTimer = setInterval(() => {
    // console.log('send keepalive message');
    ws.send(JSON.stringify({ v: "1", type: "keepalive", content: "ping" }));
  }, 1000);

  ws.on('close', () => {
    clearInterval(keepAliveTimer);
  });

});

export { wss };