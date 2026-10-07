'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDb } from '@/lib/demo/store';
import { route } from '@/lib/routes';
import { captainDashboardProps } from '@/lib/views/captain';
import { Calendar, CheckCircle, Clock, Users, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function CaptainDashboardView() {
    const db = useDb();
    const { stats } = useMemo(() => captainDashboardProps(db), [db]);

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
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            description: 'All time events',
        },
    ];

    return (
        <div>
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
                                You have <span className="font-semibold text-yellow-600">{stats.pendingEvents}</span> events waiting for your
                                approval.
                            </p>
                            {stats.pendingEvents > 0 ? (
                                <Link
                                    href={route('captain.events')}
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
                            <Users className="h-5 w-5 text-indigo-600" />
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
        </div>
    );
}
