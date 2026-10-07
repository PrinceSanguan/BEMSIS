'use client';

import { verifyDevice } from '@/lib/demo/actions';
import { useHydrated } from '@/lib/demo/store';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import DeviceVerificationFailed from './device-verification-failed';
import DeviceVerified from './device-verified';

type VerifyResult = ReturnType<typeof verifyDevice>;

// Results are kept per link, so the one-time verification also survives React's dev double-mount.
const results = new Map<string, VerifyResult>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function verifyOnce(key: string, token: string, deviceId: number) {
    if (results.has(key)) return;
    results.set(key, verifyDevice(token, deviceId));
    for (const listener of listeners) listener();
}

/** DeviceVerificationController@verify: the link the original emailed for an unrecognised device. */
export default function DeviceVerifyView({ token, device }: { token: string; device: string }) {
    const hydrated = useHydrated();
    const key = `${token}/${device}`;
    const result = useSyncExternalStore(
        subscribe,
        () => results.get(key) ?? null,
        () => null,
    );
    const started = useRef(false);

    useEffect(() => {
        if (!hydrated || started.current) return;
        started.current = true;
        verifyOnce(key, token, Number(device));
    }, [hydrated, key, token, device]);

    if (!result) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <span className="sr-only">Verifying device…</span>
            </div>
        );
    }

    if (!result.ok) return <DeviceVerificationFailed message={result.errors.message ?? 'Device verification failed. Please try logging in again.'} />;

    return (
        <DeviceVerified
            message="Device verified successfully! You can now log in without receiving security notifications for this device."
            device={result.data}
        />
    );
}
