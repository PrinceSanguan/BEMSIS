// Event workflow: create/edit/delete (Secretary + Partner), approve/decline (Captain),
// partner resources (Secretary). Port of the event methods in the role controllers.

import { nextId } from '@/lib/domain/codes';
import { isEventEnded } from '@/lib/domain/queries';
import { eventApprovalMessage, eventRecipients, logSms } from '@/lib/domain/sms';
import { checkFile, nullable, Validator } from '@/lib/domain/validation';
import { fromDateTimeLocalInput, nowISO, toDate } from '@/lib/format';
import type { ActionResult, BarangayEvent, DemoDatabase } from '@/lib/types';
import { deleteStoredFile, storeFile } from '../files';
import { flash } from '../flash';
import { commit, getDb } from '../store';
import { fail, failWithFlash, NOT_ALLOWED, ok, requireRole } from './common';

export interface EventInput {
    title: string;
    description: string;
    venue: string;
    /** datetime-local value ("2026-10-14T06:00") or a stored date string */
    start_date: string;
    end_date: string;
    purok_ids: (number | string)[];
    has_certificate: boolean;
    target_all_residents: boolean;
}

const IMAGE_RULE = { types: ['jpeg', 'png', 'jpg', 'gif'], maxKb: 2048, typeMessage: 'The image field must be a file of type: jpeg, png, jpg, gif.' };

function validateEvent(db: DemoDatabase, input: EventInput, image: File | null, { isCreate }: { isCreate: boolean }) {
    const start = toDate(input.start_date);
    const end = toDate(input.end_date);
    const v = new Validator()
        .required('title', input.title)
        .maxLength('title', input.title, 255)
        .required('description', input.description)
        .maxLength('venue', input.venue, 255)
        .required('start_date', input.start_date)
        .check(!input.start_date || !!start, 'start_date', 'The start date field must be a valid date.')
        .check(!isCreate || !start || start > new Date(), 'start_date', 'The start date field must be a date after now.')
        .check(!input.end_date || !!end, 'end_date', 'The end date field must be a valid date.')
        .check(!end || !start || end > start, 'end_date', 'The end date field must be a date after start date.')
        .check(
            input.purok_ids.every((id) => db.puroks.some((p) => p.id === Number(id))),
            'purok_ids',
            'The selected purok ids is invalid.',
        );
    checkFile(v, 'image', image, IMAGE_RULE);
    return v;
}

function normalizedPuroks(input: EventInput): number[] | null {
    if (input.target_all_residents) return null;
    const ids = [...new Set(input.purok_ids.map(Number))].sort((a, b) => a - b);
    return ids.length ? ids : null;
}

/** Same venue, schedule and audience as an existing (not declined) event. */
function isDuplicate(db: DemoDatabase, input: EventInput, ignoreId?: number): boolean {
    const start = fromDateTimeLocalInput(input.start_date);
    const end = input.end_date ? fromDateTimeLocalInput(input.end_date) : null;
    const venue = (nullable(input.venue) ?? '').toLowerCase();
    const puroks = normalizedPuroks(input);
    return db.events.some((e) => {
        if (e.id === ignoreId || e.status === 'declined') return false;
        if (e.start_date !== start || (e.end_date ?? null) !== end || (e.venue ?? '').toLowerCase() !== venue) return false;
        if (input.target_all_residents) return e.target_all_residents;
        return !e.target_all_residents && JSON.stringify([...(e.purok_ids ?? [])].sort((a, b) => a - b)) === JSON.stringify(puroks ?? []);
    });
}

export async function createEvent(input: EventInput, image: File | null): Promise<ActionResult<{ id: number }>> {
    const user = requireRole('secretary', 'partner_agency');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const v = validateEvent(db, input, image, { isCreate: true });
    if (!v.passes) return fail(v.errors);
    if (isDuplicate(db, input)) {
        return fail({ duplicate: 'An event with the same venue, date, time, and participant type already exists. Please modify the event details.' });
    }

    const imagePath = image ? await storeFile(image) : null;
    const fresh = getDb();
    const now = nowISO();
    const event: BarangayEvent = {
        id: nextId(fresh.events),
        created_by: user.id,
        purok_ids: normalizedPuroks(input),
        target_all_residents: input.target_all_residents,
        title: input.title.trim(),
        description: input.description.trim(),
        venue: nullable(input.venue),
        image_path: imagePath,
        start_date: fromDateTimeLocalInput(input.start_date),
        end_date: input.end_date ? fromDateTimeLocalInput(input.end_date) : null,
        has_certificate: input.has_certificate,
        partner_feedback_link: null,
        partner_certificate_path: null,
        status: 'pending',
        reminder_sent: false,
        reminder_sent_at: null,
        created_at: now,
        updated_at: now,
    };
    commit({ ...fresh, events: [...fresh.events, event] });
    flash('success', 'Event created successfully! Awaiting captain approval.');
    return ok({ id: event.id });
}

export async function updateEvent(id: number, input: EventInput, image: File | null): Promise<ActionResult> {
    const user = requireRole('secretary', 'partner_agency');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const event = db.events.find((e) => e.id === id && e.created_by === user.id);
    if (!event) return failWithFlash('Event not found.');
    if (event.status !== 'pending') return failWithFlash('Cannot edit approved or declined events.');
    const v = validateEvent(db, input, image, { isCreate: false });
    if (!v.passes) return fail(v.errors);

    let imagePath = event.image_path;
    if (image) {
        await deleteStoredFile(event.image_path);
        imagePath = await storeFile(image);
    }
    const fresh = getDb();
    const updated: BarangayEvent = {
        ...event,
        title: input.title.trim(),
        description: input.description.trim(),
        venue: nullable(input.venue),
        start_date: fromDateTimeLocalInput(input.start_date),
        end_date: input.end_date ? fromDateTimeLocalInput(input.end_date) : null,
        purok_ids: normalizedPuroks(input),
        target_all_residents: input.target_all_residents,
        has_certificate: input.has_certificate,
        image_path: imagePath,
        updated_at: nowISO(),
    };
    commit({ ...fresh, events: fresh.events.map((e) => (e.id === id ? updated : e)) });
    flash('success', 'Event updated successfully!');
    return ok();
}

/** Removes the event and everything attached to it. */
async function removeEvent(event: BarangayEvent) {
    await deleteStoredFile(event.image_path);
    await deleteStoredFile(event.partner_certificate_path);
    const fresh = getDb();
    commit({
        ...fresh,
        events: fresh.events.filter((e) => e.id !== event.id),
        attendances: fresh.attendances.filter((a) => a.event_id !== event.id),
        feedback: fresh.feedback.filter((f) => f.event_id !== event.id),
        certificates: fresh.certificates.filter((c) => c.event_id !== event.id),
    });
}

/** Secretary: any event, unless it is approved and not over yet. */
export async function secretaryDeleteEvent(id: number): Promise<ActionResult> {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const event = db.events.find((e) => e.id === id);
    if (!event) return failWithFlash('Event not found.');
    if (event.status === 'approved' && !isEventEnded(event))
        return failWithFlash('Cannot delete approved events that are still ongoing or upcoming.');
    await removeEvent(event);
    flash('success', 'Event deleted successfully!');
    return ok();
}

/** Partner: own events that are not approved. */
export async function partnerDeleteEvent(id: number): Promise<ActionResult> {
    const user = requireRole('partner_agency');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const event = db.events.find((e) => e.id === id && e.created_by === user.id);
    if (!event) return failWithFlash('Event not found.');
    if (event.status === 'approved') return failWithFlash('Cannot delete approved events.');
    await removeEvent(event);
    flash('success', 'Event deleted successfully!');
    return ok();
}

export function approveEvent(id: number): ActionResult {
    if (!requireRole('captain')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const event = db.events.find((e) => e.id === id);
    if (!event) return failWithFlash('Event not found.');
    if (event.status !== 'pending') return failWithFlash('Event has already been processed.');
    const approved: BarangayEvent = { ...event, status: 'approved', reminder_sent: false, reminder_sent_at: null, updated_at: nowISO() };
    const recipients = eventRecipients(db, approved);
    commit({
        ...db,
        events: db.events.map((e) => (e.id === id ? approved : e)),
        sms_logs: logSms(
            db,
            recipients.map((user) => ({ user, message: eventApprovalMessage(user, approved) })),
        ),
    });
    flash(
        'success',
        `Event '${event.title}' has been approved successfully! (SMS simulated to ${recipients.length} resident${recipients.length === 1 ? '' : 's'})`,
    );
    return ok();
}

export function declineEvent(id: number): ActionResult {
    if (!requireRole('captain')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const event = db.events.find((e) => e.id === id);
    if (!event) return failWithFlash('Event not found.');
    if (event.status !== 'pending') return failWithFlash('Event has already been processed.');
    commit({ ...db, events: db.events.map((e) => (e.id === id ? { ...e, status: 'declined' as const, updated_at: nowISO() } : e)) });
    flash('success', `Event '${event.title}' has been declined.`);
    return ok();
}

const CERTIFICATE_RULE = {
    types: ['pdf', 'jpg', 'jpeg', 'png'],
    maxKb: 5120,
    typeMessage: 'The partner certificate field must be a file of type: pdf, jpg, jpeg, png.',
};

export async function uploadPartnerResources(id: number, link: string, certificate: File | null): Promise<ActionResult> {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const event = db.events.find((e) => e.id === id);
    if (!event) return failWithFlash('Event not found.');
    const trimmed = nullable(link);
    const v = new Validator().url('partner_feedback_link', trimmed).maxLength('partner_feedback_link', trimmed, 500);
    checkFile(v, 'partner_certificate', certificate, CERTIFICATE_RULE);
    if (!v.passes) return fail(v.errors);
    if (!trimmed && !certificate) return failWithFlash('No resources were provided to update.');

    let certificatePath = event.partner_certificate_path;
    if (certificate) {
        await deleteStoredFile(event.partner_certificate_path);
        certificatePath = await storeFile(certificate);
    }
    const fresh = getDb();
    commit({
        ...fresh,
        events: fresh.events.map((e) =>
            e.id === id
                ? { ...e, partner_feedback_link: trimmed ?? e.partner_feedback_link, partner_certificate_path: certificatePath, updated_at: nowISO() }
                : e,
        ),
    });
    flash('success', 'Partner resources updated successfully!');
    return ok();
}

export function removePartnerFeedbackLink(id: number): ActionResult {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    commit({ ...db, events: db.events.map((e) => (e.id === id ? { ...e, partner_feedback_link: null, updated_at: nowISO() } : e)) });
    flash('success', 'Partner feedback link removed successfully!');
    return ok();
}

export async function removePartnerCertificate(id: number): Promise<ActionResult> {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const event = getDb().events.find((e) => e.id === id);
    await deleteStoredFile(event?.partner_certificate_path);
    const db = getDb();
    commit({ ...db, events: db.events.map((e) => (e.id === id ? { ...e, partner_certificate_path: null, updated_at: nowISO() } : e)) });
    flash('success', 'Partner certificate removed successfully!');
    return ok();
}
