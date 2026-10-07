// Page data for the Secretary attendance, feedback and announcement pages: each function returns the same
// props the matching SecretaryController method passed to Inertia::render() (or returned as JSON).

import {
    confirmedAttendances,
    eligibleForPartnerResources,
    eventWithCreator,
    findEvent,
    findUser,
    latestFirst,
    publicUser,
} from '@/lib/domain/queries';
import { formatDateTime24 } from '@/lib/format';
import type { DemoDatabase } from '@/lib/types';

/** SecretaryController@eventAttendees (null when the event does not exist: the old findOrFail 404). */
export function secretaryEventAttendeesProps(db: DemoDatabase, eventId: number) {
    const event = findEvent(db, eventId);
    if (!event) return null;
    const attendees = confirmedAttendances(db, eventId).flatMap((attendance) => {
        const user = findUser(db, attendance.user_id);
        if (!user) return [];
        return [
            {
                id: attendance.id,
                user: publicUser(db, user),
                qr_code: attendance.qr_code,
                time_in: attendance.time_in,
                time_in_label: attendance.time_in_label,
                time_out: attendance.time_out,
                time_out_label: attendance.time_out_label,
            },
        ];
    });
    return {
        event: eventWithCreator(db, event),
        attendees,
        eligibleForPartnerResources: eligibleForPartnerResources(db, eventId),
    };
}
export type SecretaryEventAttendeesProps = NonNullable<ReturnType<typeof secretaryEventAttendeesProps>>;
export type SecretaryAttendee = SecretaryEventAttendeesProps['attendees'][number];

/** SecretaryController@attendance */
export function secretaryAttendanceProps(db: DemoDatabase) {
    const events = latestFirst(db.events.filter((e) => e.status === 'approved')).map((event) => {
        const attendances = confirmedAttendances(db, event.id);
        const totalConfirmed = attendances.length;
        const totalScanned = attendances.filter((a) => a.time_in !== null).length;
        return {
            ...eventWithCreator(db, event),
            attendances,
            total_confirmed: totalConfirmed,
            total_scanned: totalScanned,
            completed_count: attendances.filter((a) => a.time_out_label === 'Completed').length,
            attendance_rate: totalConfirmed > 0 ? Math.round((totalScanned / totalConfirmed) * 100 * 100) / 100 : 0,
        };
    });
    return { events };
}
export type SecretaryAttendanceEvent = ReturnType<typeof secretaryAttendanceProps>['events'][number];

/** SecretaryController@feedback */
export function secretaryFeedbackProps(db: DemoDatabase) {
    const events = latestFirst(db.events)
        .map((event) => ({ event, count: db.feedback.filter((f) => f.event_id === event.id).length }))
        .filter(({ count }) => count > 0)
        .map(({ event, count }) => {
            const creator = findUser(db, event.created_by);
            return {
                id: event.id,
                title: event.title,
                description: event.description,
                start_date: event.start_date,
                end_date: event.end_date,
                creator: creator ? publicUser(db, creator) : null,
                feedbacks_count: count,
                status: event.status,
            };
        });
    return { events };
}
export type SecretaryFeedbackEvent = ReturnType<typeof secretaryFeedbackProps>['events'][number];

/** SecretaryController@getEventFeedback (the JSON the Feedback page used to fetch). */
export function secretaryEventFeedback(db: DemoDatabase, eventId: number) {
    const event = findEvent(db, eventId);
    if (!event) return null;
    const feedbacks = latestFirst(db.feedback.filter((f) => f.event_id === eventId)).flatMap((feedback) => {
        const user = findUser(db, feedback.user_id);
        if (!user) return [];
        return [
            {
                id: feedback.id,
                comments: feedback.comments,
                rating: feedback.rating ?? null,
                created_at: feedback.created_at,
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
            },
        ];
    });
    return { event: eventWithCreator(db, event), feedbacks };
}
export type SecretaryEventFeedback = NonNullable<ReturnType<typeof secretaryEventFeedback>>['feedbacks'][number];

/** SecretaryController@announcements */
export function secretaryAnnouncementsProps(db: DemoDatabase) {
    return {
        announcements: latestFirst(db.announcements).map((announcement) => ({
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            target_puroks: announcement.target_puroks,
            target_all_puroks: announcement.target_all_puroks,
            created_by: findUser(db, announcement.created_by)?.name ?? 'Unknown',
            created_at: formatDateTime24(announcement.created_at),
        })),
        puroks: [...db.puroks].sort((a, b) => a.id - b.id),
    };
}
export type SecretaryAnnouncement = ReturnType<typeof secretaryAnnouncementsProps>['announcements'][number];
