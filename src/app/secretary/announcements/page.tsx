import SecretaryAnnouncementsView from '@/components/secretary/announcements-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Announcements - Secretary',
};

export default function SecretaryAnnouncementsPage() {
    return <SecretaryAnnouncementsView />;
}
