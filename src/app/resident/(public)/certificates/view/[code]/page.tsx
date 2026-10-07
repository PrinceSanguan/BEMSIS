import CertificateView from '@/components/resident/certificate-view';
import { seedDatabase } from '@/lib/demo/seed';
import type { Metadata } from 'next';
import { Suspense } from 'react';

type Params = Promise<{ code: string }>;

// Seed certificates are prerendered; codes earned in the demo render on demand and are looked up in the visitor's browser.
export function generateStaticParams() {
    return seedDatabase.certificates.map((c) => ({ code: c.certificate_code }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { code } = await params;
    const certificate = seedDatabase.certificates.find((c) => c.certificate_code === code);
    const event = seedDatabase.events.find((e) => e.id === certificate?.event_id);
    return { title: event ? `Certificate - ${event.title}` : 'Certificate' };
}

export default async function CertificateViewPage({ params }: { params: Params }) {
    const { code } = await params;
    return (
        <Suspense fallback={null}>
            <CertificateView code={code} />
        </Suspense>
    );
}
