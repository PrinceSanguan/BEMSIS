import CaptainEventsView from '@/components/captain/events-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Event Approvals',
};

export default function CaptainEventsPage() {
    return <CaptainEventsView />;
}
