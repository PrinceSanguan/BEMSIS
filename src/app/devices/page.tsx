import DeviceManagementView from '@/components/auth/device-management-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Device Management',
    robots: { index: false },
};

export default function DevicesPage() {
    return <DeviceManagementView />;
}
