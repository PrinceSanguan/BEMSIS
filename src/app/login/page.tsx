import LoginView from '@/components/auth/login-view';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Login',
};

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginView />
        </Suspense>
    );
}
