// Event registration, QR attendance scanning, feedback and certificates.
// Port of ResidentController (register/unregister/feedback) and SecretaryController@scanQrCode.

import { differenceInMinutes } from 'date-fns';
import { attendanceQrCode, certificateCode, nextId } from '@/lib/domain/codes';
import { certificateViewPath, isEventEnded, isEventVisibleTo } from '@/lib/domain/queries';
import { Validator } from '@/lib/domain/validation';
import { siteConfig } from '@/lib/site';
import { nowISO, toDate } from '@/lib/format';
import type { ActionResult, Attendance, Certificate, DemoDatabase } from '@/lib/types';
import { flash } from '../flash';
import { commit, getDb } from '../store';
import { fail, failWithFlash, NOT_ALLOWED, ok, requireRole } from './common';

export function registerForEvent(eventId: number): ActionResult {
    const user = requireRole('resident');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    if (db.attendances.some((a) => a.event_id === eventId && a.user_id === user.id))
        return failWithFlash('You are already registered for this event.');
    const event = db.events.find((e) => e.id === eventId);
    if (!event || event.status !== 'approved' || !isEventVisibleTo(event, user) || isEventEnded(event)) {
        return failWithFlash('This event is not open for registration.');
    }
    const now = nowISO();
    const attendance: Attendance = {
        id: nextId(db.attendances),
        event_id: eventId,
        user_id: user.id,
        status: 'confirmed',
        qr_code: attendanceQrCode(eventId, user.id),
        time_in: null,
        time_in_label: null,
        time_out: null,
        time_out_label: null,
        created_at: now,
        updated_at: now,
    };
    commit({ ...db, attendances: [...db.attendances, attendance] });
    flash('success', 'Successfully registered for the event!');
    return ok();
}

export function unregisterFromEvent(eventId: number): ActionResult {
    const user = requireRole('resident');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const attendance = db.attendances.find((a) => a.event_id === eventId && a.user_id === user.id);
    if (!attendance) return failWithFlash('You are not registered for this event.');
    if (attendance.time_in) return failWithFlash('You can no longer unregister after your attendance was recorded.');
    commit({ ...db, attendances: db.attendances.filter((a) => a.id !== attendance.id) });
    flash('success', 'Successfully unregistered from the event!');
    return ok();
}

/** Makes sure the resident's confirmed attendance has a QR code (generated lazily, as in the original). */
export function ensureQrCode(attendanceId: number): ActionResult<{ qr_code: string }> {
    const user = requireRole('resident');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const attendance = db.attendances.find((a) => a.id === attendanceId && a.user_id === user.id && a.status === 'confirmed');
    if (!attendance) return fail({ error: 'Attendance record not found' });
    if (attendance.qr_code) return ok({ qr_code: attendance.qr_code });
    const qr = attendanceQrCode(attendance.event_id, user.id);
    commit({ ...db, attendances: db.attendances.map((a) => (a.id === attendanceId ? { ...a, qr_code: qr, updated_at: nowISO() } : a)) });
    return ok({ qr_code: qr });
}

/** Secretary scan: first scan records Time-In (On-Time/Late), the second records Time-Out. */
export function scanQrCode(code: string): ActionResult<{ message: string }> {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const qr = code.trim();
    if (!qr) return fail({ qr_code: 'The qr code field is required.' });
    const db = getDb();
    const attendance = db.attendances.find((a) => a.qr_code === qr);
    if (!attendance) return failWithFlash('Invalid QR code');
    const event = db.events.find((e) => e.id === attendance.event_id);
    const resident = db.users.find((u) => u.id === attendance.user_id);
    if (!event || !resident) return failWithFlash('Invalid QR code');
    if (event.status !== 'approved') return failWithFlash('This event has not been approved yet.');
    if (isEventEnded(event)) return failWithFlash('The event is already expired');

    const now = new Date();
    const nowString = nowISO();
    let message: string;
    let updated: Attendance;
    if (!attendance.time_in) {
        // Arriving early counts as on time (the original labelled early scans "Late").
        const minutesAfterStart = differenceInMinutes(now, toDate(event.start_date) ?? now);
        const label = minutesAfterStart <= siteConfig.late_threshold_minutes ? 'On-Time' : 'Late';
        updated = { ...attendance, time_in: nowString, time_in_label: label, updated_at: nowString };
        message =
            label === 'On-Time' ? `✅ Time-In recorded for ${resident.name} - On-Time!` : `⏰ Time-In recorded for ${resident.name} - Late arrival`;
    } else if (!attendance.time_out) {
        updated = { ...attendance, time_out: nowString, time_out_label: 'Completed', updated_at: nowString };
        message = `✅ Time-Out recorded for ${resident.name} - Event Completed! You can now submit feedback.`;
    } else {
        return failWithFlash('Attendance already fully recorded (Time-In & Time-Out)');
    }
    commit({ ...db, attendances: db.attendances.map((a) => (a.id === attendance.id ? updated : a)) });
    flash('success', message);
    return ok({ message });
}

function issueCertificate(db: DemoDatabase, eventId: number, userId: number): { db: DemoDatabase; certificate: Certificate } {
    const existing = db.certificates.find((c) => c.event_id === eventId && c.user_id === userId);
    if (existing) return { db, certificate: existing };
    const now = nowISO();
    const certificate: Certificate = {
        id: nextId(db.certificates),
        event_id: eventId,
        user_id: userId,
        certificate_code: certificateCode(),
        file_path: `certificates/${eventId}_${userId}.pdf`,
        created_at: now,
        updated_at: now,
    };
    return { db: { ...db, certificates: [...db.certificates, certificate] }, certificate };
}

export interface CertificateData {
    code: string;
    view_url: string;
}

export function submitFeedback(input: { event_id: number | string; comments: string; rating: number | string | null }): ActionResult<{
    certificate: CertificateData | null;
}> {
    const user = requireRole('resident');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const eventId = Number(input.event_id);
    const event = db.events.find((e) => e.id === eventId);
    const rating = input.rating === null || input.rating === '' || input.rating === 0 ? null : Number(input.rating);
    const v = new Validator()
        .required('event_id', input.event_id)
        .check(!input.event_id || !!event, 'event_id', 'The selected event id is invalid.')
        .required('comments', input.comments)
        .maxLength('comments', input.comments, 1000)
        .integerBetween('rating', rating, 1, 5);
    if (!v.passes) return fail(v.errors);

    const completed = db.attendances.some((a) => a.event_id === eventId && a.user_id === user.id && a.time_in && a.time_out_label === 'Completed');
    if (!completed) return failWithFlash('You can only give feedback for events you completed.');
    if (db.feedback.some((f) => f.event_id === eventId && f.user_id === user.id))
        return failWithFlash('You already submitted feedback for this event.');

    const now = nowISO();
    let next: DemoDatabase = {
        ...db,
        feedback: [
            ...db.feedback,
            {
                id: nextId(db.feedback),
                event_id: eventId,
                user_id: user.id,
                comments: input.comments.trim(),
                rating,
                created_at: now,
                updated_at: now,
            },
        ],
    };
    let certificate: CertificateData | null = null;
    if (event!.has_certificate) {
        const issued = issueCertificate(next, eventId, user.id);
        next = issued.db;
        certificate = { code: issued.certificate.certificate_code, view_url: certificateViewPath(issued.certificate.certificate_code) };
    }
    commit(next);
    flash('success', certificate ? 'Feedback submitted successfully! Your certificate is now available.' : 'Feedback submitted successfully!');
    return ok({ certificate });
}
