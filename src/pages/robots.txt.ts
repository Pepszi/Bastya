/** Serves robots.txt with production sitemap URL and blocked admin/dev paths. */

import type { APIRoute } from 'astro';
import { SITE_URL } from '../scripts/site';

export const GET: APIRoute = () => {
	const body = [
		'User-agent: *',
		'Allow: /',
		'',
		'Disallow: /_emdash/',
		'Disallow: /dev/',
		'',
		`Sitemap: ${SITE_URL}/sitemap.xml`,
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
