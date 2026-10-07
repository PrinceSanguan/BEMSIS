// The JSON files in /data are the read-only seed for the demo database.

import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import announcements from '@data/announcements.json';
import attendances from '@data/attendances.json';
import certificates from '@data/certificates.json';
import events from '@data/events.json';
import feedback from '@data/feedback.json';
import puroks from '@data/puroks.json';
import site from '@data/site.json';
import users from '@data/users.json';
import { toISODate, toISODateTime } from '@/lib/format';
import { siteConfig } from '@/lib/site';
import type { DemoDatabase } from '@/lib/types';
import { runDailyJobs } from './jobs';

export { siteConfig };

/** The seed exactly as written in /data (used for server rendering and before the browser state loads). */
export const seedDatabase: DemoDatabase = {
    puroks: puroks as DemoDatabase['puroks'],
    users: users as DemoDatabase['users'],
    events: events as DemoDatabase['events'],
    attendances: attendances as DemoDatabase['attendances'],
    certificates: certificates as DemoDatabase['certificates'],
    feedback: feedback as DemoDatabase['feedback'],
    announcements: announcements as DemoDatabase['announcements'],
    sms_logs: [],
    otp_tokens: [],
    user_devices: [],
    jobs_last_run: null,
};

/** Changes whenever the JSON seed changes, so browsers drop demo state built from an older seed. */
export const seedVersion = (() => {
    const text = JSON.stringify([site, seedDatabase]);
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
})();

/** Moves every seed date by the same number of days so past/upcoming events stay past/upcoming. */
export function rebaseSeed(db: DemoDatabase, today: string): DemoDatabase {
    const copy = structuredClone(db);
    const days = differenceInCalendarDays(parseISO(today), parseISO(siteConfig.seed_anchor_date));
    if (days === 0) return copy;

    function shift<T extends string | null>(value: T): T {
        if (!value) return value;
        const shifted = addDays(parseISO(value), days);
        return (value.length <= 10 ? toISODate(shifted) : toISODateTime(shifted)) as T;
    }

    for (const user of copy.users) {
        user.last_seen_at = shift(user.last_seen_at);
        user.created_at = shift(user.created_at);
        user.updated_at = shift(user.updated_at);
    }
    for (const event of copy.events) {
        event.start_date = shift(event.start_date);
        event.end_date = shift(event.end_date);
        event.reminder_sent_at = shift(event.reminder_sent_at);
        event.created_at = shift(event.created_at);
        event.updated_at = shift(event.updated_at);
    }
    for (const attendance of copy.attendances) {
        attendance.time_in = shift(attendance.time_in);
        attendance.time_out = shift(attendance.time_out);
        attendance.created_at = shift(attendance.created_at);
        attendance.updated_at = shift(attendance.updated_at);
    }
    for (const row of [...copy.certificates, ...copy.feedback, ...copy.announcements]) {
        row.created_at = shift(row.created_at);
        row.updated_at = shift(row.updated_at);
    }
    return copy;
}

/** A fresh demo database for today: shifted seed plus the daily jobs. */
export function buildFreshDatabase(today: string, now: string): DemoDatabase {
    return runDailyJobs(rebaseSeed(seedDatabase, today), today, now);
}
