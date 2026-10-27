/** Load published events for the upcoming and past list pages. */

import { getEmDashCollection, getEmDashEntry } from 'emdash';
import type { ImageValue } from 'emdash';
import { getSeoMeta } from 'emdash/seo';
import { formatEventDates, isUpcoming, startOfTodayIso, toDate } from './event-dates';
import { SITE_URL, absoluteUrl } from './site';

export interface EventCardModel {
	href: string;
	title: string;
	dates: string;
	summary: string;
	image: ImageValue;
	imageAlt: string;
	imageSrc?: string;
}

export interface EventSeoModel {
	title: string;
	description: string | null;
	image?: string;
	canonical: string | null;
	noindex: boolean;
}

export interface EventDetailModel extends EventCardModel {
	body: unknown;
	sections: unknown;
	upcoming: boolean;
	seo: EventSeoModel;
}

function resolveMediaSrc(image: ImageValue): string | undefined {
	const record = image as ImageValue & {
		src?: string;
		url?: string;
		meta?: { storageKey?: string | null };
	};
	if (typeof record.src === 'string' && record.src) return record.src;
	if (typeof record.url === 'string' && record.url) return record.url;
	const storageKey = record.meta?.storageKey;
	if (typeof storageKey === 'string' && storageKey) {
		return `/_emdash/api/media/file/${storageKey}`;
	}
	return undefined;
}

function truncateDescription(text: string, maxLength = 160): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength - 3).trimEnd()}…`;
}

function readEvent(id: string, data: object): Omit<EventDetailModel, 'upcoming' | 'seo'> | null {
	const record = data as Record<string, unknown>;
	if (typeof record.title !== 'string' || typeof record.summary !== 'string') return null;
	const start = toDate(record.start_date);
	const end = toDate(record.end_date);
	const image = record.image;
	if (!start || !end || !image || typeof image !== 'object' || Array.isArray(image)) return null;

	const imageValue = image as ImageValue;
	return {
		href: `/esemenyek/${id}`,
		title: record.title,
		dates: formatEventDates(start, end),
		summary: record.summary,
		image: imageValue,
		imageAlt: imageValue.alt || record.title,
		imageSrc: resolveMediaSrc(imageValue),
		body: record.body,
		sections: record.sections,
	};
}

export async function loadEventCards(upcoming: boolean): Promise<EventCardModel[]> {
	const today = startOfTodayIso();
	const { entries, error } = await getEmDashCollection('events', {
		where: {
			end_date: upcoming ? { gte: today } : { lt: today },
		},
		orderBy: upcoming ? { start_date: 'asc' } : { end_date: 'desc' },
	});
	if (error) throw error;

	return entries.flatMap((entry) => {
		const event = readEvent(entry.id, entry.data);
		return event ? [event] : [];
	});
}

export async function loadEvent(slug: string): Promise<EventDetailModel | null> {
	const { entry, error } = await getEmDashEntry('events', slug);
	if (error) throw error;
	if (!entry) return null;

	const event = readEvent(entry.id, entry.data);
	if (!event) return null;
	const end = toDate((entry.data as { end_date?: unknown }).end_date);
	const pathSlug = entry.slug || entry.id;
	const meta = getSeoMeta(entry, {
		siteUrl: SITE_URL,
		path: `/esemenyek/${pathSlug}`,
		defaultTitle: event.title,
		defaultDescription: truncateDescription(event.summary),
		defaultOgImage: event.imageSrc ? absoluteUrl(event.imageSrc) : undefined,
	});

	return {
		...event,
		upcoming: end ? isUpcoming(end) : false,
		seo: {
			title: meta.ogTitle || event.title,
			description: meta.description,
			image: meta.ogImage ?? undefined,
			canonical: meta.canonical,
			noindex: Boolean(meta.robots),
		},
	};
}
