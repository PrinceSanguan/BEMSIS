import SecretaryUsersView from '@/components/secretary/users-view';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'User Management - Secretary',
};

export default function SecretaryUsersPage() {
    return (
        <Suspense fallback={null}>
            <SecretaryUsersView />
        </Suspense>
    );
}
