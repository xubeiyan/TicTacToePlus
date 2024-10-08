<script>
	import ChessBoard from './ChessBoard.svelte';
	import ChessHolder from './ChessHolder.svelte';

	export let yourRole = 'host';
	export let turnRole = 'host';

	$: yourTurn = yourRole == turnRole;

	let selectChess = {
		color: null,
		index: null
	};
	// 如果是你开始，则左边是蓝色，从对手开始，则左边是红色
	$: leftColor = yourRole == 'host' ? 'blue' : 'red';
	$: rightColor = yourRole == 'host' ? 'red' : 'blue';
	// 格子大小
	let cellSize = '16';

	// 棋盘 放置了红色大棋子则为 rl，蓝色小棋子为 bs
	let board = ['', '', '', '', '', '', '', '', ''];
	// 两边的可用棋子
	let leftHolder = ['s', 'm', 'l', 's', 'm', 'l', 's', 'm', 'l'];
	let rightHolder = ['s', 'm', 'l', 's', 'm', 'l', 's', 'm', 'l'];

	// 棋子摆放顺序
	let chessPutOrder = [];

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// 胜利消息
	let winRole = null;

	// 选择了棋子
	const handlePickChess = (e) => {
		const index = e.detail.index;
		if (turnRole != yourRole) return;
		if (rightHolder[index] != '') {
			dispatch('pickColorChessOnIndex', {
				index,
				color: rightColor
			});
		}
	};

	// 放置棋子
	const handlePutChess = (e) => {
		// 检查是否可以放置
		const toPutIndex = e.detail.index;
		const originalChess = board[toPutIndex];
		// 没有则
		if (originalChess != '') {
			const color = originalChess[0] == 'r' ? 'red' : 'blue';
			const size = originalChess[1];
			// 不允许自己盖自己的
			if (color == selectChess.color) return;
			if (size == 'l') return;
			if (size == 'm' && selectChess.index % 3 < 2) return;
			if (size == 's' && selectChess.index % 3 == 0) return;
		}

		// 如果没有选择则不让放
		if (selectChess.color == null || selectChess.index == null) return;

		dispatch('putColorChessOnIndex', {
			board_index: toPutIndex,
			color: selectChess.color,
			holder_index: selectChess.index
		});
	};

	// 接收棋步
	export const putChess = ({ role, color, holder_index, board_index }) => {
		// 清空选择
		selectChess.index = null;
		selectChess.color = null;

		// 更新棋子摆放处
		if (color == leftColor) {
			leftHolder[holder_index] = '';
			leftHolder = leftHolder;
		} else if (color == rightColor) {
			rightHolder[holder_index] = '';
			rightHolder = rightHolder;
		}

		// 更新棋盘
		let sizeChar = 's';
		if (holder_index % 3 == 1) sizeChar = 'm';
		if (holder_index % 3 == 2) sizeChar = 'l';

		const colorChar = color == 'red' ? 'r' : 'b';
		board[board_index] = `${colorChar}${sizeChar}`;
		board = board;

		chessPutOrder.push({
			role,
			color,
			holder_index,
			board_index
		});

		// 对面下的检查自己是否还能下
		if (role != yourRole) {
			const rightLargest = getLargestFromRightHolder();
			const boardSmallest = getLargestFromBoard();
			if (
				rightLargest == '' ||
				(rightLargest == 'l' && boardSmallest == 'l') ||
				(rightLargest == 'm' && (boardSmallest == 'm' || boardSmallest == 'l')) ||
				(rightLargest == 's' &&
					(boardSmallest == 's' || boardSmallest == 'm' || boardSmallest == 'l'))
			) {
				dispatch('unablePutChess', {
					color: rightColor
				});
			}
		}

		// 自己下的则检测是否胜利
		if (role == yourRole) {
			checkWin();
		}
	};

	// 获取右边放置处最大的棋子
	const getLargestFromRightHolder = () => {
		let result = '';
		rightHolder.forEach((c) => {
			if (c == 's' && result == '') {
				result = 's';
			} else if (c == 'm' && (result == '' || result == 's')) {
				result = 'm';
			} else if (c == 'l' && (result == '' || result == 's' || result == 'm')) {
				result = 'l';
			}
		});

		return result;
	};

	// 获取棋盘上当前最小的棋子
	const getLargestFromBoard = () => {
		let result = 'l';
		let color = leftColor == 'red' ? 'r' : 'b';

		for (let c of board) {
			if (c == '') return '';
			if (c[0] != color) continue;
			if (c[1] == 'm' && result == 'l') {
				result = 'm';
				continue;
			}
			if (c[1] == 's' && result == 'm') {
				result = 's';
				continue;
			}
		}

		return result;
	};

	// 检查胜利
	const checkWin = () => {
		const b = board;
		let color = null;
		let position = '';
		// 第一行
		if (b[0][0] && b[1][0] && b[2][0] && b[0][0] == b[1][0] && b[1][0] == b[2][0]) {
			color = b[0][0];
			position = 'row1';
			// 第二行
		} else if (b[3][0] && b[4][0] && b[5][0] && b[3][0] == b[4][0] && b[4][0] == b[5][0]) {
			color = b[3][0];
			position = 'row2';
		} else if (b[6][0] && b[7][0] && b[8][0] && b[6][0] == b[7][0] && b[7][0] == b[8][0]) {
			color = b[6][0];
			position = 'row3';
			// 第一列
		} else if (b[0][0] && b[3][0] && b[6][0] && b[0][0] == b[3][0] && b[3][0] == b[6][0]) {
			color = b[0][0];
			position = 'col1';
		} else if (b[1][0] && b[4][0] && b[7][0] && b[1][0] == b[4][0] && b[4][0] == b[7][0]) {
			color = b[1][0];
			position = 'col2';
		} else if (b[2][0] && b[5][0] && b[8][0] && b[2][0] == b[5][0] && b[5][0] == b[8][0]) {
			color = b[2][0];
			position = 'col3';
			// \向
		} else if (b[0][0] && b[4][0] && b[8][0] && b[0][0] == b[4][0] && b[4][0] == b[8][0]) {
			color = b[0][0];
			position = 'slash';
			// /向
		} else if (b[2][0] && b[4][0] && b[6][0] && b[2][0] == b[4][0] && b[4][0] == b[6][0]) {
			color = b[2][0];
			position = 'backslash';
		}

		if (color != null) {
			dispatch('win', {
				color: color == 'r' ? 'red' : 'blue',
				role: yourRole,
				position
			});
		}
	};

	// 显示胜利步骤
	const showChessPutOrder = () => {};

	// 选择棋子
	export const updateSelectChess = ({ color, index }) => {
		selectChess.color = color;
		selectChess.index = index;
	};

	// 胜利
	export const win = ({ role }) => {
		if (role == null) {
			winRole = 'noone';
		} else if (role == yourRole) {
			winRole = 'you';
		} else {
			winRole = 'opposite';
		}
		showChessPutOrder();
	};
</script>

<div class="flex flex-col md:flex-row gap-2 md:gap-8 md:justify-center items-center">
	<ChessHolder color={leftColor} {cellSize} chess={leftHolder} {selectChess} />
	<ChessBoard {board} {winRole} on:putChess={(e) => handlePutChess(e)} />
	<ChessHolder
		color={rightColor}
		{yourTurn}
		self={true}
		{cellSize}
		{selectChess}
		chess={rightHolder}
		on:pickChess={(e) => handlePickChess(e)}
	/>
</div>
