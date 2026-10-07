import PartnerDashboardView from '@/components/partner/dashboard-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Partner Dashboard',
};

export default function PartnerDashboardPage() {
    return <PartnerDashboardView />;
}
