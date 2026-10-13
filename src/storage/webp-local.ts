/** Local EmDash storage that serves WebP bytes with the correct Content-Type. */

import { open as openFile } from 'node:fs/promises';
import path from 'node:path';
import { createStorage as createLocalStorage } from 'emdash/storage/local';

function resolveSafePath(directory: string, key: string): string {
	const base = path.resolve(directory);
	const resolved = path.resolve(base, key.replace(/^\//, ''));
	if (resolved !== base && !resolved.startsWith(base + path.sep)) {
		throw new Error('Invalid storage key');
	}
	return resolved;
}

async function isWebpMagic(directory: string, key: string): Promise<boolean> {
	try {
		const handle = await openFile(resolveSafePath(directory, key), 'r');
		try {
			const header = Buffer.alloc(12);
			const { bytesRead } = await handle.read(header, 0, 12, 0);
			if (bytesRead < 12) return false;
			return (
				header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP'
			);
		} finally {
			await handle.close();
		}
	} catch {
		return false;
	}
}

/**
 * Factory loaded by EmDash from the storage descriptor entrypoint.
 * Delegates explicitly — class instances cannot be spread (prototype methods are lost).
 */
export function createStorage(config: Record<string, unknown>) {
	const directory = typeof config.directory === 'string' ? config.directory : './uploads';
	const inner = createLocalStorage(config);

	return {
		upload: (options: Parameters<typeof inner.upload>[0]) => inner.upload(options),
		delete: (key: string) => inner.delete(key),
		exists: (key: string) => inner.exists(key),
		list: (options?: Parameters<typeof inner.list>[0]) => inner.list(options),
		getSignedUploadUrl: (options: Parameters<typeof inner.getSignedUploadUrl>[0]) =>
			inner.getSignedUploadUrl(options),
		getPublicUrl: (key: string) => inner.getPublicUrl(key),
		async download(key: string, options?: Parameters<typeof inner.download>[1]) {
			const result = await inner.download(key, options);
			if (await isWebpMagic(directory, key)) {
				return { ...result, contentType: 'image/webp' };
			}
			return result;
		},
	};
}
