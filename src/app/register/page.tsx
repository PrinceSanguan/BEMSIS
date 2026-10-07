import RegisterView from '@/components/auth/register-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account',
};

export default function RegisterPage() {
    return <RegisterView />;
}
