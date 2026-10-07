import SecretaryDashboardView from '@/components/secretary/dashboard-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Secretary Dashboard',
};

export default function SecretaryDashboardPage() {
    return <SecretaryDashboardView />;
}
