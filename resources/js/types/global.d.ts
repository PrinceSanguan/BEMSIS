import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
}

interface PageProps {
    [key: string]: any; // This allows any additional properties
    // ... other specific properties if you have any
}
