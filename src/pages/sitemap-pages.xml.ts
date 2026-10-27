/** Sitemap of static marketing and legal pages (excludes CMS events). */

import type { APIRoute } from 'astro';
import { SITE_URL, STATIC_SITEMAP_PATHS } from '../scripts/site';

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

export const GET: APIRoute = () => {
	const urls = STATIC_SITEMAP_PATHS.map((path) => {
		const loc = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
		return [
			'  <url>',
			`    <loc>${escapeXml(loc)}</loc>`,
			'  </url>',
		].join('\n');
	});

	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>',
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
