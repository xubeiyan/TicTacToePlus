<script>
	export let status = {
		game: null
	};

	export let room = {
		yourRole: null,
		turnRole: null
	};

	export let players = {
		host: null,
		client: null
	};

	$: turnText = ` - ${room.yourRole == room.turnRole ? '该你了' : '对手下子'}`;
	$: winnerText = ` - ${room.winner == 'host' ? players.host : players.client}获胜`;
</script>

<fieldset class="border border-slate-400 px-2 pb-2">
	<legend>游戏状态</legend>
	{#if status.game == 'idle'}
		<span>空闲中</span>
	{:else if status.game == 'waitForAnother'}
		<span>等待另一玩家加入</span>
	{:else if status.game == 'confirm'}
		<span>开始确认</span>
	{:else if status.game == 'started'}
		<span>游戏开始 {turnText}</span>
	{:else if status.game == 'end'}
		<span>游戏结束 {winnerText}</span>
	{:else if status.game == 'lostEnd'}
		<span>对手断开连接</span>
	{:else if status.game == 'drawEnd'}
		<span>游戏结束 - 平局</span>
	{/if}
</fieldset>
