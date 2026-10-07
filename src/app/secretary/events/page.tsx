import SecretaryEventsView from '@/components/secretary/events-view';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Event Management',
};

export default function SecretaryEventsPage() {
    return (
        <Suspense fallback={null}>
            <SecretaryEventsView />
        </Suspense>
    );
}
