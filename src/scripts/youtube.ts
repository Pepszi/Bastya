/** Reads a YouTube video id from a public watch, share, embed, or shorts URL. */

const ID_PATTERN = /^[\w-]{11}$/;

export function youtubeId(value: string): string | null {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return null;
	}

	const host = url.hostname.replace(/^www\./, '');
	if (host === 'youtu.be') {
		return validId(url.pathname.split('/').filter(Boolean)[0]);
	}

	if (host !== 'youtube.com' && host !== 'youtube-nocookie.com' && host !== 'm.youtube.com') {
		return null;
	}

	if (url.pathname === '/watch') return validId(url.searchParams.get('v'));

	const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
	return validId(match?.[1]);
}

export function youtubeEmbedUrl(id: string): string {
	return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function youtubePosterUrl(id: string): string {
	return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function validId(value: string | null | undefined): string | null {
	if (!value || !ID_PATTERN.test(value)) return null;
	return value;
}
