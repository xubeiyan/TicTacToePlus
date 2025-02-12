<script>
	export let message = null;

	$: t = (m) => {
		if (m == 'room count reach max size') {
			return '房间数已达上限';
		} else if (['room code not exists', 'miss room code'].includes(m)) {
			return '错误的房间码';
		} else if (m == 'room already has 2 player') {
			return '房间已经满了';
		}
		return m;
	};
</script>

<span>{t(message)}</span>
