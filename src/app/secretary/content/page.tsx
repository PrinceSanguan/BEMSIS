import SecretaryContentView from '@/components/secretary/content-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Content & Guidelines - Secretary',
};

export default function SecretaryContentPage() {
    return <SecretaryContentView />;
}
