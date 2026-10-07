import SecretaryUserDetailView from '@/components/secretary/user-detail-view';
import { seedDatabase } from '@/lib/demo/seed';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ id: string }>;
}

export function generateStaticParams() {
    return seedDatabase.users.map((u) => ({ id: String(u.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const user = seedDatabase.users.find((u) => u.id === Number(id));
    return { title: user ? `User Details - ${user.name}` : 'User Details' };
}

export default async function SecretaryUserDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <SecretaryUserDetailView id={Number(id)} />;
}
