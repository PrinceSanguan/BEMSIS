// One-shot status messages shown after an action ("Event created successfully!").
// Replaces Laravel's session flash (flash.success / flash.error / flash.info).

import { useSyncExternalStore } from 'react';

export type FlashType = 'success' | 'error' | 'info';

export interface FlashMessage {
    id: number;
    type: FlashType;
    message: string;
    createdAt: number;
}

let messages: FlashMessage[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const empty: FlashMessage[] = [];

function emit() {
    for (const listener of listeners) listener();
}

export function flash(type: FlashType, message: string) {
    messages = [...messages.filter((m) => m.type !== type), { id: nextId++, type, message, createdAt: Date.now() }];
    emit();
}

export function dismissFlash(id: number) {
    messages = messages.filter((m) => m.id !== id);
    emit();
}

/** Clears messages older than `age` ms (used when the user navigates away). */
export function clearStaleFlash(age: number) {
    const cutoff = Date.now() - age;
    const kept = messages.filter((m) => m.createdAt > cutoff);
    if (kept.length !== messages.length) {
        messages = kept;
        emit();
    }
}

export function useFlashMessages(): FlashMessage[] {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => messages,
        () => empty,
    );
}

/** Latest message of each type, shaped like the old Inertia `flash` prop. */
export function useFlash(): { success?: string; error?: string; info?: string } {
    const list = useFlashMessages();
    const result: { success?: string; error?: string; info?: string } = {};
    for (const m of list) result[m.type] = m.message;
    return result;
}
