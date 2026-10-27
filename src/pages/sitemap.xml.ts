/** Sitemap index combining static pages and EmDash event sitemaps. */

import type { APIRoute } from 'astro';
import { SITE_URL } from '../scripts/site';

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

export const GET: APIRoute = () => {
	const sitemaps = [`${SITE_URL}/sitemap-pages.xml`, `${SITE_URL}/sitemap-events.xml`];
	const entries = sitemaps.flatMap((loc) => [
		'  <sitemap>',
		`    <loc>${escapeXml(loc)}</loc>`,
		'  </sitemap>',
	]);

	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...entries,
		'</sitemapindex>',
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
