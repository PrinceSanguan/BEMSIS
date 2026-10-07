import DeviceVerifyView from '@/components/auth/device-verify-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Device Verification',
    robots: { index: false },
};

export default async function DeviceVerifyPage({ params }: { params: Promise<{ token: string; device: string }> }) {
    const { token, device } = await params;
    return <DeviceVerifyView token={token} device={device} />;
}
