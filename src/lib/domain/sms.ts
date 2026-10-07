// SMS text from the original app (sms.iprogtech.com). In the demo nothing is sent:
// each message is written to the sms_logs table instead.

import { format } from 'date-fns';
import { siteConfig } from '@/lib/site';
import { nowISO, toDate } from '@/lib/format';
import type { BarangayEvent, DemoDatabase, SmsLog, User } from '@/lib/types';

const firstWord = (name: string) => name.trim().split(/\s+/)[0] ?? name;
const when = (value: string | null) => {
    const date = toDate(value);
    return date ? format(date, 'MMM dd, yyyy hh:mm a') : '';
};

export function eventApprovalMessage(user: User, event: BarangayEvent, reminder = false): string {
    let message = `Hi ${firstWord(user.name)}! What: ${event.title}. When: ${when(event.start_date)}`;
    if (event.end_date) message += ` to ${when(event.end_date)}`;
    message += '.';
    if (event.venue) message += ` Where: ${event.venue}.`;
    if (event.description) message += ` Why: ${event.description}.`;
    message += ` Approved by Hon. ${siteConfig.captain_name}.`;
    return reminder ? `🔔 REMINDER: ${message}` : message;
}

export function announcementMessage(user: User, title: string, content: string): string {
    return `Hi ${firstWord(user.name)}! Announcement: ${title}. Date: ${format(new Date(), 'MMM dd, yyyy')}. ${content}`;
}

export function userApprovedMessage(user: User): string {
    return `Hello ${user.name}, Your account has been approved and you now have access to the Barangay Event Management System. You may now log in to start joining and viewing upcoming events. Approved by the Barangay Secretary.`;
}

/** Residents an event is aimed at: everyone, or the residents of its puroks. */
export function eventRecipients(db: DemoDatabase, event: BarangayEvent, { activeOnly = false } = {}): User[] {
    return db.users.filter(
        (u) =>
            u.role === 'resident' &&
            u.status === 'approved' &&
            (!activeOnly || u.is_active) &&
            !!u.phone &&
            (event.target_all_residents || !event.purok_ids?.length || (u.purok_id !== null && event.purok_ids.includes(u.purok_id))),
    );
}

/** Appends simulated outgoing SMS rows. */
export function logSms(db: DemoDatabase, entries: { user: User; message: string }[]): SmsLog[] {
    let nextId = db.sms_logs.reduce((max, log) => Math.max(max, log.id), 0) + 1;
    const now = nowISO();
    return [
        ...db.sms_logs,
        ...entries.map(({ user, message }) => ({
            id: nextId++,
            user_id: user.id,
            phone: user.phone,
            message,
            direction: 'outgoing' as const,
            created_at: now,
        })),
    ];
}
