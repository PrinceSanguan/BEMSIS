import type { ActionResult, FormErrors, Role, User } from '@/lib/types';
import { flash } from '../flash';
import { getSessionUser } from '../store';

export const ok = <T = undefined>(data?: T): ActionResult<T> => ({ ok: true, data: data as T });
export const fail = (errors: FormErrors): ActionResult<never> => ({ ok: false, errors });

/** Action-level failure shown as a flash error too (like Laravel's back()->with('error', ...)). */
export function failWithFlash(message: string, field = 'message'): ActionResult<never> {
    flash('error', message);
    return fail({ [field]: message });
}

/** The signed-in user if they have one of the roles (the old role middleware). */
export function requireRole(...roles: Role[]): User | null {
    const user = getSessionUser();
    return user && roles.includes(user.role) ? user : null;
}

export const NOT_ALLOWED = 'You are not allowed to do that. Please log in with the right account.';

export const DASHBOARDS: Record<Role, string> = {
    captain: '/captain/dashboard',
    secretary: '/secretary/dashboard',
    partner_agency: '/partner/dashboard',
    resident: '/resident/dashboard',
};

export const ROLE_LABELS: Record<Role, string> = {
    captain: 'Captain',
    secretary: 'Secretary',
    partner_agency: 'Partner agency',
    resident: 'Resident',
};
