import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head } from '@inertiajs/react';
import { Award, Calendar, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';

interface Stats {
    pendingUsers: number;
    pendingEvents: number;
    totalAttendees: number;
    certificatesIssued: number;
}

interface Props {
    stats: Stats;
}

export default function Dashboard({ stats }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const statCards = [
        {
            title: 'Pending Users',
            value: stats.pendingUsers,
            icon: Users,
            description: 'Users awaiting approval',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Pending Events',
            value: stats.pendingEvents,
            icon: Calendar,
            description: 'Events awaiting captain approval',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Total Attendees',
            value: stats.totalAttendees,
            icon: UserCheck,
            description: 'Confirmed event attendees',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Certificates Issued',
            value: stats.certificatesIssued,
            icon: Award,
            description: 'Total certificates distributed',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

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
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Secretary Dashboard</h1>
                                <p className="mt-2 text-gray-600">Manage user registrations, events, and attendance records</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {statCards.map((stat, index) => {
                                    const IconComponent = stat.icon;
                                    return (
                                        <Card key={index} className="transition-shadow hover:shadow-lg">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                                                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                                                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
                                                <p className="mt-1 text-xs text-gray-500">{stat.description}</p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            User Management
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-gray-600">Review and approve pending user registrations</p>
                                        {stats.pendingUsers > 0 ? (
                                            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                                <p className="font-medium text-orange-800">{stats.pendingUsers} users waiting for approval</p>
                                                <a
                                                    href="/secretary/users"
                                                    className="mt-2 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
                                                >
                                                    Review pending users →
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <p className="text-green-800">No pending user registrations</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Event Management
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-gray-600">Create and manage community events</p>
                                        {stats.pendingEvents > 0 ? (
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                                <p className="font-medium text-blue-800">{stats.pendingEvents} events awaiting captain approval</p>
                                                <a
                                                    href="/secretary/events"
                                                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                                                >
                                                    Manage events →
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">All events are up to date</p>
                                                <a
                                                    href="/secretary/events"
                                                    className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                                                >
                                                    Create new event →
                                                </a>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Quick Navigation Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        Quick Navigation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 hover:border-orange-300 hover:bg-orange-50"
                                            onClick={() => (window.location.href = '/secretary/users')}
                                        >
                                            <Users className="h-4 w-4 text-orange-600" />
                                            Manage Users
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 hover:border-blue-300 hover:bg-blue-50"
                                            onClick={() => (window.location.href = '/secretary/events')}
                                        >
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            Manage Events
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 hover:border-green-300 hover:bg-green-50"
                                            onClick={() => (window.location.href = '/secretary/attendance')}
                                        >
                                            <UserCheck className="h-4 w-4 text-green-600" />
                                            View Attendance
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 hover:border-purple-300 hover:bg-purple-50"
                                            onClick={() => (window.location.href = '/secretary/announcements')}
                                        >
                                            <Users className="h-4 w-4 text-purple-600" />
                                            Announcements
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 hover:border-amber-300 hover:bg-amber-50"
                                            onClick={() => (window.location.href = '/secretary/feedback')}
                                        >
                                            <Award className="h-4 w-4 text-amber-600" />
                                            Feedback
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start gap-2 hover:border-indigo-300 hover:bg-indigo-50"
                                            onClick={() => (window.location.href = '/secretary/content')}
                                        >
                                            <Calendar className="h-4 w-4 text-indigo-600" />
                                            Content
                                        </Button>
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
