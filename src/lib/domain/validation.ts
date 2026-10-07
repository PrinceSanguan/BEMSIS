import type { FormErrors } from '@/lib/types';

const label = (field: string) => field.replace(/\.\d+\./g, ' ').replace(/_/g, ' ');

/** Minimal form validator with Laravel-style messages ("The title field is required."). Keeps the first error per field. */
export class Validator {
    readonly errors: FormErrors = {};

    private fail(field: string, message: string) {
        if (!this.errors[field]) this.errors[field] = message;
        return this;
    }

    required(field: string, value: unknown, message?: string) {
        const empty =
            value === null ||
            value === undefined ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0);
        return empty ? this.fail(field, message ?? `The ${label(field)} field is required.`) : this;
    }

    email(field: string, value: string | null | undefined) {
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
            ? this.fail(field, `The ${label(field)} field must be a valid email address.`)
            : this;
    }

    url(field: string, value: string | null | undefined) {
        if (!value) return this;
        try {
            const parsed = new URL(value);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:'
                ? this
                : this.fail(field, `The ${label(field)} field must be a valid URL.`);
        } catch {
            return this.fail(field, `The ${label(field)} field must be a valid URL.`);
        }
    }

    maxLength(field: string, value: string | null | undefined, max: number) {
        return value && value.length > max ? this.fail(field, `The ${label(field)} field must not be greater than ${max} characters.`) : this;
    }

    minLength(field: string, value: string | null | undefined, min: number) {
        return value !== null && value !== undefined && value.length < min
            ? this.fail(field, `The ${label(field)} field must be at least ${min} characters.`)
            : this;
    }

    integerBetween(field: string, value: string | number | null | undefined, min: number, max: number, message?: string) {
        if (value === null || value === undefined || value === '') return this;
        const n = Number(value);
        if (!Number.isInteger(n)) return this.fail(field, `The ${label(field)} field must be an integer.`);
        if (n < min) return this.fail(field, message ?? `The ${label(field)} field must be at least ${min}.`);
        if (n > max) return this.fail(field, `The ${label(field)} field must not be greater than ${max}.`);
        return this;
    }

    oneOf(field: string, value: string | null | undefined, allowed: readonly string[]) {
        return value && !allowed.includes(value) ? this.fail(field, `The selected ${label(field)} is invalid.`) : this;
    }

    matches(field: string, value: string | null | undefined, pattern: RegExp, message: string) {
        return value && !pattern.test(value) ? this.fail(field, message) : this;
    }

    confirmed(field: string, value: string, confirmation: string) {
        return value && value !== confirmation ? this.fail(field, `The ${label(field)} field confirmation does not match.`) : this;
    }

    check(condition: boolean, field: string, message: string) {
        return condition ? this : this.fail(field, message);
    }

    get passes() {
        return Object.keys(this.errors).length === 0;
    }
}

/** Trimmed string, or null when empty. */
export function nullable(value: string | null | undefined): string | null {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' ? null : trimmed;
}

/** Registration rule: 8–12 chars with upper, lower, digit and a special character. */
export const REGISTER_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/;
/** Reset rule (stricter charset, as in the original ForgotPasswordController). */
export const RESET_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/;

/** Globe/TM prefixes accepted at registration (digits after "63"). */
export const GLOBE_TM_PREFIXES = [
    '817',
    '905',
    '906',
    '915',
    '916',
    '917',
    '926',
    '927',
    '935',
    '936',
    '937',
    '945',
    '953',
    '954',
    '955',
    '956',
    '957',
    '965',
    '966',
    '967',
    '975',
    '976',
    '977',
    '978',
    '979',
    '994',
    '995',
    '996',
    '997',
];

/** Upload limits from the Laravel validation rules. */
export function checkFile(
    v: Validator,
    field: string,
    file: File | null | undefined,
    { types, maxKb, typeMessage }: { types: string[]; maxKb: number; typeMessage: string },
) {
    if (!file) return v;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    v.check(types.includes(extension), field, typeMessage);
    v.check(file.size <= maxKb * 1024, field, `The ${label(field)} field must not be greater than ${maxKb} kilobytes.`);
    return v;
}
