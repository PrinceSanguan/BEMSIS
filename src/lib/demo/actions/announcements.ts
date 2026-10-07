// Secretary announcements (port of SecretaryController announcement methods).

import { nextId } from '@/lib/domain/codes';
import { announcementMessage, logSms } from '@/lib/domain/sms';
import { Validator } from '@/lib/domain/validation';
import { nowISO } from '@/lib/format';
import type { ActionResult, DemoDatabase } from '@/lib/types';
import { flash } from '../flash';
import { commit, getDb } from '../store';
import { fail, failWithFlash, NOT_ALLOWED, ok, requireRole } from './common';

export interface AnnouncementInput {
    title: string;
    content: string;
    target_puroks: (number | string)[];
    target_all_puroks: boolean;
}

function validate(db: DemoDatabase, input: AnnouncementInput) {
    return new Validator()
        .required('title', input.title)
        .maxLength('title', input.title, 255)
        .required('content', input.content)
        .check(
            input.target_puroks.every((id) => db.puroks.some((p) => p.id === Number(id))),
            'target_puroks',
            'The selected target puroks is invalid.',
        );
}

const targets = (input: AnnouncementInput) => (input.target_all_puroks ? null : [...new Set(input.target_puroks.map(Number))].sort((a, b) => a - b));

export function createAnnouncement(input: AnnouncementInput): ActionResult {
    const user = requireRole('secretary');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const v = validate(db, input);
    if (!v.passes) return fail(v.errors);
    const now = nowISO();
    const target = targets(input);
    const recipients = db.users.filter(
        (u) =>
            u.role === 'resident' &&
            u.status === 'approved' &&
            !!u.phone &&
            (!target?.length || (u.purok_id !== null && target.includes(u.purok_id))),
    );
    commit({
        ...db,
        announcements: [
            ...db.announcements,
            {
                id: nextId(db.announcements),
                created_by: user.id,
                title: input.title.trim(),
                content: input.content.trim(),
                target_puroks: target,
                target_all_puroks: input.target_all_puroks,
                created_at: now,
                updated_at: now,
            },
        ],
        sms_logs: logSms(
            db,
            recipients.map((r) => ({ user: r, message: announcementMessage(r, input.title.trim(), input.content.trim()) })),
        ),
    });
    flash('success', `Announcement created successfully! (SMS simulated to ${recipients.length} resident${recipients.length === 1 ? '' : 's'})`);
    return ok();
}

export function updateAnnouncement(id: number, input: AnnouncementInput): ActionResult {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    if (!db.announcements.some((a) => a.id === id)) return failWithFlash('Announcement not found.');
    const v = validate(db, input);
    if (!v.passes) return fail(v.errors);
    commit({
        ...db,
        announcements: db.announcements.map((a) =>
            a.id === id
                ? {
                      ...a,
                      title: input.title.trim(),
                      content: input.content.trim(),
                      target_puroks: targets(input),
                      target_all_puroks: input.target_all_puroks,
                      updated_at: nowISO(),
                  }
                : a,
        ),
    });
    flash('success', 'Announcement updated successfully!');
    return ok();
}

export function deleteAnnouncement(id: number): ActionResult {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    commit({ ...db, announcements: db.announcements.filter((a) => a.id !== id) });
    flash('success', 'Announcement deleted successfully!');
    return ok();
}
