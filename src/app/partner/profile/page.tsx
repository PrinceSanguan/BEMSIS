import PartnerProfileView from '@/components/partner/profile-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profile Settings',
};

export default function PartnerProfilePage() {
    return <PartnerProfileView />;
}
