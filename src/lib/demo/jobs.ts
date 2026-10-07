// Replaces the Laravel scheduler (`events:send-reminders`, daily at 09:00).
// Runs whenever the demo loads on a new day: approved events that start tomorrow get a
// simulated SMS reminder to their residents, written to sms_logs.

import { addDays, parseISO } from 'date-fns';
import { eventApprovalMessage, eventRecipients, logSms } from '@/lib/domain/sms';
import { toISODate } from '@/lib/format';
import type { DemoDatabase, User } from '@/lib/types';

export function runDailyJobs(db: DemoDatabase, today: string, now: string): DemoDatabase {
    if (db.jobs_last_run === today) return db;

    const tomorrow = toISODate(addDays(parseISO(today), 1));
    const messages: { user: User; message: string }[] = [];

    const events = db.events.map((event) => {
        if (event.status !== 'approved' || event.reminder_sent || event.start_date.slice(0, 10) !== tomorrow) return event;
        for (const user of eventRecipients(db, event, { activeOnly: true })) {
            messages.push({ user, message: eventApprovalMessage(user, event, true) });
        }
        return { ...event, reminder_sent: true, reminder_sent_at: now };
    });

    return { ...db, events, sms_logs: messages.length ? logSms(db, messages) : db.sms_logs, jobs_last_run: today };
}
