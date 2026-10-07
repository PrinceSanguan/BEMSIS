import { RoleShell } from '@/components/layout/role-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: { index: false },
};

/** Resident area: requires a signed-in resident (the old ResidentMiddleware). */
export default function ResidentLayout({ children }: { children: React.ReactNode }) {
    return <RoleShell role="resident">{children}</RoleShell>;
}
