// Demo uploads (event posters, valid IDs, partner certificates) are kept as Blobs in IndexedDB so they survive a reload
// without filling up localStorage. Records reference them as "idb:<id>".

import { useEffect, useState } from 'react';

const DB_NAME = 'bemsis-files';
const STORE = 'files';
const PREFIX = 'idb:';

export const isStoredFile = (path: string | null | undefined): path is `idb:${string}` => !!path && path.startsWith(PREFIX);

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await openDb();
    return new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = action(tx.objectStore(STORE));
        tx.oncomplete = () => {
            db.close();
            resolve(request.result);
        };
        tx.onerror = () => {
            db.close();
            reject(tx.error);
        };
    });
}

export async function storeFile(file: Blob): Promise<string> {
    // randomUUID needs a secure context (https/localhost); fall back for plain-http LAN testing.
    const id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    await run('readwrite', (store) => store.put(file, id));
    return `${PREFIX}${id}`;
}

export async function deleteStoredFile(path: string | null | undefined): Promise<void> {
    if (!isStoredFile(path)) return;
    await run('readwrite', (store) => store.delete(path.slice(PREFIX.length))).catch(() => undefined);
}

export async function clearStoredFiles(): Promise<void> {
    await run('readwrite', (store) => store.clear()).catch(() => undefined);
}

const urlCache = new Map<string, Promise<string | null>>();

/** Object URL for an `idb:` reference (cached for the page's lifetime). */
export function resolveStoredFile(path: string): Promise<string | null> {
    if (!urlCache.has(path)) {
        urlCache.set(
            path,
            run<Blob | undefined>('readonly', (store) => store.get(path.slice(PREFIX.length)))
                .then((blob) => (blob ? URL.createObjectURL(blob) : null))
                .catch(() => null),
        );
    }
    return urlCache.get(path)!;
}

/**
 * Turns a stored path into something an <img>/loader can use. Public paths pass through; `idb:`
 * paths resolve asynchronously (undefined while loading, null if the file is gone).
 */
export function useAssetUrl(path: string | null | undefined): string | null | undefined {
    const [resolved, setResolved] = useState<{ path: string; url: string | null } | null>(null);

    useEffect(() => {
        if (!isStoredFile(path)) return;
        let cancelled = false;
        resolveStoredFile(path).then((url) => {
            if (!cancelled) setResolved({ path, url });
        });
        return () => {
            cancelled = true;
        };
    }, [path]);

    if (!path) return null;
    if (!isStoredFile(path)) return path;
    return resolved?.path === path ? resolved.url : undefined;
}

/** Opens a stored upload (or a /public path) in a new tab, e.g. a resident's valid ID. */
export async function openStoredFile(path: string | null | undefined): Promise<void> {
    if (!path) return;
    const url = isStoredFile(path) ? await resolveStoredFile(path) : path;
    if (url) window.open(url, '_blank', 'noopener');
}

/** Downloads a stored upload (or a /public path) under the given file name. */
export async function downloadStoredFile(path: string | null | undefined, fileName: string): Promise<void> {
    if (!path) return;
    const url = isStoredFile(path) ? await resolveStoredFile(path) : path;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
