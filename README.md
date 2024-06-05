# Tic-Tac-Toe Plus

某个全新的井字棋游戏。

你可以访问[这里](https://github.com/xubeiyan/TicTacToePlus)，来玩到实时构建的版本

## 多人游戏支持

> 当然不是在一个电脑上多人游戏，we have done it

### 流程设计

因为这个游戏就两个人玩，于是按照建立游戏者（玩家A）和参与游戏者（玩家B）来叙述整个流程

* `玩家A`加入游戏

    `玩家A`打开网页，选择“多人游戏”，输入用户名，然后选择“新建房间”，然后会和服务器（暂定webgame-server-01.chenhai.net/tictactoeplus建立websocket连接），如果用户名重复，会提示已经有一个同名用户了
    ```
    // create是创建房间
    {
        "req_opt": "user_join",
        "data": {
            "username": "host",
            "start_game_type": "create"
        }
    }
    ```

* `玩家A`建立房间

    自动从未选择的词组中选择一个作为房间名称（例如会React的资深Vue开发者），建立房间，返回这个房间名称作为显示
    ```
    {
        "res_opt": "user_login",
        "data": {
            "room_name": "会React的资深Vue开发者的游戏"
        }
    }
    ```

* `玩家B`加入

    `玩家B`打开网页，选择“多人游戏”，输入用户名，然后选择“加入房间”，然后会和服务器建立连接，如果用户名重复，会提示已经有一个同名用户了
    ```
    {
        "req_opt": "user_login",
        "data": {
            "username": "client",
            "start_game_type": "join",
            "to_join_room_name": "会React的资深Vue开发者的游戏"
        }
    }
    ```

* 游戏开始

    两名玩家加入后，开始游戏，随机选择一名玩家开始（两边roll点发送到服务器，服务器生成取大还是取小先手）
    ```
    {
        "req_opt": "start_order",
        "data": {
            "roll": 36
        }
    }
    ```

    ```
    {
        "res_opt": "start_order",
        "data": {
            "order_first": "large",
            "host_roll": 36,
            "client_roll": 20,
        }
    }
    ```

* 下子过程

    每下一步棋，发送何种棋子（chessType）和下棋位置（chessBoardPosition）以及整个棋盘（board）消息给服务端，服务端判断是否合理，发送给另一个玩家，另一个玩家显示

    ```
    {
        "req_opt": "game_move",
        "data": {
            "type": "l",
            "position": 4,
            "board": ["", "", "", "", "rl", "", "", "", ""]
        }
    }
    ```

    除了自己发送game_move会收到game_move回复外，另一方也会收到game_move回复

    ```
    {
        "res_opt": "game_move",
        "data": {
            "board": ["", "", "", "", "rl", "", "", "", ""]
        }
    }
    ```

* 判断输赢

    每下一步之后玩家这边先判断自己是否胜利，将其发送到服务器，服务器确认后发送到另一个玩家

    ```
    {
        "req_opt": "win",
        "data": {
            "board": ["", "bs", "bs", "rl", "rl", "rl", "", "", ""],
            "position": [3, 4, 5]
        }
    }
    ```

    两方都会收到这个消息
    ```
    {
        "res_opt": "win",
        "data": {
            "username": "host"
        }
    }
    ```

* 认输

    玩家随时可以认输（自己下或者另一个人下的时候），发送到服务器，服务器确认后发送到另一个玩家

    ```
    {
        "req_opt": "resign",
        "data": {
            "username": "host"
        }
    }
    ```

    ```
    {
        "req_opt": "resign",
        "data": {
            "username": "host"
        }
    }
    ```
* 游戏结束

    显示胜利或失败消息，并确认是否继续下一把，玩家发送到服务器自己进行下一把的意愿，都下一把则跳到游戏开始

    ```
    {
        "req_opt": "restart_req",
        "data": {
            "username": "host",
        }
    }
    ```

    返回两个用户的情况，两者都是ok则跳到下一把，有人是quit则结束游戏，wait则是另一个人未选择

    ```
    {
        "res_opt": "restart_req",
        "data": [{
            "username": "host",
            "status": "ok",
        }, {
            "username": "client",
            "status": "wait",
        }]
    }
    ```

