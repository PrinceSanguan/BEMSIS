// Page data for the resident events, attendance, certificates and feedback pages: each function returns
// the same props the matching ResidentController method passed to Inertia::render().

import {
    certificateViewPath,
    confirmedAttendances,
    eventWithCreator,
    findEvent,
    findUser,
    isEventEnded,
    isEventVisibleTo,
    latestFirst,
    purokNames,
} from '@/lib/domain/queries';
import { formatDateLong, toDate } from '@/lib/format';
import type { DemoDatabase, User } from '@/lib/types';

/** ResidentController@events: approved upcoming events for everyone or for the resident's purok. */
export function residentEventsProps(db: DemoDatabase, user: User, now = new Date()) {
    const events = db.events
        .filter((event) => event.status === 'approved' && isEventVisibleTo(event, user) && (toDate(event.start_date) ?? new Date(0)) >= now)
        .sort((a, b) => (a.start_date === b.start_date ? a.id - b.id : a.start_date < b.start_date ? -1 : 1))
        .map((event) => {
            const attendances = db.attendances.filter((a) => a.event_id === event.id && a.user_id === user.id);
            const userAttendance = attendances[0] ?? null;
            return {
                ...eventWithCreator(db, event),
                attendances,
                user_registered: !!userAttendance,
                registration_status: userAttendance?.status ?? null,
                current_attendees: confirmedAttendances(db, event.id).length,
                purok_names: purokNames(db, event),
            };
        });
    return { events };
}
export type ResidentEvent = ReturnType<typeof residentEventsProps>['events'][number];

/** ResidentController@attendance: confirmed registrations for events that have not ended, and the history of ended ones. */
export function residentAttendanceProps(db: DemoDatabase, user: User, now = new Date()) {
    const mine = db.attendances.filter((a) => a.user_id === user.id);

    const confirmedEvents = mine
        .filter((a) => a.status === 'confirmed')
        .flatMap((attendance) => {
            const event = findEvent(db, attendance.event_id);
            if (!event || isEventEnded(event, now)) return [];
            return [
                {
                    id: attendance.id,
                    event: { ...event, purok_names: purokNames(db, event) },
                    // The original generated missing codes here; the QR dialog now does that through ensureQrCode().
                    qr_code: attendance.qr_code,
                    has_qr: true,
                    time_in: attendance.time_in,
                    time_in_label: attendance.time_in_label,
                    time_out: attendance.time_out,
                    time_out_label: attendance.time_out_label,
                },
            ];
        });

    const attendanceHistory = mine.flatMap((attendance) => {
        const event = findEvent(db, attendance.event_id);
        if (!event || !isEventEnded(event, now)) return [];
        return [
            {
                id: attendance.id,
                event: { ...event, purok_names: purokNames(db, event) },
                status: (attendance.time_in ? 'attended' : 'missed') as 'attended' | 'missed',
                time_in: attendance.time_in,
                time_in_label: attendance.time_in_label,
                time_out: attendance.time_out,
                time_out_label: attendance.time_out_label,
            },
        ];
    });

    return { confirmedEvents, attendanceHistory };
}
export type ResidentAttendanceProps = ReturnType<typeof residentAttendanceProps>;

/** ResidentController@certificates: partner resources only show once the resident completed the event and gave feedback. */
export function residentCertificatesProps(db: DemoDatabase, user: User) {
    const certificates = latestFirst(db.certificates.filter((c) => c.user_id === user.id)).flatMap((certificate) => {
        const event = findEvent(db, certificate.event_id);
        if (!event) return [];
        const hasCompletedAttendance = db.attendances.some(
            (a) => a.event_id === certificate.event_id && a.user_id === certificate.user_id && !!a.time_out && a.time_out_label === 'Completed',
        );
        const hasSubmittedFeedback = db.feedback.some((f) => f.event_id === certificate.event_id && f.user_id === certificate.user_id);
        const canAccessPartnerResources = hasCompletedAttendance && hasSubmittedFeedback;
        return [
            {
                id: certificate.id,
                event_name: event.title,
                date_earned: certificate.created_at.slice(0, 10),
                type: 'Completion Certificate',
                status: 'available' as string,
                file_path: certificate.file_path,
                certificate_code: certificate.certificate_code,
                view_url: certificateViewPath(certificate.certificate_code),
                partner_feedback_link: canAccessPartnerResources ? event.partner_feedback_link : null,
                partner_certificate_path: canAccessPartnerResources ? event.partner_certificate_path : null,
            },
        ];
    });
    return { certificates };
}
export type ResidentCertificate = ReturnType<typeof residentCertificatesProps>['certificates'][number];

/** ResidentController@feedback */
export function residentFeedbackProps(db: DemoDatabase, user: User) {
    const hasFeedback = (eventId: number) => db.feedback.some((f) => f.event_id === eventId && f.user_id === user.id);

    const eventsNeedingFeedback = db.attendances
        .filter((a) => a.user_id === user.id && a.time_in && a.time_out && a.time_out_label === 'Completed' && !hasFeedback(a.event_id))
        .flatMap((attendance) => {
            const event = findEvent(db, attendance.event_id);
            if (!event) return [];
            return [
                {
                    id: event.id,
                    event_name: event.title,
                    date: event.start_date,
                    has_certificate: event.has_certificate,
                    attendance_id: attendance.id,
                },
            ];
        });

    const feedbackHistory = latestFirst(db.feedback.filter((f) => f.user_id === user.id)).flatMap((feedback) => {
        const event = findEvent(db, feedback.event_id);
        if (!event) return [];
        return [
            {
                id: feedback.id,
                event_name: event.title,
                date: event.start_date,
                comment: feedback.comments,
                submitted_date: feedback.created_at.slice(0, 10),
                rating: feedback.rating ?? null,
            },
        ];
    });

    return { eventsNeedingFeedback, feedbackHistory };
}
export type EventNeedingFeedback = ReturnType<typeof residentFeedbackProps>['eventsNeedingFeedback'][number];

export interface CertificateProps {
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventDuration: string;
    certificateCode: string;
    autoDownload: boolean;
}

/** ResidentController@viewCertificate (public: the code itself is the access check). Null when the code is unknown. */
export function certificateViewProps(db: DemoDatabase, certificateCode: string, autoDownload: boolean): CertificateProps | null {
    const certificate = db.certificates.find((c) => c.certificate_code === certificateCode);
    const user = findUser(db, certificate?.user_id);
    const event = findEvent(db, certificate?.event_id);
    if (!certificate || !user || !event) return null;

    const start = toDate(event.start_date) ?? new Date(0);
    const end = toDate(event.end_date) ?? start;
    const hours = Math.round((Math.max(0, end.getTime() - start.getTime()) / 3_600_000) * 10) / 10;

    return {
        userName: user.name,
        eventTitle: event.title,
        eventDate: formatDateLong(start),
        eventDuration: `${hours} hours`,
        certificateCode,
        autoDownload,
    };
}

/** ResidentController@previewCertificate */
export function certificatePreviewProps(now = new Date()): CertificateProps {
    return {
        userName: 'Juan Dela Cruz',
        eventTitle: 'Sample Community Event',
        eventDate: formatDateLong(now),
        eventDuration: '4 hours',
        certificateCode: 'CERT-CT-2025-00001',
        autoDownload: false,
    };
}
