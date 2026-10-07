import { Providers } from '@/components/providers';
import type { Metadata, Viewport } from 'next';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-instrument-sans',
    display: 'swap',
});

// Absolute base for social preview URLs: NEXT_PUBLIC_SITE_URL if set, else the production domain.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bemsis.psanguan.com';

const description =
    'Barangay event management and resident information system: event approval workflow, QR code attendance, certificates, announcements and role-based dashboards for the Captain, Secretary, partner agencies and residents.';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'BEMSIS — Barangay Event Management & Information System',
        template: '%s - BEMSIS',
    },
    description,
    applicationName: 'BEMSIS',
    openGraph: {
        type: 'website',
        siteName: 'BEMSIS',
        title: 'BEMSIS — Barangay Event Management & Information System',
        description,
    },
};

export const viewport: Viewport = {
    themeColor: '#4F46E5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={instrumentSans.variable}>
            <body className="font-sans antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
