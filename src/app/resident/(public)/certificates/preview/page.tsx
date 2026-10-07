import { CertificatePreview } from '@/components/resident/certificate-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Certificate - Sample Community Event',
};

export default function CertificatePreviewPage() {
    return <CertificatePreview />;
}
