import { RoleShell } from '@/components/layout/role-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: { index: false },
};

/** Secretary area: requires a signed-in secretary (the old SecretaryMiddleware). */
export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
    return <RoleShell role="secretary">{children}</RoleShell>;
}
