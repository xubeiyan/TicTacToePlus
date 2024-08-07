# TicTacToe Plus

这是一个井字棋 (Tic-Tac-Toe) 的强化版本，更大的棋子能覆盖更小的棋子。从而引发了一些奇妙的化学反应。

## websocket通信机制

用 `s2b` 代表服务器发送到浏览器的消息，`b2s`代表浏览器发送到服务器的消息

* 甲登录服务器，建立房间
    * `b2s`
    ```javascript
    {
        "v": "1",
        "type": "create_room",
        "content": {
            "nick_name": "abc",
            "room_name": "a-react-developer",
        }
    }
    ```
    * `s2b`（成功）
    ```javascript
    {
        "v": "1",
        "type": "create_room_reply",
        "content": {
            "message": "success"
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
            "room_name": "a-react-developer",
        }
    }
    ```
    * `s2b`（成功）
    ```javascript
    {
        "v": "1",
        "type": "join_room_reply",
        "content": {
            "message": "success"
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
            "reason": "no room"
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