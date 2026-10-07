'use client';

import { hydrateStore } from '@/lib/demo/store';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    // Load this visitor's saved demo data (or a fresh copy of the seed) once the page is interactive.
    useEffect(() => {
        hydrateStore();
    }, []);

    return children;
}
