/** Public site identity used for SEO tags, sitemaps, and structured data. */

export const SITE_URL = 'https://www.bastyaalapitvany.hu';
export const SITE_NAME = 'Bástya Terápiás Közösségi Alapítvány';
export const SITE_BRAND = 'Bástya Alapítvány';
export const SITE_TAGLINE =
	'Közösségi alapítvány Szigetszentmiklóson: támogatás, remény és segítség nehéz élethelyzetekben.';

export const SITE_CONTACT = {
	email: 'info@bastyaalapitvany.hu',
	telephone: '+36202862300',
	streetAddress: 'Kálvin tér 3.',
	addressLocality: 'Szigetszentmiklós',
	postalCode: '2310',
	addressCountry: 'HU',
} as const;

export const STATIC_SITEMAP_PATHS = [
	'/',
	'/rolunk/bemutatkozas',
	'/rolunk/beszamolok-palyazatok',
	'/esemenyek/jovobeli',
	'/esemenyek/lezajlott',
	'/galeria',
	'/kapcsolat',
	'/adomanyozas',
	'/afsz',
	'/adatkezelesi-tajekoztato',
	'/impresszum',
] as const;

export function absoluteUrl(path: string): string {
	if (/^https?:\/\//i.test(path)) return path;
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_URL}${normalized}`;
}

export function pageTitle(title: string, branded = true): string {
	if (!branded) return title;
	return `${title} | ${SITE_BRAND}`;
}
