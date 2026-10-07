import SecretaryEventAttendeesView from '@/components/secretary/event-attendees-view';
import { seedDatabase } from '@/lib/demo/seed';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ id: string }>;
}

export function generateStaticParams() {
    return seedDatabase.events.map((e) => ({ id: String(e.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const event = seedDatabase.events.find((e) => e.id === Number(id));
    return { title: event ? `Attendees - ${event.title}` : 'Event Attendees' };
}

export default async function SecretaryEventAttendeesPage({ params }: PageProps) {
    const { id } = await params;
    return <SecretaryEventAttendeesView id={Number(id)} />;
}
