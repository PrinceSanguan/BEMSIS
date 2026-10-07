import { format, isValid, parseISO } from 'date-fns';

/** Parses the demo's local date strings (and Date objects) without UTC surprises. */
export function toDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    // parseISO treats date-only strings as local dates (new Date('2026-01-05') would be UTC).
    const date = value instanceof Date ? value : parseISO(value);
    return isValid(date) ? date : null;
}

/** "Oct 6, 2026" */
export function formatDate(value: string | Date | null | undefined): string {
    const date = toDate(value);
    return date ? format(date, 'MMM d, yyyy') : '—';
}

/** "October 6, 2026" */
export function formatDateLong(value: string | Date | null | undefined): string {
    const date = toDate(value);
    return date ? format(date, 'MMMM d, yyyy') : '—';
}

/** "Oct 6, 2026 2:30 PM" */
export function formatDateTime(value: string | Date | null | undefined): string {
    const date = toDate(value);
    return date ? format(date, 'MMM d, yyyy h:mm a') : '—';
}

/** "Oct 6, 2026 14:30" (Laravel 'M d, Y H:i', used by announcements) */
export function formatDateTime24(value: string | Date | null | undefined): string {
    const date = toDate(value);
    return date ? format(date, 'MMM dd, yyyy HH:mm') : '—';
}

/** Local calendar date as YYYY-MM-DD (not UTC, so it is correct right after midnight in Manila). */
export function toISODate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

/** Local timestamp without a time zone suffix, matching the format used in /data. */
export function toISODateTime(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

/** Value for <input type="datetime-local"> in local time (the original used toISOString, which shifted by the UTC offset). */
export function toDateTimeLocalInput(value: string | null | undefined): string {
    const date = toDate(value);
    return date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';
}

/** Converts an <input type="datetime-local"> value back to the stored format. */
export function fromDateTimeLocalInput(value: string): string {
    const date = toDate(value);
    return date ? toISODateTime(date) : '';
}

export function todayISO(): string {
    return toISODate(new Date());
}

export function nowISO(): string {
    return toISODateTime(new Date());
}

export function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}
