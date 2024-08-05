import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { wss } from './src/lib/websocketServer.js';

export default defineConfig({
	plugins: [sveltekit(), wss]
});
