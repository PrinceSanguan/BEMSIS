import ResidentAnnouncementsView from '@/components/resident/announcements-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Announcements - Resident',
};

export default function ResidentAnnouncementsPage() {
    return <ResidentAnnouncementsView />;
}
