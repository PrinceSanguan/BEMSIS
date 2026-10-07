import ResetPasswordView from '@/components/auth/reset-password-view';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Reset Password',
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordView />
        </Suspense>
    );
}
