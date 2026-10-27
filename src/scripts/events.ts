/** Load published events for the upcoming and past list pages. */

import { getEmDashCollection, getEmDashEntry } from 'emdash';
import type { ImageValue } from 'emdash';
import { formatEventDates, isUpcoming, startOfTodayIso, toDate } from './event-dates';

export interface EventCardModel {
	href: string;
	title: string;
	dates: string;
	summary: string;
	image: ImageValue;
	imageAlt: string;
	imageSrc?: string;
}

export interface EventDetailModel extends EventCardModel {
	body: unknown;
	sections: unknown;
	upcoming: boolean;
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

function readEvent(id: string, data: object): Omit<EventDetailModel, 'upcoming'> | null {
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
	return {
		...event,
		upcoming: end ? isUpcoming(end) : false,
	};
}
