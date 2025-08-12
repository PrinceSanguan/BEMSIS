import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Download, FileText, MessageSquare, Star } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockFeedback = [
    {
        id: 1,
        eventName: 'Community Clean-up Drive',
        userName: 'Juan Dela Cruz',
        rating: 5,
        comment: 'Great event! Very well organized and meaningful for our community.',
        date: '2025-08-20',
    },
    {
        id: 2,
        eventName: 'Basketball Tournament',
        userName: 'Maria Santos',
        rating: 4,
        comment: 'Fun tournament, but could use better scheduling.',
        date: '2025-08-25',
    },
    {
        id: 3,
        eventName: 'Health Seminar',
        userName: 'Pedro Garcia',
        rating: 5,
        comment: 'Very informative. Learned a lot about health and wellness.',
        date: '2025-08-15',
    },
];

const mockCertifications = [
    {
        id: 1,
        eventName: 'Community Clean-up Drive',
        userName: 'Juan Dela Cruz',
        attendanceHours: 4,
        status: 'eligible',
        date: '2025-08-20',
    },
    {
        id: 2,
        eventName: 'Health Seminar',
        userName: 'Maria Santos',
        attendanceHours: 3,
        status: 'issued',
        date: '2025-08-15',
    },
    {
        id: 3,
        eventName: 'Basketball Tournament',
        userName: 'Pedro Garcia',
        attendanceHours: 6,
        status: 'pending',
        date: '2025-08-25',
    },
];

export default function Content() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [certifications, setCertifications] = useState(mockCertifications);

    const generateCertificate = (certId: number) => {
        setCertifications((certs) => certs.map((cert) => (cert.id === certId ? { ...cert, status: 'issued' } : cert)));
        alert('Certificate generated successfully!');
    };

    const downloadCertificate = (cert: any) => {
        // Mock download
        alert(`Downloading certificate for ${cert.userName} - ${cert.eventName}`);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    const getCertStatusColor = (status: string) => {
        switch (status) {
            case 'issued':
                return 'bg-green-100 text-green-800';
            case 'eligible':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <>
            <Head title="Content Management" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.content" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.content" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Secretary" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
                            <p className="text-gray-600">Manage feedback and certificates</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {/* Feedback Section */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <MessageSquare className="h-5 w-5" />
                                    Event Feedback
                                </h3>

                                {mockFeedback.map((feedback) => (
                                    <Card key={feedback.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{feedback.eventName}</CardTitle>
                                                    <p className="text-sm text-gray-600">{feedback.userName}</p>
                                                </div>
                                                <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <p className="mb-2 text-sm text-gray-700">{feedback.comment}</p>
                                            <p className="text-xs text-gray-500">{feedback.date}</p>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="mt-2"
                                                        onClick={() => setSelectedFeedback(feedback)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Feedback Details</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="font-semibold">{feedback.eventName}</p>
                                                            <p className="text-sm text-gray-600">by {feedback.userName}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm">Rating:</span>
                                                            <div className="flex gap-1">{renderStars(feedback.rating)}</div>
                                                        </div>
                                                        <div>
                                                            <p className="mb-2 font-medium">Comment:</p>
                                                            <Textarea value={feedback.comment} readOnly className="min-h-[100px]" />
                                                        </div>
                                                        <p className="text-sm text-gray-500">Submitted: {feedback.date}</p>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Certification Section */}
                            <div className="space-y-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                    <Award className="h-5 w-5" />
                                    Certificates
                                </h3>

                                {certifications.map((cert) => (
                                    <Card key={cert.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{cert.eventName}</CardTitle>
                                                    <p className="text-sm text-gray-600">{cert.userName}</p>
                                                </div>
                                                <Badge className={getCertStatusColor(cert.status)}>
                                                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-2 text-sm">
                                                <p>
                                                    <span className="font-medium">Hours:</span> {cert.attendanceHours}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Date:</span> {cert.date}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                {cert.status === 'eligible' && (
                                                    <Button size="sm" onClick={() => generateCertificate(cert.id)} className="gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        Generate
                                                    </Button>
                                                )}

                                                {cert.status === 'issued' && (
                                                    <Button size="sm" variant="outline" onClick={() => downloadCertificate(cert)} className="gap-2">
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
