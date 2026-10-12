/** Calendar-day helpers for events, using Europe/Budapest local dates. */

const TIME_ZONE = 'Europe/Budapest';

const dayFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
});

const labelFormat = new Intl.DateTimeFormat('hu-HU', {
	timeZone: TIME_ZONE,
	year: 'numeric',
	month: 'long',
	day: 'numeric',
});

/** UTC instant of midnight at the start of today's calendar day in Budapest. */
export function startOfTodayIso(now = new Date()): string {
	const ymd = dayFormat.format(now);
	const probe = new Date(`${ymd}T00:00:00.000Z`);
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
	}).formatToParts(probe);
	const value = (type: Intl.DateTimeFormatPartTypes) =>
		Number(parts.find((part) => part.type === type)?.value);
	const zonedAsUtc = Date.UTC(
		value('year'),
		value('month') - 1,
		value('day'),
		value('hour'),
		value('minute'),
		value('second'),
	);
	return new Date(probe.getTime() - (zonedAsUtc - probe.getTime())).toISOString();
}

export function toDate(value: unknown): Date | null {
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
	if (typeof value === 'string' || typeof value === 'number') {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) return date;
	}
	return null;
}

/** One Hungarian date, or a range when the calendar days differ. */
export function formatEventDates(start: Date, end: Date): string {
	const startLabel = labelFormat.format(start);
	const endLabel = labelFormat.format(end);
	if (startLabel === endLabel) return startLabel;
	return `${startLabel} – ${endLabel}`;
}

export function isUpcoming(end: Date, now = new Date()): boolean {
	return end.getTime() >= new Date(startOfTodayIso(now)).getTime();
}
