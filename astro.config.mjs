// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import emdash, { local } from 'emdash/astro';
import { sqlite } from 'emdash/db';

function bodyButtonPlugin() {
	return {
		id: 'body-button',
		version: '1.0.0',
		entrypoint: fileURLToPath(new URL('./src/plugins/body-button/plugin.ts', import.meta.url)),
		componentsEntry: fileURLToPath(new URL('./src/plugins/body-button/components.ts', import.meta.url)),
	};
}

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    emdash({
      database: sqlite({ url: 'file:./data.db' }),
      storage: local({
        directory: './uploads',
        baseUrl: '/_emdash/api/media/file',
      }),
      plugins: [bodyButtonPlugin()],
    }),
  ],
});
