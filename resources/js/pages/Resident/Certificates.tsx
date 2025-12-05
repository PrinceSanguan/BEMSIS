import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Camera, FileCheck, QrCode, Scan, X } from 'lucide-react';
import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';

interface Certificate {
    id: number;
    event_name: string;
    date_earned: string;
    type: string;
    status: string;
    file_path?: string;
    certificate_code?: string;
    view_url?: string;
}

interface Props {
    certificates: Certificate[];
}

export default function Certificates({ certificates }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [scanResult, setScanResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const generateQRCodeUrl = (viewUrl: string) => {
        const downloadUrl = `${viewUrl}?download=1`;
        return (
            'https://api.qrserver.com/v1/create-qr-code/?' +
            new URLSearchParams({
                size: '200x200',
                data: downloadUrl,
                color: '000000',
                bgcolor: 'FFFFFF',
                ecc: 'M',
                margin: '10',
            }).toString()
        );
    };

    const handleView = (certificate: Certificate) => {
        window.open(certificate.view_url, '_blank');
    };

    const startScanning = async () => {
        try {
            setScannerError(null);
            setIsScanning(true);

            await new Promise((resolve) => setTimeout(resolve, 100));

            if (videoRef.current) {
                const video = videoRef.current;

                qrScannerRef.current = new QrScanner(
                    video,
                    (result) => {
                        handleScannedQR(result.data);
                    },
                    {
                        returnDetailedScanResult: true,
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                    },
                );

                await qrScannerRef.current.start();
                setStreaming(true);
            } else {
                setScannerError('Video element not available');
                setIsScanning(false);
            }
        } catch (err: any) {
            setScannerError(`Camera error: ${err.message}`);
            setIsScanning(false);
        }
    };

    const handleScannedQR = (qrCode: string) => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
        }

        try {
            if (qrCode.includes('/resident/certificates/view/')) {
                // Add download parameter to the URL
                const downloadUrl = qrCode.includes('?') ? `${qrCode}&download=1` : `${qrCode}?download=1`;
                setScanResult({
                    success: true,
                    message: 'Certificate QR code detected! Click the link below to download the certificate.',
                    downloadUrl: downloadUrl,
                });
            } else {
                setScannerError('Invalid certificate QR code');
                setTimeout(() => {
                    setScannerError(null);
                    if (qrScannerRef.current && isScanning) {
                        qrScannerRef.current.start();
                    }
                }, 3000);
            }
        } catch (error) {
            setScannerError('Failed to process QR code');
            setTimeout(() => {
                setScannerError(null);
                if (qrScannerRef.current && isScanning) {
                    qrScannerRef.current.start();
                }
            }, 3000);
        }
    };

    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
        }
        setIsScanning(false);
        setStreaming(false);
    };

    const handleManualQRInput = (qrData: string) => {
        try {
            if (qrData.includes('/resident/certificates/view/')) {
                window.open(qrData, '_blank');
                setShowScanner(false);
                setScannerError(null);
            } else {
                setScannerError('Invalid certificate QR code');
            }
        } catch (error) {
            setScannerError('Failed to process QR code');
        }
    };

    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, []);

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

    const availableCertificates = certificates.filter((cert) => cert.status === 'available');
    const processingCertificates = certificates.filter((cert) => cert.status === 'processing');

    return (
        <>
            <Head title="My Certificates" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="resident.certificates" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="resident.certificates" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl space-y-6">
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
                                                            {cert.status !== 'processing' && (
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}
                                                                >
                                                                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <p className="font-medium text-gray-700">Date Earned</p>
                                                                <p>{new Date(cert.date_earned).toLocaleDateString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700">Type</p>
                                                                <p>{cert.type}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3 pt-2">
                                                            <div className="flex items-center gap-3">
                                                                <QrCode className="h-5 w-5 text-gray-600" />
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    Scan QR Code to View Certificate
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-center">
                                                                <img
                                                                    src={generateQRCodeUrl(cert.view_url!)}
                                                                    alt={`QR Code for ${cert.event_name} Certificate`}
                                                                    className="h-32 w-32 rounded-lg border shadow-sm"
                                                                />
                                                            </div>
                                                        </div>
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
                                                                <p>{new Date(cert.date_earned).toLocaleDateString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700">Type</p>
                                                                <p>{cert.type}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4">
                                                            <p className="text-sm text-gray-600">
                                                                Your certificate is being prepared. You will be notified once it's ready for download.
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
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}
                                                                >
                                                                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <p className="font-medium text-gray-700">Date Earned</p>
                                                                <p>{new Date(cert.date_earned).toLocaleDateString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-700">Type</p>
                                                                <p>{cert.type}</p>
                                                            </div>
                                                        </div>

                                                        {cert.status === 'available' && (
                                                            <div className="flex flex-col gap-3 pt-2">
                                                                <div className="flex items-center gap-3">
                                                                    <QrCode className="h-5 w-5 text-gray-600" />
                                                                    <span className="text-sm font-medium text-gray-700">Scan it to download it</span>
                                                                </div>
                                                                <div className="flex justify-center">
                                                                    <img
                                                                        src={generateQRCodeUrl(cert.view_url!)}
                                                                        alt={`QR Code for ${cert.event_name} Certificate`}
                                                                        className="h-32 w-32 rounded-lg border shadow-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {cert.status === 'processing' && (
                                                            <div className="pt-2">
                                                                <p className="text-sm text-gray-600">
                                                                    Certificate is being prepared. Check back later.
                                                                </p>
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
                    </main>
                </div>
            </div>

            {/* QR Scanner Dialog */}
            {showScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Scan Certificate QR Code</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowScanner(false);
                                    stopScanning();
                                    setScannerError(null);
                                    setScanResult(null);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {scannerError && (
                                <div className="rounded-md bg-red-50 p-3">
                                    <p className="text-sm text-red-600">{scannerError}</p>
                                </div>
                            )}

                            {scanResult && (
                                <div className="rounded-md bg-green-50 p-4">
                                    <p className="mb-3 text-sm text-green-600">{scanResult.message}</p>
                                    {scanResult.downloadUrl && (
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                onClick={() => window.open(scanResult.downloadUrl, '_blank')}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                Download Certificate
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setScanResult(null);
                                                    setShowScanner(false);
                                                    stopScanning();
                                                }}
                                            >
                                                Close Scanner
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isScanning ? (
                                <div className="py-8 text-center">
                                    <Scan className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                    <p className="mb-4 text-sm text-gray-600">Use your camera to scan certificate QR codes</p>
                                    <Button onClick={startScanning} size="lg" className="gap-2">
                                        <Camera className="h-4 w-4" />
                                        Start Camera
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative overflow-hidden rounded-lg bg-black">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full bg-black object-cover"
                                            style={{ minHeight: '300px', maxHeight: '400px' }}
                                        >
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
