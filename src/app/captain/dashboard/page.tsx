import CaptainDashboardView from '@/components/captain/dashboard-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Captain Dashboard',
};

export default function CaptainDashboardPage() {
    return <CaptainDashboardView />;
}
