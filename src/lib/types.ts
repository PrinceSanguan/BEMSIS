// Demo database types. Field names mirror the old Laravel tables (snake_case).
// Dates are local strings without a time zone: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss".

export type Role = 'resident' | 'partner_agency' | 'secretary' | 'captain';
export type UserStatus = 'pending' | 'approved' | 'declined';
export type EventStatus = 'pending' | 'approved' | 'declined';

export interface SiteConfig {
    name: string;
    full_name: string;
    tagline: string;
    seed_anchor_date: string;
    barangay: string;
    municipality: string;
    province: string;
    captain_name: string;
    late_threshold_minutes: number;
    lockout_max_attempts: number;
    lockout_minutes: number;
    otp_minutes: number;
}

export interface Purok {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    /** Plain text: this is a public portfolio demo with no real accounts. */
    password: string;
    phone: string;
    role: Role;
    status: UserStatus;
    is_active: boolean;
    purok_id: number | null;
    failed_login_attempts: number;
    locked_until: string | null;
    last_seen_at: string | null;
    is_online: boolean;
    first_name: string | null;
    middle_name: string | null;
    last_name: string | null;
    extension: string | null;
    place_of_birth: string | null;
    date_of_birth: string | null;
    age: number | null;
    sex: 'Male' | 'Female' | null;
    civil_status: string | null;
    citizenship: string | null;
    occupation: string | null;
    special_notes: string | null;
    valid_id_path: string | null;
    agency_name: string | null;
    representative_first_name: string | null;
    representative_last_name: string | null;
    agency_address: string | null;
    agency_valid_id_path: string | null;
    agency_endorsement_path: string | null;
    created_at: string;
    updated_at: string;
}

export interface BarangayEvent {
    id: number;
    created_by: number;
    /** null means every purok (see target_all_residents). */
    purok_ids: number[] | null;
    target_all_residents: boolean;
    title: string;
    description: string;
    venue: string | null;
    image_path: string | null;
    start_date: string;
    end_date: string | null;
    has_certificate: boolean;
    partner_feedback_link: string | null;
    partner_certificate_path: string | null;
    status: EventStatus;
    reminder_sent: boolean;
    reminder_sent_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: number;
    event_id: number;
    user_id: number;
    status: 'confirmed' | 'declined' | null;
    qr_code: string | null;
    time_in: string | null;
    time_in_label: 'On-Time' | 'Late' | null;
    time_out: string | null;
    time_out_label: 'Completed' | 'Not Completed' | null;
    created_at: string;
    updated_at: string;
}

export interface Certificate {
    id: number;
    event_id: number;
    user_id: number;
    certificate_code: string;
    file_path: string;
    created_at: string;
    updated_at: string;
}

export interface Feedback {
    id: number;
    event_id: number;
    user_id: number;
    comments: string;
    rating: number | null;
    created_at: string;
    updated_at: string;
}

export interface Announcement {
    id: number;
    created_by: number;
    title: string;
    content: string;
    target_puroks: number[] | null;
    target_all_puroks: boolean;
    created_at: string;
    updated_at: string;
}

export interface SmsLog {
    id: number;
    user_id: number | null;
    phone: string;
    message: string;
    direction: 'outgoing' | 'incoming';
    created_at: string;
}

export interface OtpToken {
    email: string;
    otp: string;
    expires_at: string;
    /** Set once the code is entered correctly; the reset page requires it. */
    verified_at: string | null;
    created_at: string;
}

export interface UserDevice {
    id: number;
    user_id: number;
    device_hash: string;
    device_name: string;
    user_agent: string;
    platform: string;
    browser: string;
    is_trusted: boolean;
    first_used_at: string;
    last_used_at: string;
    verification_token: string | null;
    verified_at: string | null;
}

export interface DemoDatabase {
    puroks: Purok[];
    users: User[];
    events: BarangayEvent[];
    attendances: Attendance[];
    certificates: Certificate[];
    feedback: Feedback[];
    announcements: Announcement[];
    sms_logs: SmsLog[];
    otp_tokens: OtpToken[];
    user_devices: UserDevice[];
    jobs_last_run: string | null;
}

/** Laravel LengthAwarePaginator shape, which the ported pages already read. */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export type FormErrors = Record<string, string>;

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; errors: FormErrors };
