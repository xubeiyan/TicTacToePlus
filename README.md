# TicTacToe Plus

这是一个井字棋 (Tic-Tac-Toe) 的强化版本，更大的棋子能覆盖更小的棋子。从而引发了一些奇妙的化学反应。

## websocket通信机制

* 甲登录服务器，建立房间
    * 发送
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
    * 返回（成功）
    ```javascript
    {
        "v": "1",
        "type": "create_room_reply",
        "content": {
            "message": "success"
        }
    }
    ```
    * 返回（失败）
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
    * 发送
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
    * 返回（成功）
    ```javascript
    {
        "v": "1",
        "type": "join_room_reply",
        "content": {
            "message": "success"
        }
    }
    ```
    * 返回（失败）
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

* 两方都加入，游戏开始
    * 发送
    ```javascript 
    {
        "v": "1",
        "type": "start_game",
        "content": {
            "host": "Rich",
            "client": "Evan"
        }
    }
    ```