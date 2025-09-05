import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Download, Eye, FileCheck } from 'lucide-react';
import { useState } from 'react';

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
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const handleDownload = async (certificate: Certificate) => {
        setDownloadingId(certificate.id);
        try {
            // Open the certificate view page and trigger print
            const printWindow = window.open(certificate.view_url, '_blank');
            if (printWindow) {
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to open certificate. Please try again.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleView = (certificate: Certificate) => {
        window.open(certificate.view_url, '_blank');
    };

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
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
                                <p className="text-gray-600">View and download your earned certificates from completed events.</p>
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
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}
                                                            >
                                                                {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                            </span>
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

                                                        <div className="flex gap-2 pt-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleDownload(cert)}
                                                                disabled={downloadingId === cert.id}
                                                                className="gap-2"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                {downloadingId === cert.id ? 'Downloading...' : 'Download'}
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => handleView(cert)} className="gap-2">
                                                                <Eye className="h-4 w-4" />
                                                                Preview
                                                            </Button>
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
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}
                                                            >
                                                                Processing
                                                            </span>
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
                                                            <span
                                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}
                                                            >
                                                                {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                            </span>
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
                                                            <div className="flex gap-2 pt-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleDownload(cert)}
                                                                    disabled={downloadingId === cert.id}
                                                                    className="gap-2"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    {downloadingId === cert.id ? 'Downloading...' : 'Download'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleView(cert)}
                                                                    className="gap-2"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    Preview
                                                                </Button>
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
        </>
    );
}
