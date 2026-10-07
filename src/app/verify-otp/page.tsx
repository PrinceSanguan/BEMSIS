import VerifyOtpView from '@/components/auth/verify-otp-view';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Verify OTP',
};

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={null}>
            <VerifyOtpView />
        </Suspense>
    );
}
