// Login, logout, registration, forgot password (OTP) and device tracking.
// Port of LoginController, RegisterController, ForgotPasswordController and DeviceVerificationController.

import { addMinutes, differenceInSeconds } from 'date-fns';
import { nextId, otpCode, randomString } from '@/lib/domain/codes';
import { siteConfig } from '@/lib/site';
import { checkFile, GLOBE_TM_PREFIXES, nullable, REGISTER_PASSWORD_PATTERN, RESET_PASSWORD_PATTERN, Validator } from '@/lib/domain/validation';
import { nowISO, toDate, toISODate, toISODateTime } from '@/lib/format';
import type { ActionResult, DemoDatabase, Role, User, UserDevice } from '@/lib/types';
import { storeFile } from '../files';
import { flash } from '../flash';
import { commit, getDb, getSessionUser, setSessionUser } from '../store';
import { DASHBOARDS, fail, failWithFlash, ok } from './common';

/** The seeded account behind each one-click demo login button. */
export const DEMO_ACCOUNTS: Record<Role, string> = {
    captain: 'captain@gmail.com',
    secretary: 'secretary@gmail.com',
    partner_agency: 'partner@gmail.com',
    resident: 'resident@gmail.com',
};

export const DEMO_PASSWORD = 'password123';

const findByEmail = (db: DemoDatabase, email: string) => db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null;

function replaceUser(db: DemoDatabase, user: User): DemoDatabase {
    return { ...db, users: db.users.map((u) => (u.id === user.id ? user : u)) };
}

// ---------------------------------------------------------------- devices

function parseUserAgent(ua: string) {
    const platform = /Windows/i.test(ua)
        ? 'Windows'
        : /Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)
          ? 'Mac'
          : /Android/i.test(ua)
            ? 'Android'
            : /iPhone|iPad/i.test(ua)
              ? 'iOS'
              : /Linux/i.test(ua)
                ? 'Linux'
                : 'Unknown';
    const browser = /Edg\//i.test(ua)
        ? 'Edge'
        : /Chrome/i.test(ua)
          ? 'Chrome'
          : /Firefox/i.test(ua)
            ? 'Firefox'
            : /Safari/i.test(ua)
              ? 'Safari'
              : 'Unknown';
    return { platform, browser };
}

function deviceHash(ua: string, userId: number) {
    const { platform, browser } = parseUserAgent(ua);
    const text = `${platform}|${browser}|${ua.replace(/\d+(\.\d+)+/g, 'X.X')}|${userId}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Remembers the browser a user signs in from. The first device is trusted automatically. */
function trackDevice(db: DemoDatabase, user: User): DemoDatabase {
    if (typeof navigator === 'undefined') return db;
    const ua = navigator.userAgent;
    const hash = deviceHash(ua, user.id);
    const now = nowISO();
    const existing = db.user_devices.find((d) => d.user_id === user.id && d.device_hash === hash);
    if (existing) {
        return { ...db, user_devices: db.user_devices.map((d) => (d.id === existing.id ? { ...d, last_used_at: now } : d)) };
    }
    const { platform, browser } = parseUserAgent(ua);
    const hasTrusted = db.user_devices.some((d) => d.user_id === user.id && d.is_trusted);
    const device: UserDevice = {
        id: nextId(db.user_devices),
        user_id: user.id,
        device_hash: hash,
        device_name: `${platform} (${browser})`,
        user_agent: ua,
        platform,
        browser,
        is_trusted: !hasTrusted,
        first_used_at: now,
        last_used_at: now,
        verification_token: hasTrusted ? randomString(64) : null,
        verified_at: hasTrusted ? null : now,
    };
    return { ...db, user_devices: [...db.user_devices, device] };
}

export function verifyDevice(token: string, deviceId: number): ActionResult<{ name: string; platform: string; browser: string }> {
    const db = getDb();
    const device = db.user_devices.find((d) => d.id === deviceId);
    if (!device || !device.verification_token || device.verification_token !== token) {
        return fail({ message: 'Invalid or expired verification link.' });
    }
    const now = nowISO();
    commit({
        ...db,
        user_devices: db.user_devices.map((d) => (d.id === deviceId ? { ...d, is_trusted: true, verified_at: now, verification_token: null } : d)),
    });
    return ok({ name: device.device_name, platform: device.platform, browser: device.browser });
}

export function revokeDevice(deviceId: number): ActionResult {
    const user = getSessionUser();
    const db = getDb();
    if (!user || !db.user_devices.some((d) => d.id === deviceId && d.user_id === user.id)) return failWithFlash('Device not found.');
    commit({
        ...db,
        user_devices: db.user_devices.map((d) => (d.id === deviceId ? { ...d, is_trusted: false, verified_at: null } : d)),
    });
    flash('success', 'Device access revoked successfully.');
    return ok();
}

// ---------------------------------------------------------------- login / logout

function lockMinutesLeft(user: User, now: Date): number {
    const until = toDate(user.locked_until);
    return until ? Math.max(1, Math.ceil(differenceInSeconds(until, now) / 60)) : 0;
}

/** Status checks that run after a correct password (or a demo button). */
function accountProblem(user: User): string | null {
    if (user.status === 'pending') return 'Your account is pending approval from the administrator. Please wait for confirmation.';
    if (user.status === 'declined') return 'Your account has been declined. Please contact the administrator for more information.';
    if (!user.is_active) return 'Your account has been deactivated. Please contact the administrator.';
    return null;
}

function signIn(db: DemoDatabase, user: User): DemoDatabase {
    const now = nowISO();
    const updated = { ...user, failed_login_attempts: 0, locked_until: null, last_seen_at: now, is_online: true };
    return trackDevice(replaceUser(db, updated), updated);
}

export function login(email: string, password: string): ActionResult<{ redirect: string }> {
    const v = new Validator().required('email', email).email('email', email).required('password', password);
    if (!v.passes) return fail(v.errors);

    let db = getDb();
    const now = new Date();
    let user = findByEmail(db, email);

    if (user) {
        const until = toDate(user.locked_until);
        if (until && until > now) {
            return fail({
                auth: `Account is locked due to too many failed login attempts. Please try again in ${lockMinutesLeft(user, now)} minutes.`,
            });
        }
        // An expired lock starts a fresh count (the original kept counting and re-locked on the next mistake).
        if (until) {
            user = { ...user, failed_login_attempts: 0, locked_until: null };
            db = replaceUser(db, user);
        }
    }

    if (user && user.password === password) {
        db = signIn(db, user);
        const problem = accountProblem(user);
        commit(db);
        if (problem) return fail({ auth: problem });
        setSessionUser(user.id);
        return ok({ redirect: DASHBOARDS[user.role] });
    }

    if (user) {
        const attempts = user.failed_login_attempts + 1;
        const locked = attempts >= siteConfig.lockout_max_attempts;
        commit(
            replaceUser(db, {
                ...user,
                failed_login_attempts: attempts,
                locked_until: locked ? toISODateTime(addMinutes(now, siteConfig.lockout_minutes)) : null,
            }),
        );
        return fail({
            auth: locked
                ? `Too many failed login attempts. Your account has been locked for ${siteConfig.lockout_minutes} minutes.`
                : `Invalid credentials. ${siteConfig.lockout_max_attempts - attempts} attempts remaining before account lockout.`,
        });
    }

    return fail({ auth: 'The provided credentials do not match our records.' });
}

/** One-click demo login: signs in the seeded account for a role, no typing needed. */
export function quickLogin(role: Role): ActionResult<{ redirect: string }> {
    const db = getDb();
    const user = findByEmail(db, DEMO_ACCOUNTS[role]);
    if (!user) return fail({ auth: 'That demo account no longer exists. Reset the demo data to bring it back.' });
    const problem = accountProblem(user);
    if (problem) return fail({ auth: `${problem} (Use "Reset demo data" to restore the demo accounts.)` });
    commit(signIn(db, user));
    setSessionUser(user.id);
    return ok({ redirect: DASHBOARDS[user.role] });
}

let loggedOutOnPurpose = false;

/** True once after a deliberate logout, so the role guard sends the user home instead of to /login. */
export function consumeLogout(): boolean {
    const value = loggedOutOnPurpose;
    loggedOutOnPurpose = false;
    return value;
}

export function logout(): ActionResult {
    const user = getSessionUser();
    if (user) {
        const db = getDb();
        commit(replaceUser(db, { ...user, is_online: false }));
    }
    loggedOutOnPurpose = true;
    setSessionUser(null);
    flash('success', 'You have been logged out successfully.');
    return ok();
}

let pendingRedirect: string | null = null;

/** Where a role switch is heading, read once by the role guard so it redirects there instead of denying access. */
export function consumePendingRedirect(): string | null {
    const value = pendingRedirect;
    pendingRedirect = null;
    return value;
}

/** Demo shortcut in the account menu: become another role without going through the login page. */
export function switchRole(role: Role): ActionResult<{ redirect: string }> {
    const current = getSessionUser();
    const result = quickLogin(role);
    if (!result.ok) {
        flash('error', result.errors.auth);
        return result;
    }
    if (current) commit(replaceUser(getDb(), { ...current, is_online: false }));
    pendingRedirect = result.data.redirect;
    return result;
}

/** Keeps the signed-in user "online" for the online indicators (TrackUserActivity middleware). */
export function touchLastSeen() {
    const user = getSessionUser();
    if (!user) return;
    const seen = toDate(user.last_seen_at);
    if (user.is_online && seen && Date.now() - seen.getTime() < 60_000) return;
    commit(replaceUser(getDb(), { ...user, last_seen_at: nowISO(), is_online: true }));
}

// ---------------------------------------------------------------- registration

export interface RegisterInput {
    role: 'resident' | 'partner_agency' | '';
    email: string;
    password: string;
    password_confirmation: string;
    // resident
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
    place_of_birth: string;
    date_of_birth: string;
    age: string;
    sex: string;
    civil_status: string;
    citizenship: string;
    occupation: string;
    special_notes: string;
    purok_id: string;
    phone: string;
    // partner agency
    agency_name: string;
    representative_first_name: string;
    representative_last_name: string;
    agency_address: string;
    agency_phone: string;
}

function checkPhone(v: Validator, db: DemoDatabase, field: string, phone: string) {
    if (!phone) return v.required(field, phone);
    if (!/^639\d{9}$/.test(phone)) return v.check(false, field, 'Phone number must be in format 639XXXXXXXXX.');
    if (!GLOBE_TM_PREFIXES.includes(phone.slice(2, 5))) return v.check(false, field, 'Only Globe and TM numbers are accepted.');
    return v.check(!db.users.some((u) => u.phone === phone), field, 'This phone number is already registered in the system.');
}

const ID_FILE_RULE = { types: ['jpeg', 'jpg', 'png', 'pdf'], maxKb: 5120, typeMessage: 'The file must be a file of type: jpeg, jpg, png, pdf.' };

export async function register(input: RegisterInput, files: { valid_id: File | null; agency_valid_id: File | null }): Promise<ActionResult> {
    const db = getDb();
    const v = new Validator()
        .required('email', input.email)
        .email('email', input.email)
        .check(!findByEmail(db, input.email), 'email', 'The email has already been taken.')
        .required('role', input.role)
        .oneOf('role', input.role, ['resident', 'partner_agency'])
        .required('password', input.password)
        .minLength('password', input.password, 8)
        .maxLength('password', input.password, 12)
        .confirmed('password', input.password, input.password_confirmation)
        .matches(
            'password',
            input.password,
            REGISTER_PASSWORD_PATTERN,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        );

    if (input.role === 'resident') {
        const minBirth = new Date();
        minBirth.setFullYear(minBirth.getFullYear() - 13);
        v.required('first_name', input.first_name)
            .maxLength('first_name', input.first_name, 255)
            .maxLength('middle_name', input.middle_name, 255)
            .required('last_name', input.last_name)
            .maxLength('last_name', input.last_name, 255)
            .maxLength('extension', input.extension === 'none' ? '' : input.extension, 10)
            .required('place_of_birth', input.place_of_birth)
            .required('date_of_birth', input.date_of_birth)
            .check(
                !input.date_of_birth || input.date_of_birth < toISODate(minBirth),
                'date_of_birth',
                'You must be at least 13 years old to register.',
            )
            .required('age', input.age)
            .integerBetween('age', input.age, 13, 120, 'You must be at least 13 years old to register.')
            .required('sex', input.sex)
            .oneOf('sex', input.sex, ['Male', 'Female'])
            .required('civil_status', input.civil_status)
            .required('citizenship', input.citizenship)
            .required('occupation', input.occupation)
            .required('purok_id', input.purok_id)
            .check(!input.purok_id || db.puroks.some((p) => String(p.id) === input.purok_id), 'purok_id', 'The selected purok id is invalid.')
            .required('valid_id', files.valid_id);
        checkPhone(v, db, 'phone', input.phone);
        checkFile(v, 'valid_id', files.valid_id, ID_FILE_RULE);
    } else if (input.role === 'partner_agency') {
        v.required('agency_name', input.agency_name)
            .maxLength('agency_name', input.agency_name, 255)
            .required('representative_first_name', input.representative_first_name)
            .required('representative_last_name', input.representative_last_name)
            .maxLength('agency_address', input.agency_address, 500)
            .required('agency_valid_id', files.agency_valid_id);
        checkPhone(v, db, 'agency_phone', input.agency_phone);
        checkFile(v, 'agency_valid_id', files.agency_valid_id, ID_FILE_RULE);
    }

    if (!v.passes) return fail(v.errors);

    const isResident = input.role === 'resident';
    const idPath = isResident ? await storeFile(files.valid_id!) : await storeFile(files.agency_valid_id!);
    const extension = nullable(input.extension === 'none' ? '' : input.extension);
    const now = nowISO();
    const fresh = getDb();
    const user: User = {
        id: nextId(fresh.users),
        name: isResident
            ? [input.first_name, input.middle_name, input.last_name, extension]
                  .map((part) => part?.trim())
                  .filter(Boolean)
                  .join(' ')
            : input.agency_name.trim(),
        email: input.email.trim(),
        password: input.password,
        phone: isResident ? input.phone : input.agency_phone,
        role: input.role as 'resident' | 'partner_agency',
        status: 'pending',
        is_active: true,
        purok_id: isResident ? Number(input.purok_id) : null,
        failed_login_attempts: 0,
        locked_until: null,
        last_seen_at: null,
        is_online: false,
        first_name: isResident ? input.first_name.trim() : null,
        middle_name: isResident ? nullable(input.middle_name) : null,
        last_name: isResident ? input.last_name.trim() : null,
        extension: isResident ? extension : null,
        place_of_birth: isResident ? input.place_of_birth.trim() : null,
        date_of_birth: isResident ? input.date_of_birth : null,
        age: isResident ? Number(input.age) : null,
        sex: isResident ? (input.sex as 'Male' | 'Female') : null,
        civil_status: isResident ? input.civil_status : null,
        citizenship: isResident ? input.citizenship.trim() : null,
        occupation: isResident ? input.occupation.trim() : null,
        special_notes: isResident ? nullable(input.special_notes) : null,
        valid_id_path: isResident ? idPath : null,
        agency_name: isResident ? null : input.agency_name.trim(),
        representative_first_name: isResident ? null : input.representative_first_name.trim(),
        representative_last_name: isResident ? null : input.representative_last_name.trim(),
        agency_address: isResident ? null : nullable(input.agency_address),
        agency_valid_id_path: isResident ? null : idPath,
        agency_endorsement_path: null,
        created_at: now,
        updated_at: now,
    };
    commit({ ...fresh, users: [...fresh.users, user] });
    flash('success', 'Account created successfully! Please wait for approval from the Secretary.');
    return ok();
}

// ---------------------------------------------------------------- forgot password (OTP)

export function sendOtp(email: string): ActionResult<{ email: string }> {
    const v = new Validator().required('email', email).email('email', email);
    if (!v.passes) return fail(v.errors);
    const db = getDb();
    const user = findByEmail(db, email);
    if (!user) return fail({ email: 'There is no registered account with this email address.' });
    if (user.status === 'pending') return fail({ email: 'Your email is not yet approved by the secretary. Please wait for approval.' });
    if (user.status === 'declined') return fail({ email: 'Your account has been declined. Please contact the administrator.' });

    const now = new Date();
    commit({
        ...db,
        otp_tokens: [
            ...db.otp_tokens.filter((t) => t.email !== user.email),
            {
                email: user.email,
                otp: otpCode(),
                expires_at: toISODateTime(addMinutes(now, siteConfig.otp_minutes)),
                verified_at: null,
                created_at: toISODateTime(now),
            },
        ],
    });
    flash('success', 'OTP sent successfully! Please check your email.');
    return ok({ email: user.email });
}

export function verifyOtp(email: string, otp: string): ActionResult<{ email: string }> {
    const v = new Validator()
        .required('email', email)
        .required('otp', otp)
        .check(!otp || otp.length === 6, 'otp', 'The otp field must be 6 characters.');
    if (!v.passes) return fail(v.errors);
    const db = getDb();
    const token = db.otp_tokens.find((t) => t.email.toLowerCase() === email.toLowerCase() && t.otp === otp);
    if (!token) return fail({ otp: 'Invalid OTP code.' });
    if ((toDate(token.expires_at) ?? new Date(0)) < new Date()) {
        commit({ ...db, otp_tokens: db.otp_tokens.filter((t) => t !== token) });
        return fail({ otp: 'OTP has expired. Please request a new one.' });
    }
    commit({ ...db, otp_tokens: db.otp_tokens.map((t) => (t === token ? { ...t, verified_at: nowISO() } : t)) });
    flash('success', 'OTP verified successfully!');
    return ok({ email: token.email });
}

/** True when the email has a verified, unexpired OTP (the reset page requires one). */
export function hasVerifiedOtp(db: DemoDatabase, email: string): boolean {
    const token = db.otp_tokens.find((t) => t.email.toLowerCase() === email.toLowerCase());
    return !!token?.verified_at && (toDate(token.expires_at) ?? new Date(0)) >= new Date();
}

export function resetPassword(email: string, password: string, confirmation: string): ActionResult {
    const db = getDb();
    if (!hasVerifiedOtp(db, email)) {
        flash('error', 'Session expired. Please start again.');
        return fail({ email: 'Please verify the OTP sent to your email first.' });
    }
    const v = new Validator()
        .required('password', password)
        .minLength('password', password, 8)
        .maxLength('password', password, 12)
        .confirmed('password', password, confirmation)
        .matches(
            'password',
            password,
            RESET_PASSWORD_PATTERN,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).',
        );
    if (!v.passes) return fail(v.errors);
    const user = findByEmail(db, email);
    if (!user) return fail({ email: 'User not found.' });
    commit({
        ...replaceUser(db, { ...user, password, failed_login_attempts: 0, locked_until: null, updated_at: nowISO() }),
        otp_tokens: db.otp_tokens.filter((t) => t.email.toLowerCase() !== email.toLowerCase()),
    });
    flash('success', 'Password updated successfully! You can now login with your new password.');
    return ok();
}
