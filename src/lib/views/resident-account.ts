// Page data for the Resident dashboard, announcements and profile: each function returns the same
// props the matching ResidentController method passed to Inertia::render().

import { certificateViewPath, findEvent, findUser, isAnnouncementVisibleTo, isEventVisibleTo, latestFirst } from '@/lib/domain/queries';
import { formatDate, formatDateTime24, toDate } from '@/lib/format';
import type { DemoDatabase, User } from '@/lib/types';

/** ResidentController@index */
export function residentDashboardProps(db: DemoDatabase, user: User, now = new Date()) {
    const myAttendances = db.attendances.filter((a) => a.user_id === user.id);
    const myCertificates = db.certificates.filter((c) => c.user_id === user.id);

    const stats = {
        eventsAttended: myAttendances.filter((a) => a.time_in !== null).length,
        qrCodesGenerated: myAttendances.filter((a) => a.status === 'confirmed' && a.qr_code !== null).length,
        certificatesEarned: myCertificates.length,
        feedbackSubmitted: db.feedback.filter((f) => f.user_id === user.id).length,
    };

    const upcomingEvents = db.events
        .filter((e) => e.status === 'approved' && (toDate(e.start_date) ?? new Date(0)) >= now && isEventVisibleTo(e, user))
        .sort((a, b) => (a.start_date === b.start_date ? a.id - b.id : a.start_date < b.start_date ? -1 : 1))
        .slice(0, 5)
        .map((event) => {
            const attendances = myAttendances.filter((a) => a.event_id === event.id);
            return {
                ...event,
                attendances,
                registration_status: attendances.length > 0 ? attendances[0].status : 'available',
            };
        });

    const recentCertificates = latestFirst(myCertificates)
        .slice(0, 3)
        .map((certificate) => ({
            id: certificate.id,
            event_name: findEvent(db, certificate.event_id)?.title ?? '',
            date_earned: formatDate(certificate.created_at),
            certificate_code: certificate.certificate_code,
            view_url: certificate.certificate_code ? certificateViewPath(certificate.certificate_code) : null,
        }));

    return { stats, upcomingEvents, recentCertificates };
}

/** ResidentController@announcements: community-wide ones plus those for the resident's purok, newest first. */
export function residentAnnouncementsProps(db: DemoDatabase, user: User) {
    return {
        announcements: latestFirst(db.announcements.filter((a) => isAnnouncementVisibleTo(a, user))).map((announcement) => ({
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            created_by: findUser(db, announcement.created_by)?.name ?? '',
            created_at: formatDateTime24(announcement.created_at),
            target_scope: announcement.target_all_puroks ? 'All Puroks' : 'Specific Puroks',
        })),
    };
}

/** ResidentController@profile */
export function residentProfileProps(user: User) {
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
