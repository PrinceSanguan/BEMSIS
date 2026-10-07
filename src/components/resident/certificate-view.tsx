'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDb, useHydrated } from '@/lib/demo/store';
import { siteConfig } from '@/lib/site';
import { certificatePreviewProps, certificateViewProps, type CertificateProps } from '@/lib/views/resident';
import { Award } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import './certificate-view.css';

const municipality = siteConfig.municipality.toUpperCase();
const province = siteConfig.province.toUpperCase();

function Certificate({ userName, eventTitle, certificateCode, autoDownload }: CertificateProps) {
    const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);

    // Auto-download when accessed via QR code (?download=1): open the print dialog once (Save as PDF).
    useEffect(() => {
        if (!autoDownload || hasAutoDownloaded) return;
        const timer = setTimeout(() => {
            setHasAutoDownloaded(true);
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, [autoDownload, hasAutoDownloaded]);

    useEffect(() => {
        document.title = `Certificate - ${eventTitle} - BEMSIS`;
    }, [eventTitle]);

    return (
        <div className="bemsis-certificate">
            <div className="certificate-container">
                <div className="certificate-border">
                    {/* Header with Two Logos */}
                    <div className="header-section">
                        <div className="logo-left">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/assets/images/virac-logo.png" alt="Virac Logo" className="header-logo" />
                        </div>
                        <div className="header-text">
                            <p className="gov-header">REPUBLIC OF THE PHILIPPINES</p>
                            <p className="province-header">PROVINCE OF {province}</p>
                            <p className="municipality-header">MUNICIPALITY OF {municipality}</p>
                            <h1 className="barangay-header">{siteConfig.barangay.toUpperCase()}</h1>
                        </div>
                        <div className="logo-right">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/assets/images/barangay-logo.jpg" alt="Barangay Logo" className="header-logo" />
                        </div>
                    </div>

                    {/* Certificate Title */}
                    <h2 className="certificate-title">Certificate of Completion</h2>
                    <p className="certificate-subtitle">This Certificate is Proudly Presented To</p>

                    {/* Recipient Name */}
                    <div className="recipient-section">
                        <div className="recipient-name">{userName.toUpperCase()}</div>
                        <div className="name-underline"></div>
                    </div>

                    {/* Completion Text */}
                    <p className="completion-text">Has Successfully Completed the Community Event</p>

                    {/* Event Title */}
                    <div className="event-title">{eventTitle.toUpperCase()}</div>

                    {/* Bottom Section */}
                    <div className="bottom-section">
                        {/* Left: System Note */}
                        <div className="system-note">
                            <p className="note-italic">This certificate is system-generated and</p>
                            <p className="note-italic">includes authorized e-signatures from</p>
                            <p className="note-italic">{siteConfig.barangay}.</p>
                        </div>

                        {/* Center: Signature */}
                        <div className="signature-section">
                            <div className="signature-placeholder">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/assets/images/signature.png" alt="Captain's Signature" className="signature-image" />
                            </div>
                            <div className="signature-line"></div>
                            <p className="captain-name">{siteConfig.captain_name.toUpperCase()}</p>
                            <p className="captain-title">PUNONG BARANGAY</p>
                        </div>

                        {/* Right: Certificate Info */}
                        <div className="certificate-info">
                            <p className="cert-id">Certificate ID:{certificateCode}</p>
                            <p className="date-issued">
                                Date Issued: {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <span className="sr-only">Loading…</span>
        </div>
    );
}

function CertificateNotFound({ code }: { code: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md text-center shadow-sm">
                <CardContent className="space-y-4 p-8">
                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                    <h1 className="text-xl font-semibold text-gray-900">Certificate not found</h1>
                    <p className="text-sm text-gray-600">
                        We couldn&apos;t find a certificate with the code{' '}
                        <span className="font-mono font-medium break-all text-gray-800">{code}</span>.
                    </p>
                    <p className="text-sm text-gray-500">
                        This demo keeps its data in each visitor&apos;s browser, so certificates earned in another browser or device aren&apos;t
                        available here.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                        <Button asChild>
                            <Link href="/resident/certificates">My Certificates</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Back to BEMSIS</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/** Public certificate page: /resident/certificates/view/{code} (?download=1 opens the print dialog). */
export default function CertificateView({ code }: { code: string }) {
    const db = useDb();
    const hydrated = useHydrated();
    const searchParams = useSearchParams();
    const autoDownload = searchParams.has('download');
    const props = useMemo(() => certificateViewProps(db, code, autoDownload), [db, code, autoDownload]);

    if (!hydrated) return <Loading />;
    if (!props) return <CertificateNotFound code={code} />;
    return <Certificate {...props} />;
}

/** /resident/certificates/preview: a sample certificate with placeholder data. */
export function CertificatePreview() {
    const hydrated = useHydrated();
    // Rendered after hydration only, so "today" is the visitor's date rather than the build date.
    if (!hydrated) return <Loading />;
    return <Certificate {...certificatePreviewProps()} />;
}
