import PartnerEventsView from '@/components/partner/events-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Events Management',
};

export default function PartnerEventsPage() {
    return <PartnerEventsView />;
}
