import CaptainUserDetailsView from '@/components/captain/user-details-view';
import { seedDatabase } from '@/lib/demo/seed';
import type { Metadata } from 'next';

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
    return seedDatabase.users.map((u) => ({ id: String(u.id) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { id } = await params;
    const user = seedDatabase.users.find((u) => String(u.id) === id);
    return { title: user ? `User Details - ${user.name}` : 'User Details' };
}

export default async function CaptainUserDetailsPage({ params }: Params) {
    const { id } = await params;
    return <CaptainUserDetailsView id={Number(id)} />;
}
