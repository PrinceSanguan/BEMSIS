// Page data for the Captain area: each function returns the same props the matching
// CaptainController method passed to Inertia::render().

import {
    eventPurokSummary,
    eventWithCreator,
    findUser,
    isUserOnline,
    latestFirst,
    matchesSearch,
    paginate,
    publicUser,
    puroksByName,
} from '@/lib/domain/queries';
import type { DemoDatabase } from '@/lib/types';

/** CaptainController@index */
export function captainDashboardProps(db: DemoDatabase) {
    const count = (status: string) => db.events.filter((e) => e.status === status).length;
    return {
        stats: {
            pendingEvents: count('pending'),
            approvedEvents: count('approved'),
            declinedEvents: count('declined'),
            totalEvents: db.events.length,
        },
        approvedEvents: latestFirst(db.events.filter((e) => e.status === 'approved'))
            .slice(0, 5)
            .map((event) => eventWithCreator(db, event)),
    };
}

/** CaptainController@events */
export function captainEventsProps(db: DemoDatabase) {
    return {
        pendingEvents: latestFirst(db.events.filter((e) => e.status === 'pending')).map((event) => ({
            ...eventWithCreator(db, event),
            purok: eventPurokSummary(db, event),
        })),
    };
}
export type CaptainPendingEvent = ReturnType<typeof captainEventsProps>['pendingEvents'][number];

export interface CaptainUserFilters {
    search: string;
    purok_id: string;
    residents_page: string;
    partners_page: string;
}

/** CaptainController@users */
export function captainUsersProps(db: DemoDatabase, filters: CaptainUserFilters) {
    const purokId = filters.purok_id && filters.purok_id !== 'all' ? filters.purok_id : null;

    const residents = latestFirst(
        db.users.filter(
            (u) =>
                u.role === 'resident' &&
                u.status === 'approved' &&
                matchesSearch(filters.search, u.name, u.email, u.first_name, u.last_name) &&
                (purokId === null || String(u.purok_id) === purokId),
        ),
    ).map((u) => publicUser(db, u));

    const partners = latestFirst(db.users.filter((u) => u.role === 'partner_agency' && u.status === 'approved')).map((u) => publicUser(db, u));

    return {
        residents: paginate(residents, Number(filters.residents_page) || 1),
        partners: paginate(partners, Number(filters.partners_page) || 1),
        puroks: puroksByName(db),
        filters: {
            search: filters.search,
            purok_id: filters.purok_id || 'all',
        },
    };
}

/** CaptainController@userDetail (null when the user does not exist). */
export function captainUserDetailProps(db: DemoDatabase, userId: number) {
    const user = findUser(db, userId);
    return user ? { user: publicUser(db, user) } : null;
}

/** Api\UserStatusController@getUserStatus, which the details page polled every 30 seconds. */
export function userStatus(db: DemoDatabase, userId: number, now: Date) {
    const user = findUser(db, userId);
    return { is_online: user ? isUserOnline(user, now) : false, last_seen_at: user?.last_seen_at ?? null };
}
