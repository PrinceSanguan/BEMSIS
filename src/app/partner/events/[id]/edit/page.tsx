import PartnerEditEventView from '@/components/partner/edit-event-view';
import { seedDatabase } from '@/lib/demo/seed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Event',
};

export function generateStaticParams() {
    return seedDatabase.events.map((e) => ({ id: String(e.id) }));
}

export default async function PartnerEditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PartnerEditEventView id={Number(id)} />;
}
