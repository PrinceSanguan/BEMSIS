'use client';

import { withQuery } from '@/lib/routes';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Filter/pagination state kept in the URL query string (what Inertia's router.get(..., filters) did),
 * so filtered lists survive reloads. Components using this must render inside a <Suspense> boundary.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const filters = useMemo(() => {
        const values = {} as Record<K, string>;
        for (const key of keys) values[key] = searchParams.get(key) ?? '';
        return values;
    }, [searchParams, keys]);

    /** Merges `patch` into the query string. Keys ending in "page" reset unless they are in the patch. */
    const setFilters = useCallback(
        (patch: Partial<Record<K, string | number | null>>) => {
            const next: Record<string, string | number | null | undefined> = { ...filters, ...patch };
            for (const key of Object.keys(next)) if (key.endsWith('page') && !(key in patch)) delete next[key];
            router.replace(withQuery(pathname, next), { scroll: false });
        },
        [filters, pathname, router],
    );

    return { filters, setFilters };
}

/** Current time, refreshed every `intervalMs` (for "upcoming/ended" checks that should update while the page is open). */
export function useNow(intervalMs = 30_000): Date {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(timer);
    }, [intervalMs]);
    return now;
}
