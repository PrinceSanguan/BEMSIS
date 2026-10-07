// Page data for the Secretary area: each function returns the same props the matching
// SecretaryController method passed to Inertia::render().

import {
    confirmedAttendances,
    eventPuroks,
    eventWithCreator,
    findPurok,
    findUser,
    isUserOnline,
    latestFirst,
    matchesSearch,
    paginate,
    publicUser,
    purokNames,
    puroksByName,
} from '@/lib/domain/queries';
import type { DemoDatabase, User } from '@/lib/types';

/** SecretaryController@index */
export function secretaryDashboardProps(db: DemoDatabase) {
    return {
        stats: {
            pendingUsers: db.users.filter((u) => u.status === 'pending').length,
            pendingEvents: db.events.filter((e) => e.status === 'pending').length,
            totalAttendees: db.attendances.filter((a) => a.status === 'confirmed').length,
            certificatesIssued: db.certificates.length,
        },
    };
}

export interface SecretaryUsersFilters {
    search: string;
    purok_id: string;
    users_page: string;
    partners_page: string;
}

/** SecretaryController@users */
export function secretaryUsersProps(db: DemoDatabase, filters: SecretaryUsersFilters) {
    const search = filters.search ?? '';
    const purokId = filters.purok_id || 'all';

    const pendingUsers = latestFirst(db.users.filter((u) => u.status === 'pending')).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        status: u.status,
        is_active: u.is_active,
        purok: findPurok(db, u.purok_id),
        created_at: u.created_at,
        updated_at: u.updated_at,
    }));

    const residents = db.users.filter(
        (u) =>
            u.status === 'approved' &&
            u.role === 'resident' &&
            matchesSearch(search, u.name, u.email, u.first_name, u.last_name) &&
            (purokId === 'all' || u.purok_id === Number(purokId)),
    );
    const partners = db.users.filter((u) => u.status === 'approved' && u.role === 'partner_agency');

    return {
        pendingUsers,
        approvedUsers: paginate(
            residents.map((u) => publicUser(db, u)),
            Number(filters.users_page) || 1,
        ),
        approvedPartners: paginate(
            partners.map((u) => publicUser(db, u)),
            Number(filters.partners_page) || 1,
        ),
        puroks: puroksByName(db),
        filters: { search, purok_id: purokId },
    };
}

/** SecretaryController@userDetail. `is_online` is the live value the old /api/users/{id}/status poll returned. */
export function secretaryUserDetailProps(db: DemoDatabase, userId: number, now = new Date()) {
    const user = findUser(db, userId);
    return { user: user ? { ...publicUser(db, user), is_online: isUserOnline(user, now) } : null };
}

/** SecretaryController@events: pending + approved events from every creator, newest first. */
export function secretaryEventsProps(db: DemoDatabase, filters: { search: string; purok_id: string }) {
    const search = filters.search ?? '';
    const purokId = filters.purok_id || 'all';

    const events = latestFirst(
        db.events.filter(
            (e) =>
                (e.status === 'pending' || e.status === 'approved') &&
                matchesSearch(search, e.title, e.description) &&
                (purokId === 'all' || e.target_all_residents || !e.purok_ids?.length || e.purok_ids.includes(Number(purokId))),
        ),
    ).map((e) => ({
        ...eventWithCreator(db, e),
        attendances: db.attendances.filter((a) => a.event_id === e.id),
        confirmed_attendees_count: confirmedAttendances(db, e.id).length,
        puroks: eventPuroks(db, e),
        purok_names: purokNames(db, e),
    }));

    return { events, puroks: db.puroks, filters: { search, purok_id: purokId } };
}
export type SecretaryEventRow = ReturnType<typeof secretaryEventsProps>['events'][number];

/** SecretaryController@editEvent: only the secretary's own pending events can be edited. */
export function secretaryEditEventProps(db: DemoDatabase, user: User, eventId: number) {
    const event = db.events.find((e) => e.id === eventId && e.created_by === user.id) ?? null;
    const error = !event ? 'Event not found.' : event.status !== 'pending' ? 'Cannot edit approved or declined events.' : null;
    return { event: error ? null : event, puroks: db.puroks, error };
}
