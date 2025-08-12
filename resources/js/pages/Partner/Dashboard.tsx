import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Partner/Header';
import Sidebar from '@/pages/Partner/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data
const dashboardStats = [
    { title: 'Events Created', value: '12', icon: Calendar, color: 'text-blue-600' },
    { title: 'Pending Approval', value: '3', icon: Clock, color: 'text-yellow-600' },
    { title: 'Approved Events', value: '8', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Total Participants', value: '245', icon: Users, color: 'text-purple-600' },
];

const recentActivity = [
    { action: 'Event submitted for approval', event: 'Health Workshop', time: '2 hours ago', status: 'pending' },
    { action: 'Event approved', event: 'Community Training', time: '1 day ago', status: 'approved' },
    { action: 'Event completed', event: 'Skills Development', time: '3 days ago', status: 'completed' },
    { action: 'Event created', event: 'Youth Program', time: '5 days ago', status: 'draft' },
];

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'completed':
                return 'text-gray-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        <>
            <Head title="Partner Dashboard" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="partner.dashboard" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="partner.dashboard" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Partner" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                            <p className="text-gray-600">Your partnership and event statistics</p>
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

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.action}</p>
                                                <p className="text-sm text-gray-600">{activity.event}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                                                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                </span>
                                                <p className="text-sm text-gray-500">{activity.time}</p>
                                            </div>
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
