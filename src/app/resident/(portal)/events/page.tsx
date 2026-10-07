import ResidentEventsView from '@/components/resident/events-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Events',
};

export default function ResidentEventsPage() {
    return <ResidentEventsView />;
}
