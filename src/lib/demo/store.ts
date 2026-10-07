// Browser-side demo database. Every visitor starts from the JSON seed; their changes are saved
// in their own localStorage, so the deployed site needs no server or database.
//
// The database is shared by all tabs (localStorage + storage events), but the signed-in user is
// kept per tab (sessionStorage). That way one tab can be the Secretary scanning QR codes while
// another tab is the Resident showing their code.

import { useSyncExternalStore } from 'react';
import { nowISO, todayISO } from '@/lib/format';
import type { DemoDatabase, User } from '@/lib/types';
import { clearStoredFiles } from './files';
import { flash } from './flash';
import { runDailyJobs } from './jobs';
import { buildFreshDatabase, seedDatabase, seedVersion } from './seed';

const DB_PREFIX = 'bemsis:db:';
const DB_KEY = `${DB_PREFIX}${seedVersion}`;
const SESSION_KEY = 'bemsis:session';

interface DemoSnapshot {
    db: DemoDatabase;
    /** Signed-in demo user for this tab. */
    userId: number | null;
    /** False during server rendering and the first client render (raw seed only). */
    hydrated: boolean;
}

const serverSnapshot: DemoSnapshot = { db: seedDatabase, userId: null, hydrated: false };
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();

function emit() {
    for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getDb(): DemoDatabase {
    return snapshot.db;
}

export function getSessionUserId(): number | null {
    return snapshot.userId;
}

export function getSessionUser(): User | null {
    const { db, userId } = snapshot;
    return userId === null ? null : (db.users.find((u) => u.id === userId) ?? null);
}

function readJson<T>(storage: Storage, key: string): T | null {
    try {
        const raw = storage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function persist(db: DemoDatabase) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch {
        flash('error', 'Your browser storage is full, so this change will be lost on reload. Reset the demo data to free up space.');
    }
}

function onStorage(event: StorageEvent) {
    if (event.key !== DB_KEY) return;
    snapshot = { ...snapshot, db: event.newValue ? (JSON.parse(event.newValue) as DemoDatabase) : buildFreshDatabase(todayISO(), nowISO()) };
    emit();
}

/** Loads the visitor's saved demo state (or a fresh copy of the seed). Called once on mount. */
export function hydrateStore() {
    if (snapshot.hydrated) return;
    try {
        // State saved against an older seed is discarded so edits to /data show up after a redeploy.
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith(DB_PREFIX) && key !== DB_KEY) localStorage.removeItem(key);
        }
    } catch {
        // Storage may be unavailable (private mode); the demo still works in memory.
    }
    const today = todayISO();
    const now = nowISO();
    let stored: DemoDatabase | null = null;
    try {
        stored = readJson<DemoDatabase>(localStorage, DB_KEY);
    } catch {
        stored = null;
    }
    const db = stored ? runDailyJobs(stored, today, now) : buildFreshDatabase(today, now);
    if (!stored || db !== stored) persist(db);
    let userId: number | null = null;
    try {
        userId = readJson<{ user_id: number }>(sessionStorage, SESSION_KEY)?.user_id ?? null;
    } catch {
        userId = null;
    }
    snapshot = { db, userId, hydrated: true };
    window.addEventListener('storage', onStorage);
    emit();
}

/** Replaces the database with a new version and saves it. */
export function commit(db: DemoDatabase) {
    snapshot = { ...snapshot, db };
    persist(db);
    emit();
}

export function setSessionUser(userId: number | null) {
    try {
        if (userId === null) sessionStorage.removeItem(SESSION_KEY);
        else sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user_id: userId }));
    } catch {
        // ignore: the session then lasts for this page view only
    }
    snapshot = { ...snapshot, userId };
    emit();
}

/** Throws away the visitor's changes and uploads, returning to the JSON seed. */
export async function resetDemoData() {
    try {
        localStorage.removeItem(DB_KEY);
    } catch {
        // ignore
    }
    await clearStoredFiles();
    const db = buildFreshDatabase(todayISO(), nowISO());
    snapshot = { ...snapshot, db };
    persist(db);
    emit();
}

function useSnapshot(): DemoSnapshot {
    return useSyncExternalStore(
        subscribe,
        () => snapshot,
        () => serverSnapshot,
    );
}

export function useDb(): DemoDatabase {
    return useSnapshot().db;
}

export function useHydrated(): boolean {
    return useSnapshot().hydrated;
}

export function useCurrentUser(): User | null {
    const { db, userId } = useSnapshot();
    return userId === null ? null : (db.users.find((u) => u.id === userId) ?? null);
}
