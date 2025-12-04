import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Calendar, MessageSquare, QrCode } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface Props {
    stats: {
        eventsAttended: number;
        qrCodesGenerated: number;
        certificatesEarned: number;
        feedbackSubmitted: number;
    };
    upcomingEvents: Array<{
        id: number;
        title: string;
        start_date: string;
        registration_status: string;
    }>;
    recentCertificates: Array<{
        id: number;
        event_name: string;
        date_earned: string;
        certificate_code: string;
        view_url: string | null;
    }>;
}

export default function Dashboard({ stats, upcomingEvents, recentCertificates }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const dashboardStats = [
        { title: 'Events Attended', value: stats.eventsAttended.toString(), icon: Calendar, color: 'text-blue-600' },
        { title: 'QR Codes Generated', value: stats.qrCodesGenerated.toString(), icon: QrCode, color: 'text-green-600' },
        { title: 'Certificates Earned', value: stats.certificatesEarned.toString(), icon: Award, color: 'text-purple-600' },
        { title: 'Feedback Submitted', value: stats.feedbackSubmitted.toString(), icon: MessageSquare, color: 'text-orange-600' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'registered':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-blue-600 bg-blue-100';
        }
    };

    return (
        <>
            <Head title="Resident Dashboard" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="resident.dashboard" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="resident.dashboard" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
                            <p className="text-gray-600">Your community activity overview</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {dashboardStats.map((stat) => (
                                <Card key={stat.title}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {/* Recent Certificates Section */}
                        {recentCertificates.length > 0 && (
                            <Card className="mb-6">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-purple-600" />
                                        Recent Certificates
                                    </CardTitle>
                                    <a href={route('resident.certificates')} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        View All
                                    </a>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentCertificates.map((cert) => (
                                            <div key={cert.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-full bg-purple-100 p-2">
                                                        <Award className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{cert.event_name}</p>
                                                        <p className="text-sm text-gray-600">Earned on {cert.date_earned}</p>
                                                    </div>
                                                </div>
                                                {cert.view_url && (
                                                    <a
                                                        href={cert.view_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
