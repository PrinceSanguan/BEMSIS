// Drop-in for Ziggy's route() helper: the same Laravel route names map to the same URLs,
// so the ported pages can keep calling route('secretary.events.edit', id).

type Param = string | number;

const ROUTES: Record<string, string> = {
    home: '/',
    'auth.login': '/login',
    'auth.register': '/register',
    'auth.forgot-password': '/forgot-password',
    'auth.verify-otp': '/verify-otp',
    'auth.reset-password': '/reset-password',
    'auth.devices': '/devices',
    'auth.device.verify': '/device/verify/{token}/{device}',

    'captain.dashboard': '/captain/dashboard',
    'captain.events': '/captain/events',
    'captain.users': '/captain/users',
    'captain.users.detail': '/captain/users/{user}/details',

    'secretary.dashboard': '/secretary/dashboard',
    'secretary.users': '/secretary/users',
    'secretary.users.detail': '/secretary/users/{user}/details',
    'secretary.events': '/secretary/events',
    'secretary.events.edit': '/secretary/events/{event}/edit',
    'secretary.events.attendees': '/secretary/events/{event}/attendees',
    'secretary.attendance': '/secretary/attendance',
    'secretary.feedback': '/secretary/feedback',
    'secretary.content': '/secretary/content',
    'secretary.announcements': '/secretary/announcements',

    'partner.dashboard': '/partner/dashboard',
    'partner.events': '/partner/events',
    'partner.events.edit': '/partner/events/{event}/edit',
    'partner.profile': '/partner/profile',

    'resident.dashboard': '/resident/dashboard',
    'resident.events': '/resident/events',
    'resident.attendance': '/resident/attendance',
    'resident.certificates': '/resident/certificates',
    'resident.certificates.view': '/resident/certificates/view/{certificateCode}',
    'resident.certificates.preview': '/resident/certificates/preview',
    'resident.feedback': '/resident/feedback',
    'resident.announcements': '/resident/announcements',
    'resident.profile': '/resident/profile',
};

/**
 * route('secretary.events.edit', 5) → "/secretary/events/5/edit".
 * Params can be positional (a single value or an array) or named ({ event: 5 }); extra named params become the query string.
 */
export function route(name: string, params?: Param | Param[] | Record<string, Param | null | undefined>): string {
    const template = ROUTES[name];
    if (!template) throw new Error(`Unknown route: ${name}`);
    const positional = params === undefined ? [] : Array.isArray(params) ? params : typeof params === 'object' ? null : [params];
    const named = positional === null ? { ...(params as Record<string, Param | null | undefined>) } : {};
    let index = 0;
    const path = template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = positional ? positional[index++] : named[key];
        if (!positional) delete named[key];
        return encodeURIComponent(String(value ?? ''));
    });
    return withQuery(path, named);
}

/** Appends a query string, skipping empty values. */
export function withQuery(path: string, query: Record<string, Param | null | undefined>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== null && value !== undefined && value !== '') search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
}
