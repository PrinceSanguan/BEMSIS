// Page data for the public auth pages: each function returns the same props the matching
// RegisterController / ForgotPasswordController / DeviceVerificationController method passed to Inertia::render().

import { formatDateTime } from '@/lib/format';
import type { DemoDatabase, OtpToken, User } from '@/lib/types';

/** RegisterController@index */
export function registerProps(db: DemoDatabase) {
    return { puroks: db.puroks };
}

/** DeviceVerificationController@index ('M j, Y g:i A' dates, most recently used first). */
export function deviceManagementProps(db: DemoDatabase, user: User) {
    const devices = db.user_devices
        .filter((d) => d.user_id === user.id)
        .sort((a, b) => (a.last_used_at === b.last_used_at ? b.id - a.id : a.last_used_at < b.last_used_at ? 1 : -1))
        .map((device) => ({
            id: device.id,
            device_name: device.device_name,
            platform: device.platform,
            browser: device.browser,
            // A static demo never sees the visitor's IP address.
            ip_address: null as string | null,
            is_trusted: device.is_trusted,
            last_used_at: formatDateTime(device.last_used_at),
            first_used_at: formatDateTime(device.first_used_at),
            // Demo only: lets the page link to the verification URL the original emailed.
            verification_token: device.verification_token,
        }));
    return { devices };
}

/** Demo inbox: the OTP that the original emailed for this address (null when none was requested). */
export function demoOtpFor(db: DemoDatabase, email: string): OtpToken | null {
    const needle = email.trim().toLowerCase();
    return db.otp_tokens.find((t) => t.email.toLowerCase() === needle) ?? null;
}
