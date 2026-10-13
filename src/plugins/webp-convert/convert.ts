/** Converts raster image bytes to WebP and updates the local EmDash media record. */

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';

const SKIP_MIME_TYPES = new Set([
	'image/svg+xml',
	'image/gif',
	'image/x-icon',
	'image/vnd.microsoft.icon',
]);

export interface WebpConvertOptions {
	uploadsDir?: string;
	databasePath?: string;
	quality?: number;
}

export interface UploadedMedia {
	id: string;
	filename: string;
	mimeType: string;
	size: number | null;
	url: string;
	createdAt: string;
}

interface MediaRow {
	storage_key: string;
	mime_type: string;
	filename: string;
}

function resolvePath(value: string): string {
	return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

function replaceExtension(name: string, extension: string): string {
	const base = path.basename(name);
	const dot = base.lastIndexOf('.');
	const stem = dot > 0 ? base.slice(0, dot) : base;
	return `${stem}${extension}`;
}

function contentHash(bytes: Uint8Array): string {
	return `sha1:${createHash('sha1').update(bytes).digest('hex')}`;
}

function isConvertibleImage(mimeType: string): boolean {
	if (!mimeType.startsWith('image/')) return false;
	return !SKIP_MIME_TYPES.has(mimeType);
}

export async function convertUploadedImageToWebp(
	media: UploadedMedia,
	options: WebpConvertOptions = {},
	log?: {
		info: (message: string, data?: unknown) => void;
		warn: (message: string, data?: unknown) => void;
		error: (message: string, data?: unknown) => void;
	},
): Promise<void> {
	if (!isConvertibleImage(media.mimeType)) return;

	const quality = options.quality ?? 85;
	const uploadsDir = resolvePath(options.uploadsDir ?? './uploads');
	const databasePath = resolvePath(options.databasePath ?? './data.db');

	const db = new DatabaseSync(databasePath);
	try {
		const row = db
			.prepare(
				`SELECT storage_key, mime_type, filename
				 FROM media
				 WHERE id = ? AND status = 'ready'`,
			)
			.get(media.id) as MediaRow | undefined;

		if (!row) {
			log?.warn('webp-convert: media row not found', { id: media.id });
			return;
		}

		// Keep storage_key stable — the admin editor already bound the field to
		// the confirm-time URL/key. Renaming the key clears the field value.
		const storageKey = row.storage_key;
		const sourcePath = path.join(uploadsDir, storageKey);
		const sourceBytes = await fs.readFile(sourcePath);

		const webpBytes = await sharp(sourceBytes, { failOn: 'none' })
			.rotate()
			.webp({ quality })
			.toBuffer();
		const meta = await sharp(webpBytes).metadata();

		await fs.writeFile(sourcePath, webpBytes);

		const hash = webpBytes.byteLength <= 8 * 1024 * 1024 ? contentHash(webpBytes) : null;
		const newFilename = replaceExtension(row.filename, '.webp');

		db.prepare(
			`UPDATE media
			 SET filename = ?,
			     mime_type = 'image/webp',
			     size = ?,
			     width = COALESCE(?, width),
			     height = COALESCE(?, height),
			     content_hash = ?
			 WHERE id = ? AND status = 'ready'`,
		).run(
			newFilename,
			webpBytes.byteLength,
			meta.width ?? null,
			meta.height ?? null,
			hash,
			media.id,
		);

		log?.info('webp-convert: converted upload to WebP', {
			id: media.id,
			from: row.mime_type,
			quality,
			bytesBefore: sourceBytes.byteLength,
			bytesAfter: webpBytes.byteLength,
			storageKey,
		});
	} finally {
		db.close();
	}
}
