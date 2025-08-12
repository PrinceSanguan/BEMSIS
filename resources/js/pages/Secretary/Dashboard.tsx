import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data
const dashboardStats = [
    { title: 'Total Users', value: '156', icon: Users, color: 'text-blue-600' },
    { title: 'Pending Approvals', value: '12', icon: Clock, color: 'text-yellow-600' },
    { title: 'Active Events', value: '8', icon: Calendar, color: 'text-green-600' },
    { title: 'Completed Events', value: '45', icon: CheckCircle, color: 'text-purple-600' },
];

const recentActivity = [
    { action: 'New user registration', user: 'Juan Dela Cruz', time: '2 mins ago' },
    { action: 'Event created', user: 'Maria Santos', time: '15 mins ago' },
    { action: 'User approved', user: 'Pedro Garcia', time: '1 hour ago' },
    { action: 'Event completed', user: 'Ana Lopez', time: '2 hours ago' },
];

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Head title="Secretary Dashboard" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.dashboard" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.dashboard" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Secretary" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                            <p className="text-gray-600">Community management statistics</p>
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
                                                <p className="text-sm text-gray-600">{activity.user}</p>
                                            </div>
                                            <span className="text-sm text-gray-500">{activity.time}</span>
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
