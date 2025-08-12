import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Calendar, Clock, Download, Eye } from 'lucide-react';
import { useState } from 'react';

interface Certificate {
    id: number;
    event_name: string;
    date_earned: string;
    type: string;
    status: string;
    file_path?: string;
}

interface Props {
    certificates: Certificate[];
}

export default function Certificates({ certificates }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleDownload = (certificate: Certificate) => {
        if (certificate.file_path) {
            const link = document.createElement('a');
            link.href = `/storage/${certificate.file_path}`;
            link.download = `Certificate_${certificate.event_name}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Certificate file not available');
        }
    };

    const handleView = (certificate: Certificate) => {
        if (certificate.file_path) {
            window.open(`/storage/${certificate.file_path}`, '_blank');
        } else {
            alert('Certificate file not available');
        }
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
                    <Header userName="Juan Dela Cruz" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
                            <p className="text-gray-600">View and download your earned certificates</p>
                        </div>

                        <Tabs defaultValue="mycerts" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="mycerts">My Certificates</TabsTrigger>
                                <TabsTrigger value="download">Download Center</TabsTrigger>
                            </TabsList>

                            {/* My Certificates */}
                            <TabsContent value="mycerts" className="space-y-4">
                                <div className="grid gap-4 md:gap-6">
                                    {certificates
                                        .filter((cert) => cert.status === 'available')
                                        .map((cert) => (
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
                                                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                                                        <div>
                                                            <p className="font-medium text-gray-700">Certificate Type</p>
                                                            <p className="text-gray-600">{cert.type}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-700">Date Earned</p>
                                                            <div className="flex items-center gap-1 text-gray-600">
                                                                <Calendar className="h-4 w-4" />
                                                                {cert.dateEarned}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-700">Training Hours</p>
                                                            <div className="flex items-center gap-1 text-gray-600">
                                                                <Clock className="h-4 w-4" />
                                                                {cert.hours} hours
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {cert.status === 'available' && (
                                                        <div className="flex gap-2 pt-2">
                                                            <Button size="sm" onClick={() => handleView(cert)} className="gap-2">
                                                                <Eye className="h-4 w-4" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDownload(cert)}
                                                                className="gap-2"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {cert.status === 'processing' && (
                                                        <div className="pt-2">
                                                            <p className="text-sm text-yellow-600">
                                                                Certificate is being processed. You will be notified once ready.
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            </TabsContent>

                            {/* Download Center */}
                            <TabsContent value="download" className="space-y-4">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Available Downloads</h3>
                                    <p className="text-sm text-gray-600">Certificates ready for download</p>
                                </div>

                                <div className="grid gap-4 md:gap-6">
                                    {availableCertificates.map((cert) => (
                                        <Card key={cert.id} className="shadow-sm">
                                            <CardHeader className="pb-3">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <CardTitle className="flex items-center gap-2 text-lg">
                                                        <Award className="h-5 w-5 text-blue-600" />
                                                        {cert.eventName}
                                                    </CardTitle>
                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(cert.status)}`}>
                                                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                    </span>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                                                    <div>
                                                        <p className="font-medium text-gray-700">Certificate Type</p>
                                                        <p className="text-gray-600">{cert.type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-700">Date Earned</p>
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <Calendar className="h-4 w-4" />
                                                            {cert.dateEarned}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-700">Training Hours</p>
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <Clock className="h-4 w-4" />
                                                            {cert.hours} hours
                                                        </div>
                                                    </div>
                                                </div>

                                                {cert.status === 'ready' && (
                                                    <div className="flex gap-2 pt-2">
                                                        <Button size="sm" onClick={() => handleDownload(cert)} className="gap-2">
                                                            <Download className="h-4 w-4" />
                                                            Download Certificate
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleView(cert)} className="gap-2">
                                                            <Eye className="h-4 w-4" />
                                                            Preview
                                                        </Button>
                                                    </div>
                                                )}

                                                {cert.status === 'pending' && (
                                                    <div className="pt-2">
                                                        <p className="text-sm text-gray-600">Certificate is being prepared. Check back later.</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </>
    );
}
