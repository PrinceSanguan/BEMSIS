import CaptainUsersView from '@/components/captain/users-view';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'User Management - Captain',
};

export default function CaptainUsersPage() {
    return (
        <Suspense fallback={null}>
            <CaptainUsersView />
        </Suspense>
    );
}
