/**
 * One-off: convert raster files in ./uploads to WebP q85 in place,
 * then sync matching EmDash media rows (mime/size/hash/filename).
 * Keeps storage_key unchanged so content field references stay valid.
 */

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';

const UPLOADS_DIR = path.resolve('uploads');
const DATABASE_PATH = path.resolve('data.db');
const QUALITY = 85;
const CONVERTIBLE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.bmp', '.avif']);

function contentHash(bytes) {
	return `sha1:${createHash('sha1').update(bytes).digest('hex')}`;
}

function replaceExtension(name, extension) {
	const base = path.basename(name);
	const dot = base.lastIndexOf('.');
	const stem = dot > 0 ? base.slice(0, dot) : base;
	return `${stem}${extension}`;
}

async function main() {
	const entries = await fs.readdir(UPLOADS_DIR, { withFileTypes: true });
	const files = entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => CONVERTIBLE_EXT.has(path.extname(name).toLowerCase()))
		.sort();

	console.log(`Found ${files.length} convertible files in ${UPLOADS_DIR}`);

	const db = new DatabaseSync(DATABASE_PATH);
	const updateStmt = db.prepare(
		`UPDATE media
		 SET filename = ?,
		     mime_type = 'image/webp',
		     size = ?,
		     width = COALESCE(?, width),
		     height = COALESCE(?, height),
		     content_hash = ?
		 WHERE storage_key = ? AND status = 'ready'`,
	);

	let converted = 0;
	let skipped = 0;
	let failed = 0;
	let bytesBefore = 0;
	let bytesAfter = 0;
	let dbUpdated = 0;

	for (const [index, name] of files.entries()) {
		const filePath = path.join(UPLOADS_DIR, name);
		try {
			const sourceBytes = await fs.readFile(filePath);
			bytesBefore += sourceBytes.byteLength;

			const webpBytes = await sharp(sourceBytes, { failOn: 'none' })
				.rotate()
				.webp({ quality: QUALITY })
				.toBuffer();
			const meta = await sharp(webpBytes).metadata();

			await fs.writeFile(filePath, webpBytes);
			bytesAfter += webpBytes.byteLength;

			const hash =
				webpBytes.byteLength <= 8 * 1024 * 1024 ? contentHash(webpBytes) : null;

			const row = db
				.prepare(
					`SELECT id, filename FROM media WHERE storage_key = ? AND status = 'ready'`,
				)
				.get(name);

			if (row) {
				const result = updateStmt.run(
					replaceExtension(row.filename, '.webp'),
					webpBytes.byteLength,
					meta.width ?? null,
					meta.height ?? null,
					hash,
					name,
				);
				dbUpdated += result.changes;
			}

			converted += 1;
			const pct = Math.round(((index + 1) / files.length) * 100);
			const saved = sourceBytes.byteLength - webpBytes.byteLength;
			console.log(
				`[${pct}%] ${name}  ${sourceBytes.byteLength} → ${webpBytes.byteLength} (${saved >= 0 ? '-' : '+'}${Math.abs(saved)} bytes)${row ? '' : ' [orphan file]'}`,
			);
		} catch (error) {
			failed += 1;
			console.error(`FAIL ${name}:`, error instanceof Error ? error.message : error);
		}
	}

	db.close();

	const savedTotal = bytesBefore - bytesAfter;
	console.log('---');
	console.log(`Converted: ${converted}`);
	console.log(`Failed: ${failed}`);
	console.log(`Skipped: ${skipped}`);
	console.log(`Media rows updated: ${dbUpdated}`);
	console.log(
		`Size: ${(bytesBefore / 1024 / 1024).toFixed(1)} MB → ${(bytesAfter / 1024 / 1024).toFixed(1)} MB (${savedTotal >= 0 ? 'saved' : 'grew'} ${(Math.abs(savedTotal) / 1024 / 1024).toFixed(1)} MB)`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
