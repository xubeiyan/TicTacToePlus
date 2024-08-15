<script>
    export let status = {
        connected: false,
    };

    export let serverStatus = {
        rooms: null,
        max_room: null,
    };

    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    const disconnect = () => {
        dispatch('disconnect');
    }

    const connect = () => {
        dispatch('connect');
    }
    $: statusText = status.connected ? '已连接' : '未连接';
</script>

<fieldset class="border border-slate-400 px-2 pb-2">
    <legend>连接状态</legend>
    <span>{statusText}</span>
    {#if status.connected}
        <button class="bg-slate-200 dark:bg-slate-600 px-2 rounded-md" on:click={disconnect}
            >断开连接</button
        >
    {:else}
        <button class="bg-slate-200 dark:bg-slate-600 px-2 rounded-md" on:click={connect}>重新连接</button>
    {/if}
    {#if status.connected && serverStatus.rooms != null && serverStatus.max_room != null}
        <span>服务器房间数：{serverStatus.rooms}/{serverStatus.max_room}</span>
    {/if}
</fieldset>