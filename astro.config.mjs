// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import emdash from 'emdash/astro';
import { sqlite } from 'emdash/db';

function bodyButtonPlugin() {
	return {
		id: 'body-button',
		version: '1.0.0',
		entrypoint: fileURLToPath(new URL('./src/plugins/body-button/plugin.ts', import.meta.url)),
		componentsEntry: fileURLToPath(new URL('./src/plugins/body-button/components.ts', import.meta.url)),
	};
}

function webpConvertPlugin() {
	return {
		id: 'webp-convert',
		version: '1.0.0',
		entrypoint: fileURLToPath(new URL('./src/plugins/webp-convert/plugin.ts', import.meta.url)),
		options: {
			uploadsDir: './uploads',
			databasePath: './data.db',
			quality: 85,
		},
	};
}

// https://astro.build/config
export default defineConfig({
  site: 'https://www.bastyaalapitvany.hu',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // ClientRouter enables prefetchAll by default; keep it off until we opt in explicitly.
  prefetch: false,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    emdash({
      database: sqlite({ url: 'file:./data.db' }),
      storage: {
        entrypoint: fileURLToPath(new URL('./src/storage/webp-local.ts', import.meta.url)),
        config: {
          directory: './uploads',
          baseUrl: '/_emdash/api/media/file',
        },
      },
      plugins: [bodyButtonPlugin(), webpConvertPlugin()],
    }),
  ],
});
