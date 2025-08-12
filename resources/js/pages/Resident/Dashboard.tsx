import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Calendar, MessageSquare, QrCode } from 'lucide-react';
import { useState } from 'react';

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
}

export default function Dashboard({ stats, upcomingEvents }: Props) {
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
                    <Header userName="Juan Dela Cruz" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

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

                        {/* Upcoming Events */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Events</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {upcomingEvents.map((event) => (
                                        <div key={event.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                                <p className="text-sm text-gray-500">{new Date(event.start_date).toLocaleDateString()}</p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.registration_status)}`}
                                            >
                                                {event.registration_status?.charAt(0).toUpperCase() + event.registration_status?.slice(1) ||
                                                    'Available'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </>
    );
}
