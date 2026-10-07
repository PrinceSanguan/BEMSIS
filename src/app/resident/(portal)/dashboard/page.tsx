import ResidentDashboardView from '@/components/resident/dashboard-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Resident Dashboard',
};

export default function ResidentDashboardPage() {
    return <ResidentDashboardView />;
}
