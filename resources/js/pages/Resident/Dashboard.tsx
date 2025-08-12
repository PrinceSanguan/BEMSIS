import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Calendar, MessageSquare, QrCode } from 'lucide-react';
import { useState } from 'react';

// Mock data
const dashboardStats = [
    { title: 'Events Attended', value: '12', icon: Calendar, color: 'text-blue-600' },
    { title: 'QR Codes Generated', value: '8', icon: QrCode, color: 'text-green-600' },
    { title: 'Certificates Earned', value: '5', icon: Award, color: 'text-purple-600' },
    { title: 'Feedback Submitted', value: '7', icon: MessageSquare, color: 'text-orange-600' },
];

const upcomingEvents = [
    { name: 'Community Clean-up Drive', date: '2025-08-20', status: 'registered' },
    { name: 'Health Seminar', date: '2025-08-25', status: 'pending' },
    { name: 'Basketball Tournament', date: '2025-08-30', status: 'available' },
    { name: 'Skills Workshop', date: '2025-09-05', status: 'available' },
];

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                                    {upcomingEvents.map((event, index) => (
                                        <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                                            <div>
                                                <p className="font-medium text-gray-900">{event.name}</p>
                                                <p className="text-sm text-gray-600">{event.date}</p>
                                            </div>
                                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
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
