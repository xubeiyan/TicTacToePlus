export const sendMessage = (webSocket, type, content) => {
	webSocket.send(
		JSON.stringify({
			v: '1',
			type,
			content
		})
	);
};
