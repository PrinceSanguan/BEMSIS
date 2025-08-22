import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Captain/Header';
import Sidebar from '@/pages/Captain/Sidebar';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle, Clock, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Stats {
    pendingEvents: number;
    approvedEvents: number;
    declinedEvents: number;
    totalEvents: number;
}

interface Props {
    stats: Stats;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Dashboard({ stats }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage<PageProps>().props;

    const statCards = [
        {
            title: 'Pending Events',
            value: stats.pendingEvents,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            description: 'Awaiting your approval',
        },
        {
            title: 'Approved Events',
            value: stats.approvedEvents,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            description: 'Successfully approved',
        },
        {
            title: 'Declined Events',
            value: stats.declinedEvents,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            description: 'Events declined',
        },
        {
            title: 'Total Events',
            value: stats.totalEvents,
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            description: 'All time events',
        },
    ];

    return (
        <>
            <Head title="Captain Dashboard" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="captain.dashboard" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="captain.dashboard" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Captain" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="mb-6 rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{flash.success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-6 rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{flash.error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">Captain Dashboard</h1>
                            <p className="text-gray-600">Overview of community events and management tasks</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {statCards.map((stat) => {
                                const IconComponent = stat.icon;
                                return (
                                    <Card key={stat.title} className="shadow-sm">
                                        <CardContent className="p-6">
                                            <div className="flex items-center">
                                                <div className={`rounded-md p-3 ${stat.bgColor}`}>
                                                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">{stat.description}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                        Pending Approvals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <p className="text-gray-600">
                                            You have <span className="font-semibold text-yellow-600">{stats.pendingEvents}</span> events waiting for
                                            your approval.
                                        </p>
                                        {stats.pendingEvents > 0 ? (
                                            <Link
                                                href="/captain/events"
                                                className="inline-flex items-center gap-2 rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                                            >
                                                <Clock className="h-4 w-4" />
                                                Review Events ({stats.pendingEvents})
                                            </Link>
                                        ) : (
                                            <p className="text-sm text-green-600">All events have been reviewed! ✅</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        Event Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Events:</span>
                                            <span className="font-medium">{stats.totalEvents}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Approval Rate:</span>
                                            <span className="font-medium text-green-600">
                                                {stats.totalEvents > 0 ? Math.round((stats.approvedEvents / stats.totalEvents) * 100) : 0}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">Keep the community engaged with quality events.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
