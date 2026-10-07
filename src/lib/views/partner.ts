// Page data for the Partner area: each function returns the same props the matching
// PartnerController method passed to Inertia::render(). Everything is scoped to events the partner created.

import { eventPurokSummary, latestFirst } from '@/lib/domain/queries';
import type { DemoDatabase, User } from '@/lib/types';

/** PartnerController@index */
export function partnerDashboardProps(db: DemoDatabase, user: User) {
    const mine = db.events.filter((e) => e.created_by === user.id);
    return {
        stats: {
            myEvents: mine.length,
            pendingEvents: mine.filter((e) => e.status === 'pending').length,
            approvedEvents: mine.filter((e) => e.status === 'approved').length,
            declinedEvents: mine.filter((e) => e.status === 'declined').length,
        },
    };
}

/** PartnerController@events */
export function partnerEventsProps(db: DemoDatabase, user: User) {
    const events = latestFirst(db.events.filter((e) => e.created_by === user.id)).map((event) => {
        const attendances = db.attendances.filter((a) => a.event_id === event.id);
        return {
            ...event,
            attendances,
            confirmed_attendees_count: attendances.filter((a) => a.status === 'confirmed').length,
            purok: eventPurokSummary(db, event),
        };
    });
    return { events, puroks: db.puroks };
}

/** PartnerController@editEvent: the partner's own event (null when it is missing or belongs to someone else). */
export function partnerEditEventProps(db: DemoDatabase, user: User, eventId: number) {
    return {
        event: db.events.find((e) => e.id === eventId && e.created_by === user.id) ?? null,
        puroks: db.puroks,
    };
}

/** PartnerController@profile */
export function partnerProfileProps(user: User) {
    return {
        user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
        },
    };
}
