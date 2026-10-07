import ForgotPasswordView from '@/components/auth/forgot-password-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordView />;
}
