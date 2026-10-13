/** EmDash plugin that compresses uploaded raster images to WebP after upload. */

import { definePlugin } from 'emdash';
import { convertUploadedImageToWebp, type WebpConvertOptions } from './convert';

export function createPlugin(options: WebpConvertOptions = {}) {
	return definePlugin({
		id: 'webp-convert',
		version: '1.0.0',
		capabilities: ['media:read'],
		hooks: {
			'media:afterUpload': {
				timeout: 60_000,
				errorPolicy: 'continue',
				handler: async (event, ctx) => {
					await convertUploadedImageToWebp(event.media, options, ctx.log);
				},
			},
		},
	});
}
