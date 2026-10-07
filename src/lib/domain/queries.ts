// Read helpers shared by the page view builders (the old Eloquent relations and accessors).

import { toDate } from '@/lib/format';
import type { Announcement, BarangayEvent, DemoDatabase, Paginated, Purok, User } from '@/lib/types';

export const ALL_RESIDENTS = 'All Residents';

export function findUser(db: DemoDatabase, id: number | null | undefined): User | null {
    return id == null ? null : (db.users.find((u) => u.id === id) ?? null);
}

export function findEvent(db: DemoDatabase, id: number | null | undefined): BarangayEvent | null {
    return id == null ? null : (db.events.find((e) => e.id === id) ?? null);
}

export function findPurok(db: DemoDatabase, id: number | null | undefined): Purok | null {
    return id == null ? null : (db.puroks.find((p) => p.id === id) ?? null);
}

/** User JSON as Laravel serialized it (no password), plus the purok relation. */
export function publicUser(db: DemoDatabase, user: User) {
    const { password: _password, ...rest } = user;
    void _password;
    return { ...rest, purok: findPurok(db, user.purok_id) };
}
export type PublicUser = ReturnType<typeof publicUser>;

export function puroksByName(db: DemoDatabase): Purok[] {
    return [...db.puroks].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

/** Event::purok_names accessor: "All Residents" for every purok, otherwise "Purok 1, Purok 2". */
export function purokNames(db: DemoDatabase, event: Pick<BarangayEvent, 'purok_ids' | 'target_all_residents'>): string {
    if (event.target_all_residents || !event.purok_ids?.length) return ALL_RESIDENTS;
    return db.puroks
        .filter((p) => event.purok_ids!.includes(p.id))
        .map((p) => p.name)
        .join(', ');
}

/** Event::puroks accessor. */
export function eventPuroks(db: DemoDatabase, event: Pick<BarangayEvent, 'purok_ids' | 'target_all_residents'>): Purok[] {
    if (event.target_all_residents || !event.purok_ids?.length) return [];
    return db.puroks.filter((p) => event.purok_ids!.includes(p.id));
}

/** The Captain/Partner `purok` field: null (all residents), the single purok, or { name: "Purok 1, Purok 2" }. */
export function eventPurokSummary(db: DemoDatabase, event: BarangayEvent): { id?: number; name: string } | null {
    const puroks = eventPuroks(db, event);
    if (puroks.length === 0) return null;
    if (puroks.length === 1) return puroks[0];
    return { name: puroks.map((p) => p.name).join(', ') };
}

export function eventWithCreator(db: DemoDatabase, event: BarangayEvent) {
    const creator = findUser(db, event.created_by);
    return { ...event, creator: creator ? publicUser(db, creator) : null, creator_role: creator?.role ?? null };
}

/** The moment an event is over: end_date, or start_date when there is no end. */
export function eventEnd(event: Pick<BarangayEvent, 'start_date' | 'end_date'>): Date {
    return toDate(event.end_date ?? event.start_date) ?? new Date(0);
}

export function isEventEnded(event: Pick<BarangayEvent, 'start_date' | 'end_date'>, now = new Date()): boolean {
    return eventEnd(event) < now;
}

export function hasEventStarted(event: Pick<BarangayEvent, 'start_date'>, now = new Date()): boolean {
    return (toDate(event.start_date) ?? new Date(0)) <= now;
}

/** Resident purok scoping: events for everyone, or for the resident's purok. */
export function isEventVisibleTo(event: BarangayEvent, user: User): boolean {
    if (event.target_all_residents || !event.purok_ids?.length) return true;
    return user.purok_id !== null && event.purok_ids.includes(user.purok_id);
}

export function isAnnouncementVisibleTo(announcement: Announcement, user: User): boolean {
    if (announcement.target_all_puroks || !announcement.target_puroks?.length) return true;
    return user.purok_id !== null && announcement.target_puroks.includes(user.purok_id);
}

export function confirmedAttendances(db: DemoDatabase, eventId: number) {
    return db.attendances.filter((a) => a.event_id === eventId && a.status === 'confirmed');
}

/** Confirmed attendees who completed the event and gave feedback (they can see partner resources). */
export function eligibleForPartnerResources(db: DemoDatabase, eventId: number): number {
    return confirmedAttendances(db, eventId).filter(
        (a) => a.time_out_label === 'Completed' && db.feedback.some((f) => f.event_id === eventId && f.user_id === a.user_id),
    ).length;
}

/** Online = active within the last 5 minutes (the original isCurrentlyOnline()). */
export function isUserOnline(user: Pick<User, 'is_online' | 'last_seen_at'>, now = new Date()): boolean {
    const seen = toDate(user.last_seen_at);
    return user.is_online && !!seen && now.getTime() - seen.getTime() <= 5 * 60 * 1000;
}

/** Newest first by created_at, then id. */
export function latestFirst<T extends { created_at: string; id: number }>(rows: T[]): T[] {
    return [...rows].sort((a, b) => (a.created_at === b.created_at ? b.id - a.id : a.created_at < b.created_at ? 1 : -1));
}

/** Case-insensitive "LIKE %term%" over several fields. */
export function matchesSearch(term: string, ...values: (string | null | undefined)[]): boolean {
    const needle = term.trim().toLowerCase();
    if (!needle) return true;
    return values.some((v) => v?.toLowerCase().includes(needle));
}

/** Laravel paginator shape (per_page 10 by default, like the original controllers). */
export function paginate<T>(rows: T[], page: number, perPage = 10): Paginated<T> {
    const total = rows.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const current = Math.min(Math.max(1, Math.floor(page) || 1), lastPage);
    const start = (current - 1) * perPage;
    const data = rows.slice(start, start + perPage);
    return {
        data,
        current_page: current,
        last_page: lastPage,
        per_page: perPage,
        total,
        from: data.length ? start + 1 : null,
        to: data.length ? start + data.length : null,
    };
}

/** Public certificate page path; the QR code uses the absolute version. */
export function certificateViewPath(code: string): string {
    return `/resident/certificates/view/${encodeURIComponent(code)}`;
}

export function absoluteUrl(path: string): string {
    return typeof window === 'undefined' ? path : `${window.location.origin}${path}`;
}
