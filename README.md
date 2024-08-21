# TicTacToe Plus

这是一个井字棋 (Tic-Tac-Toe) 的强化版本，更大的棋子能覆盖更小的棋子。从而下法上就有很多变数。

## websocket通信机制

用 `s2b` 代表服务器发送到浏览器的消息，`b2s`代表浏览器发送到服务器的消息

<details>
<summary>WebSocket 通信接口 (点击展开)</summary>

* 甲登录服务器，建立房间
    * `b2s`
    ```javascript
    {
        "v": "1",
        "type": "create_room",
        "content": {
            "nick_name": "abc",
        }
    }
    ```
    * `s2b`（成功）
    ```javascript
    {
        "v": "1",
        "type": "create_room_reply",
        "content": {
            "message": "success",
            "room_name": "会React的Java新手",
            "room_code": 2345
        }
    }
    ```
    * `s2b`（失败）
    ```javascript
    {
        "v": "1",
        "type": "create_room_reply",
        "content": {
            "message": "fail",
            "reason": "server full"
        }
    }
    ```

* 乙登录加入已存在的房间
    * `b2s`
    ```javascript
    {
        "v": "1",
        "type": "join_room",
        "content": {
            "nick_name": "def",
            "room_code": 2345,
        }
    }
    ```
    * `s2b`（成功）
    ```javascript
    {
        "v": "1",
        "type": "join_room_reply",
        "content": {
            "message": "success",
            "room_name": "会React的Java新手"
        }
    }
    ```
    * `s2b`（失败）
    ```javascript
    {
        "v": "1",
        "type": "join_room_reply",
        "content": {
            "message": "fail",
            "reason": "no room code"
        }
    }
    ```

* 两方都加入，请求游戏开始
    * `s2b`
    ```javascript 
    {
        "v": "1",
        "type": "start_request",
        "content": {
            "host": "Rich",
            "client": "Evan"
        }
    }
    ```
    * `b2s`（确认开始）
    ```javascript
    {
        "v": "1",
        "type": "start_confirm",
        "content": {
            "from": "host",
            "confirm": true,
        }
    }
    ```
    * `s2b` （确认消息）
    ```javascript
    {
        "v": "1",
        "type": "confirm_change",
        "content": {
            "from": "host",
            "confirm": true
        }
    }
    ```

* 两方roll点，确定谁先手
    * `s2b`
    ```javascript
    {
        "v": "1",
        "type": "initial_roll",
        "content": {
            "initial": "host",
        }
    }
    ```
* 选择需要下的棋子
    * `b2s`
    ```javascript
    {
        "v": "1",
        "type": "select_chess",
        "content": {
            "room_name": "会React的Java新手",
            "color": "red",
            "index": 0
        }
    }
    ```
    * `s2b`
    ```javascript
    {
        "v": "1",
        "type": "select_chess_broadcast",
        "content": {
            "color": "red",
            "index": 0
        }
    }
    ```
* 放置棋子
    * `b2s`
    ```javascript
    {
        "v": "1",
        "type": "put_chess",
        "content": {
            "role": "host",
            "room_name": "会React的Java新手",
            "color": "red",
            "holder_index": 0,
            "board_index": 1,
        }
    }
    ```
    * `s2b`
    ```javascript
    {
        "v": "1",
        "type": "put_chess_broadcast",
        "content": {
            "role": "host",
            "color": "red",
            "holder_index": 0,
            "board_index": 1,
        }
    }
    ```
* 宣告胜利
    * `b2s`
    ```javascript
    {
        "v": "1",
        "type": "win",
        "content": {
            "role": "host",
            "room_name": "会React的Java新手",
            "color": "red",
            "position": "row1"
        }
    }
    ```
    * `s2b`
    ```javascript
    {
        "v": "1",
        "type": "win_broadcast",
        "content": {
            "role": "host",
            "color": "red",
            "position": "row1"
        }
    }
    ```
* 平局
    * `b2s`
    ```javascript
    {
        "v": "1",
        "type": "no_chess_put",
        "content": {
            "room_name": "会React的Java新手",
            "color": "red",
        }
    }
    ```
    * `s2b` 
    ```javascript
    {
        "v": "1",
        "type": "draw_broadcast",
        "content": {
            "color": "red",
        }
    }
    ```

* 丢失连接
    * `s2b`
    ```javascript
    {
        "v": "1",
        "type": "other_lost_connection",
        "content": {
            "from": "host",
        }
    }
    ```
</details>

## 部署策略

分为两个部分，一个是网页客户端，仅有一个静态页面，只需打包后部署到服务器上；另一个则是`websocket`服务端，需要使用`node`环境

### 网页客户端

#### 克隆仓库

```
git clone https://github.com/xubeiyan/TicTacToePlus
```

#### 安装依赖

```
cd TicTacToePlus
pnpm i
```

#### 修改监听的 `websocket` 地址

复制一份 `.env.example` 为 `.env`，修改 `PUBLIC_WEBSOCKET_ADDRESS` 为合适的值，例如 `ws://yourdomain.net:6789`

```
cp .env.example .env
```
修改`.env`文件 (省略)

#### 构建打包好的文件

```
pnpm build
```

文件会生成在 `build` 目录下，复制到你的服务器的路径下

```
cd build
cp -r * /path/to/your/staticFile
``` 

### `websocket` 服务器

#### 启动服务器

```
node src_server/websocketServer.js
```

出现下列消息则启动成功
```
[GameServer] Started on port 9876, max room size is 5
```

如需修改端口和最大房间数，可以在环境变量指定
```
PORT=6789 MAX_ROOM=100 node src_server/websocketServer.js
```

#### 反向代理服务器

通常为了不额外暴露端口，我们通常使用反向代理服务器（例如 `nginx`）进行一次转发，假设你想通过 `http://yourdomain.net/websocket`进行转发到 `ws://localhost:6789`，下面是 `nginx` 的配置文件的样例
```conf
server {
    # 域名
    server_name yourdomain.net;

    # 监听在80端口
    listen 80;          # IPv4
    listen [::]:80;     # IPv6

    # 静态文件部署
    root /path/to/your/staticFile;

    # 转发到/websocket的
    location /websocket {
        proxy_pass http://localhost:6789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
    }
}
```

则在前面 `.env` 中的 `PUBLIC_WEBSOCKET_ADDRESS` 则可以修改为 `http://yourdomain.net/websocket`

