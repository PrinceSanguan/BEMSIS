import ResidentProfileView from '@/components/resident/profile-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Profile',
};

export default function ResidentProfilePage() {
    return <ResidentProfileView />;
}
