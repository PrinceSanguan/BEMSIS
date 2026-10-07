'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { openStoredFile } from '@/lib/demo/files';
import { useCurrentUser, useDb, useHydrated } from '@/lib/demo/store';
import { absoluteUrl } from '@/lib/domain/queries';
import { toDate } from '@/lib/format';
import { useQrScanner } from '@/lib/use-qr-scanner';
import { residentCertificatesProps, type ResidentCertificate } from '@/lib/views/resident';
import { Award, Camera, Download, Eye, FileCheck, FileUp, Link, QrCode, Scan, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useMemo, useRef, useState } from 'react';

const CERTIFICATE_PATH = '/resident/certificates/view/';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'available':
            return 'bg-green-100 text-green-800';
        case 'processing':
            return 'bg-yellow-100 text-yellow-800';
        case 'ready':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

/** "2026-09-23" shown in the visitor's locale (parsed as a local date, not UTC). */
const formatEarned = (date: string) => (toDate(date) ?? new Date(date)).toLocaleDateString();

/** Scanned certificate URL → in-app path, so codes from another deployment/host open here. */
function certificatePathFrom(text: string): string {
    try {
        const url = new URL(text, window.location.origin);
        return `${url.pathname}${url.search}`;
    } catch {
        return text.slice(text.indexOf(CERTIFICATE_PATH));
    }
}

export default function ResidentCertificatesView() {
    const db = useDb();
    const user = useCurrentUser()!;
    const hydrated = useHydrated();
    const router = useRouter();
    const { certificates } = useMemo(() => residentCertificatesProps(db, user), [db, user]);
    const [showScanner, setShowScanner] = useState(false);
    // Scanner controls for the result callback (the hook is created after the callback).
    const scannerControls = useRef<{ stop: () => void; resume: () => void; setError: (error: string | null) => void } | null>(null);

    const handleScannedQR = (qrCode: string) => {
        const controls = scannerControls.current;
        if (qrCode.includes(CERTIFICATE_PATH)) {
            controls?.stop();
            setShowScanner(false);
            router.push(certificatePathFrom(qrCode));
        } else {
            controls?.setError('Invalid certificate QR code');
            setTimeout(() => {
                controls?.setError(null);
                controls?.resume();
            }, 3000);
        }
    };

    const {
        videoRef,
        scanning: isScanning,
        error: scannerError,
        setError: setScannerError,
        start: startScanning,
        stop: stopScanning,
        resume,
    } = useQrScanner(handleScannedQR);

    useEffect(() => {
        scannerControls.current = { stop: stopScanning, resume, setError: setScannerError };
    }, [stopScanning, resume, setScannerError]);

    // The certificate QR opens the public page with ?download=1 (it prints / saves as PDF on arrival).
    const certificateQrValue = (cert: ResidentCertificate) => (hydrated ? `${absoluteUrl(cert.view_url)}?download=1` : '');

    const handleView = (cert: ResidentCertificate) => {
        router.push(cert.view_url);
    };

    const handleDownload = (cert: ResidentCertificate) => {
        window.open(`${cert.view_url}?download=1`, '_blank');
    };

    const closeScanner = () => {
        setShowScanner(false);
        stopScanning();
        setScannerError(null);
    };

    const availableCertificates = certificates.filter((cert) => cert.status === 'available');
    const processingCertificates = certificates.filter((cert) => cert.status === 'processing');

    const renderQrSection = (cert: ResidentCertificate) => (
        <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Scan QR Code to View Certificate</span>
            </div>
            <div className="flex justify-center">
                {certificateQrValue(cert) && (
                    <div className="h-32 w-32 overflow-hidden rounded-lg border bg-white shadow-sm">
                        <QRCodeSVG
                            value={certificateQrValue(cert)}
                            size={126}
                            marginSize={2}
                            title={`QR Code for ${cert.event_name} Certificate`}
                            className="h-full w-full"
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleView(cert)}>
                    <Eye className="h-4 w-4" />
                    View
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(cert)}>
                    <Download className="h-4 w-4" />
                    Download
                </Button>
            </div>
        </div>
    );

    const renderPartnerResources = (cert: ResidentCertificate) =>
        (cert.partner_feedback_link || cert.partner_certificate_path) && (
            <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Partner Agency Resources</p>
                <div className="flex flex-wrap gap-2">
                    {cert.partner_feedback_link && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(cert.partner_feedback_link!, '_blank', 'noopener')}
                        >
                            <Link className="h-4 w-4" />
                            Partner Feedback Form
                        </Button>
                    )}
                    {cert.partner_certificate_path && (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => openStoredFile(cert.partner_certificate_path)}>
                            <FileUp className="h-4 w-4" />
                            Partner Certificate
                        </Button>
                    )}
                </div>
            </div>
        );

    return (
        <>
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
                        <p className="text-gray-600">View and download your earned certificates from completed events.</p>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={() => setShowScanner(true)} variant="outline" className="gap-2">
                            <Camera className="h-4 w-4" />
                            Scan Certificate QR
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="available" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="available">Available ({availableCertificates.length})</TabsTrigger>
                        <TabsTrigger value="processing">Processing ({processingCertificates.length})</TabsTrigger>
                        <TabsTrigger value="all">All Certificates ({certificates.length})</TabsTrigger>
                    </TabsList>

                    {/* Available Certificates */}
                    <TabsContent value="available" className="space-y-4">
                        {availableCertificates.length > 0 ? (
                            <div className="grid gap-4 md:gap-6">
                                {availableCertificates.map((cert) => (
                                    <Card key={cert.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Award className="h-5 w-5 text-yellow-600" />
                                                    {cert.event_name}
                                                </CardTitle>
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}>
                                                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                </span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <p className="font-medium text-gray-700">Date Earned</p>
                                                    <p>{formatEarned(cert.date_earned)}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Type</p>
                                                    <p>{cert.type}</p>
                                                </div>
                                            </div>

                                            {renderQrSection(cert)}

                                            {/* Partner Resources */}
                                            {renderPartnerResources(cert)}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <CardContent>
                                    <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">No Certificates Available</h3>
                                    <p className="text-gray-600">Complete events to earn certificates!</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Processing Certificates */}
                    <TabsContent value="processing" className="space-y-4">
                        {processingCertificates.length > 0 ? (
                            <div className="grid gap-4 md:gap-6">
                                {processingCertificates.map((cert) => (
                                    <Card key={cert.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <FileCheck className="h-5 w-5 text-yellow-600" />
                                                    {cert.event_name}
                                                </CardTitle>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <p className="font-medium text-gray-700">Date Earned</p>
                                                    <p>{formatEarned(cert.date_earned)}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Type</p>
                                                    <p>{cert.type}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600">
                                                    Your certificate is being prepared. You will be notified once it&apos;s ready for download.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <CardContent>
                                    <FileCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">No Certificates Processing</h3>
                                    <p className="text-gray-600">All your certificates are ready for download!</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* All Certificates */}
                    <TabsContent value="all" className="space-y-4">
                        {certificates.length > 0 ? (
                            <div className="grid gap-4 md:gap-6">
                                {certificates.map((cert) => (
                                    <Card key={cert.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Award className="h-5 w-5 text-yellow-600" />
                                                    {cert.event_name}
                                                </CardTitle>
                                                {cert.status !== 'processing' && (
                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}>
                                                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <p className="font-medium text-gray-700">Date Earned</p>
                                                    <p>{formatEarned(cert.date_earned)}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Type</p>
                                                    <p>{cert.type}</p>
                                                </div>
                                            </div>

                                            {renderQrSection(cert)}

                                            {/* Partner Resources */}
                                            {renderPartnerResources(cert)}

                                            {cert.status === 'processing' && (
                                                <div className="pt-2">
                                                    <p className="text-sm text-gray-600">Certificate is being prepared. Check back later.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center">
                                <CardContent>
                                    <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">No Certificates Yet</h3>
                                    <p className="text-gray-600">Attend events and complete them to earn certificates!</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* QR Scanner Dialog */}
            {showScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Scan Certificate QR Code</h3>
                            <Button variant="ghost" size="sm" onClick={closeScanner} aria-label="Close scanner">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {scannerError && (
                                <div className="rounded-md bg-red-50 p-3">
                                    <p className="text-sm text-red-600">{scannerError}</p>
                                </div>
                            )}

                            {!isScanning && (
                                <div className="space-y-3">
                                    <Button onClick={startScanning} className="w-full gap-2">
                                        <Scan className="h-4 w-4" />
                                        Start Camera
                                    </Button>
                                </div>
                            )}

                            {isScanning && (
                                <div className="space-y-3">
                                    <div className="relative overflow-hidden rounded-lg bg-gray-900">
                                        <video ref={videoRef} className="h-[400px] w-full object-cover" autoPlay playsInline muted>
                                            Video stream not available.
                                        </video>

                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-pulse rounded-full bg-blue-500/90 px-4 py-2 text-sm font-medium text-white">
                                            Point camera at certificate QR code
                                        </div>
                                    </div>

                                    <Button variant="destructive" onClick={stopScanning} className="w-full">
                                        Stop Camera
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
