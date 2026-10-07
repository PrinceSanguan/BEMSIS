import { RoleShell } from '@/components/layout/role-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: { index: false },
};

/** Captain area: requires a signed-in captain (the old CaptainMiddleware). */
export default function CaptainLayout({ children }: { children: React.ReactNode }) {
    return <RoleShell role="captain">{children}</RoleShell>;
}
