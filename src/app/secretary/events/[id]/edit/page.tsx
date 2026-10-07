import SecretaryEditEventView from '@/components/secretary/edit-event-view';
import { seedDatabase } from '@/lib/demo/seed';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Edit Event',
};

export function generateStaticParams() {
    return seedDatabase.events.map((e) => ({ id: String(e.id) }));
}

export default async function SecretaryEditEventPage({ params }: PageProps) {
    const { id } = await params;
    return <SecretaryEditEventView id={Number(id)} />;
}
