import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Partner/Header';
import Sidebar from '@/pages/Partner/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';

interface DashboardProps {
    stats: {
        myEvents: number;
        pendingEvents: number;
        approvedEvents: number;
        declinedEvents: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
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
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Events</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.myEvents}</p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.pendingEvents}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-yellow-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Approved Events</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.approvedEvents}</p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Declined Events</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.declinedEvents}</p>
                                        </div>
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        {/* Stats Grid */}
                        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Events</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.myEvents}</p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.pendingEvents}</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-yellow-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Approved Events</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.approvedEvents}</p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Declined Events</p>
                                            <p className="text-3xl font-bold text-gray-900">{stats.declinedEvents}</p>
                                        </div>
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Event Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Events Created</span>
                                        <span className="font-semibold">{stats.myEvents}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Success Rate</span>
                                        <span className="font-semibold">
                                            {stats.myEvents > 0 ? Math.round((stats.approvedEvents / stats.myEvents) * 100) : 0}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Awaiting Review</span>
                                        <span className="font-semibold text-yellow-600">{stats.pendingEvents}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </>
    );
}
