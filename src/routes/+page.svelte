<script>
	import '../app.css';
	import Place from '../components/Place.svelte';
	import Chess from '../components/Chess.svelte';
	import Redo from '../assets/icon/redo.svelte';

	// 该谁下子red/blue
	let turn = {
		color: 'red'
	};
	// 棋盘状态
	let boardStatus = 'intro';
	$: redPickClass = turn.color == 'red' ? 'outline outline-zinc-500' : '';
	$: bluePickClass = turn.color == 'blue' ? 'outline outline-zinc-500' : '';

	// 棋子状态
	let chessStatus = {
		red: [],
		blue: []
	};
	// 初始化棋子状态
	const initChessStatus = () => {
		chessStatus.red = Array.from({ length: 9 }, (_, i) => i + 1).map((one) => ({
			id: one,
			size: one % 3 == 1 ? 's' : one % 3 == 2 ? 'm' : 'l',
			placement: 'idle',
			selected: false
		}));
		chessStatus.blue = Array.from({ length: 9 }, (_, i) => i + 1).map((one) => ({
			id: one,
			size: one % 3 == 1 ? 's' : one % 3 == 2 ? 'm' : 'l',
			placement: 'idle',
			selected: false
		}));
	};
	initChessStatus();
	// 棋盘状态
	let boardChess = ['', '', '', '', '', '', '', '', ''];

	// 点击选择棋子
	const handleSelectChess = (e, color) => {
		// 已经胜利了则不响应选择
		if (boardStatus != 'start') return;
		if (color == 'red' && turn.color == 'red') {
			// 如果此棋子没有放置，则选中它
			const filtered = chessStatus.red.filter((one) => one.id == e.detail.id);
			if (filtered.length == 1 && filtered[0].placement == 'idle') {
				chessStatus.red.forEach((one) => (one.selected = false));
				filtered[0].selected = true;
			}
		} else if (color == 'blue' && turn.color == 'blue') {
			const filtered = chessStatus.blue.filter((one) => one.id == e.detail.id);
			if (filtered.length == 1 && filtered[0].placement == 'idle') {
				chessStatus.blue.forEach((one) => (one.selected = false));
				filtered[0].selected = true;
			}
		}
		// 黑科技👇
		chessStatus = chessStatus;
	};

	// 点击棋盘位置
	const handlePutOnBoard = (e) => {
		const id = e.detail.id;
		let filtered;
		if (turn.color == 'red') {
			filtered = chessStatus.red.filter((one) => one.selected);
			// 没有选择则返回
			if (filtered.length != 1) return;
			const size = filtered[0].size;

			// 输出不能下并返回
			if (
				!(
					boardChess[id] == '' ||
					(boardChess[id][1] == 's' && size != 's') ||
					(boardChess[id][1] == 'm' && size == 'l')
				)
			) {
				return;
			}

			boardChess[id] = `r${size}`;
			filtered[0].placement = id;
			filtered[0].selected = false;
			turn.color = 'blue';
		} else if (turn.color == 'blue') {
			filtered = chessStatus.blue.filter((one) => one.selected);
			// 没有选择则返回
			if (filtered.length != 1) return;
			const size = filtered[0].size;
			// 输出不能下并返回
			if (
				!(
					boardChess[id] == '' ||
					(boardChess[id][1] == 's' && size != 's') ||
					(boardChess[id][1] == 'm' && size == 'l')
				)
			) {
				return;
			}

			boardChess[id] = `b${size}`;
			filtered[0].placement = id;
			filtered[0].selected = false;
			turn.color = 'red';
		}
		// 黑科技👇
		boardChess = boardChess;
		chessStatus = chessStatus;
		checkWinner();
	};

	// 检查胜利者
	const checkWinner = () => {
		if (
			(boardChess[0][0] == 'r' && boardChess[1][0] == 'r' && boardChess[2][0] == 'r') ||
			(boardChess[0][0] == 'b' && boardChess[1][0] == 'b' && boardChess[2][0] == 'b') ||
			(boardChess[3][0] == 'r' && boardChess[4][0] == 'r' && boardChess[5][0] == 'r') ||
			(boardChess[3][0] == 'b' && boardChess[4][0] == 'b' && boardChess[5][0] == 'b') ||
			(boardChess[6][0] == 'r' && boardChess[7][0] == 'r' && boardChess[8][0] == 'r') ||
			(boardChess[6][0] == 'b' && boardChess[7][0] == 'b' && boardChess[8][0] == 'b') ||
			(boardChess[0][0] == 'r' && boardChess[3][0] == 'r' && boardChess[6][0] == 'r') ||
			(boardChess[0][0] == 'b' && boardChess[3][0] == 'b' && boardChess[6][0] == 'b') ||
			(boardChess[1][0] == 'r' && boardChess[4][0] == 'r' && boardChess[7][0] == 'r') ||
			(boardChess[1][0] == 'b' && boardChess[4][0] == 'b' && boardChess[7][0] == 'b') ||
			(boardChess[2][0] == 'r' && boardChess[5][0] == 'r' && boardChess[8][0] == 'r') ||
			(boardChess[2][0] == 'b' && boardChess[5][0] == 'b' && boardChess[8][0] == 'b') ||
			(boardChess[0][0] == 'r' && boardChess[4][0] == 'r' && boardChess[8][0] == 'r') ||
			(boardChess[0][0] == 'b' && boardChess[4][0] == 'b' && boardChess[8][0] == 'b') ||
			(boardChess[2][0] == 'r' && boardChess[4][0] == 'r' && boardChess[6][0] == 'r') ||
			(boardChess[2][0] == 'b' && boardChess[4][0] == 'b' && boardChess[6][0] == 'b')
		) {
			if (turn.color == 'red') {
				boardStatus = 'blueWin';
			} else if (turn.color == 'blue') {
				boardStatus = 'redWin';
			}
			return;
		}

		const filtered = boardChess.filter((one) => one == '');
		if (filtered.length == 0) {
			boardStatus = 'draw';
		}
	};

    // 开始游戏
    const start = () => {
        boardStatus = 'start';
    }

	// 重启游戏
	const restart = () => {
		initChessStatus();
		boardChess = ['', '', '', '', '', '', '', '', ''];
		turn = {
			color: 'red'
		};
        boardStatus = 'start';
	};
</script>

<main class="min-h-svh flex flex-col md:flex-row gap-2 justify-evenly items-center relative">
	<div
		class="grid grid-cols-3 grid-rows-3 items-start md:items-end gap-y-2 p-4 rounded-lg {redPickClass}"
	>
		{#each chessStatus.red as chess (chess.id)}
			<Chess
				size={chess.size}
				color="red"
				id={chess.id}
				placement={chess.placement}
				selected={chess.selected}
				on:selectChess={(e) => handleSelectChess(e, 'red')}
			/>
		{/each}
	</div>
	<div class="relative grid grid-cols-3 grid-rows-3 gap-2 z-1">
		{#each boardChess as chess, id}
			<Place {chess} {id} on:putOnBoard={(e) => handlePutOnBoard(e)} />
		{/each}
	</div>
	<div class="grid grid-cols-3 grid-rows-3 items-end gap-y-2 p-4 rounded-lg {bluePickClass}">
		{#each chessStatus.blue as chess (chess.id)}
			<Chess
				size={chess.size}
				color="blue"
				id={chess.id}
				placement={chess.placement}
				selected={chess.selected}
				on:selectChess={(e) => handleSelectChess(e, 'blue')}
			/>
		{/each}
	</div>
	{#if boardStatus == 'redWin' || boardStatus == 'blueWin' || boardStatus == 'draw'}
		<div
			class="absolute w-full h-full flex flex-col gap-2 justify-center items-center z-10 bg-slate-200/50 text-lg"
		>
			{#if boardStatus == 'redWin'}
				<span class="text-red-600 rotate-180 md:rotate-0">Red win!</span>
			{:else if boardStatus == 'blueWin'}
				<span class="text-blue-600">Blue win!</span>
			{:else if boardStatus == 'draw'}
				<span>Draw</span>
			{/if}
			<button
				class="outline outline-1 hover:outline-2 outline-slate-300 p-2 bg-slate-300 rounded-md"
				on:click={restart}
			>
				<Redo />
			</button>
		</div>
	{/if}
    {#if boardStatus == 'intro'}
    <div class="absolute w-full h-full flex flex-col justify-center items-center bg-neutral-300/40 px-4">
        <p class="text-lg">欢迎玩耍井字棋Plus版！</p>
        <p>每方拥有小、中、大棋子各三枚，每人行动时可以先选择要放置的棋子（点击一下），再放置到棋盘上（在棋盘上点一下）。</p>
        <p>除了将棋子放置到空的棋盘格子上，还可以放置到比该枚棋子小的棋子上。</p>
        <p>大型棋子可以覆盖中型棋子和小型棋子，中型棋子可以覆盖小型棋子。首先连成一条线的玩家获得胜利。</p>
        <button class="bg-slate-600 px-2 py-1 rounded-md text-white mt-2" on:click={start}>明白</button>
    </div>
    {/if}
</main>
