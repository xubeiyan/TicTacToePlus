<script>
	import RoomCode from '../components/joinRoom/RoomCode.svelte';
	export let status = {
		game: null
	};

	export let room = {
		yourRole: null
	};

	export let players = {
		host: null,
		client: null
	};

	let roomCode = null;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const createRoom = () => {
		dispatch('createRoom');
	};

	const handleJoinRoom = (e) => {
		dispatch('joinRoom', {
			code: e.detail.code
		});
	};

	export const handleCleanRoomCode = () => {
		if (roomCode == null) return;
		roomCode.clearRoomCode();
	};
</script>

<fieldset class="border border-slate-400 px-2 pb-2 grow">
	<legend>房间</legend>
	{#if status.game == 'idle' && status.connected}
		<button class="bg-slate-200 dark:bg-slate-600 rounded-md px-2" on:click={createRoom}
			>新建房间</button
		>
		<span>或者房间号码</span>
		<RoomCode on:joinRoom={handleJoinRoom} bind:this={roomCode} />
	{/if}
	{#if status.inRoom}
		<span>在房间：{room.name} 中</span>
		{#if status.game == 'waitForAnother'}
			<span>房间号：{room.code}</span>
		{/if}
		<span class={room.yourRole == 'host' ? 'font-bold' : ''}>房主：{players.host}</span>
		<span class={room.yourRole == 'client' ? 'font-bold' : ''}>参加者：{players.client}</span>
	{/if}
</fieldset>
