import ResidentCertificatesView from '@/components/resident/certificates-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Certificates',
};

export default function ResidentCertificatesPage() {
    return <ResidentCertificatesView />;
}
