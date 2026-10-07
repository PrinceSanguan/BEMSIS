import { RoleShell } from '@/components/layout/role-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: { index: false },
};

/** Partner area: requires a signed-in partner agency (the old PartnerMiddleware). */
export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    return <RoleShell role="partner_agency">{children}</RoleShell>;
}
