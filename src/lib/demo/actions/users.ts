// User approval (Secretary), activation (Captain + Secretary), profile and password (Resident + Partner).

import { logSms, userApprovedMessage } from '@/lib/domain/sms';
import { Validator } from '@/lib/domain/validation';
import { nowISO } from '@/lib/format';
import type { ActionResult, DemoDatabase, User } from '@/lib/types';
import { flash } from '../flash';
import { commit, getDb } from '../store';
import { fail, failWithFlash, NOT_ALLOWED, ok, requireRole } from './common';

function updateUser(db: DemoDatabase, id: number, patch: Partial<User>): DemoDatabase {
    return { ...db, users: db.users.map((u) => (u.id === id ? { ...u, ...patch, updated_at: nowISO() } : u)) };
}

export function approveUser(id: number): ActionResult {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const user = db.users.find((u) => u.id === id);
    if (!user) return failWithFlash('User not found.');
    const next = updateUser(db, id, { status: 'approved' });
    commit(user.phone ? { ...next, sms_logs: logSms(db, [{ user, message: userApprovedMessage(user) }]) } : next);
    flash('success', user.phone ? 'User approved successfully! (SMS simulated)' : 'User approved successfully!');
    return ok();
}

export function declineUser(id: number): ActionResult {
    if (!requireRole('secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    if (!db.users.some((u) => u.id === id)) return failWithFlash('User not found.');
    commit(updateUser(db, id, { status: 'declined' }));
    flash('success', 'User declined successfully!');
    return ok();
}

export function setUserActive(id: number, active: boolean): ActionResult {
    if (!requireRole('captain', 'secretary')) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    if (!db.users.some((u) => u.id === id)) return failWithFlash('User not found.');
    commit(updateUser(db, id, { is_active: active }));
    flash('success', active ? 'User account has been activated successfully.' : 'User account has been deactivated successfully.');
    return ok();
}

export function updateProfile(input: { name: string; email: string; phone: string }): ActionResult {
    const user = requireRole('resident', 'partner_agency');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const db = getDb();
    const others = db.users.filter((u) => u.id !== user.id);
    const v = new Validator()
        .required('name', input.name)
        .maxLength('name', input.name, 255)
        .required('email', input.email)
        .email('email', input.email)
        .check(!others.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase()), 'email', 'The email has already been taken.')
        .required('phone', input.phone)
        .check(!others.some((u) => u.phone === input.phone.trim()), 'phone', 'The phone has already been taken.');
    if (!v.passes) return fail(v.errors);
    commit(updateUser(db, user.id, { name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim() }));
    flash('success', 'Profile updated successfully!');
    return ok();
}

export function changePassword(input: { current_password: string; password: string; password_confirmation: string }): ActionResult {
    const user = requireRole('resident', 'partner_agency');
    if (!user) return failWithFlash(NOT_ALLOWED);
    const v = new Validator()
        .required('current_password', input.current_password)
        .required('password', input.password)
        .minLength('password', input.password, 6)
        .confirmed('password', input.password, input.password_confirmation);
    if (!v.passes) return fail(v.errors);
    if (input.current_password !== user.password) return fail({ current_password: 'Current password is incorrect.' });
    commit(updateUser(getDb(), user.id, { password: input.password }));
    flash('success', 'Password changed successfully!');
    return ok();
}
