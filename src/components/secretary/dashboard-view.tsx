'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDb } from '@/lib/demo/store';
import { route } from '@/lib/routes';
import { secretaryDashboardProps } from '@/lib/views/secretary';
import { Award, Calendar, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function SecretaryDashboardView() {
    const db = useDb();
    const { stats } = useMemo(() => secretaryDashboardProps(db), [db]);

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
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
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

    const quickLinks = [
        {
            href: route('secretary.users'),
            label: 'Manage Users',
            icon: Users,
            className: 'hover:border-orange-300 hover:bg-orange-50',
            iconClass: 'text-orange-600',
        },
        {
            href: route('secretary.events'),
            label: 'Manage Events',
            icon: Calendar,
            className: 'hover:border-indigo-300 hover:bg-indigo-50',
            iconClass: 'text-indigo-600',
        },
        {
            href: route('secretary.attendance'),
            label: 'View Attendance',
            icon: UserCheck,
            className: 'hover:border-green-300 hover:bg-green-50',
            iconClass: 'text-green-600',
        },
        {
            href: route('secretary.announcements'),
            label: 'Announcements',
            icon: Users,
            className: 'hover:border-purple-300 hover:bg-purple-50',
            iconClass: 'text-purple-600',
        },
        {
            href: route('secretary.feedback'),
            label: 'Feedback',
            icon: Award,
            className: 'hover:border-amber-300 hover:bg-amber-50',
            iconClass: 'text-amber-600',
        },
        {
            href: route('secretary.content'),
            label: 'Content',
            icon: Calendar,
            className: 'hover:border-indigo-300 hover:bg-indigo-50',
            iconClass: 'text-indigo-600',
        },
    ];

    return (
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
                                <Link
                                    href={route('secretary.users')}
                                    className="mt-2 inline-block text-sm font-medium text-orange-600 hover:text-orange-700"
                                >
                                    Review pending users →
                                </Link>
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
                            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                                <p className="font-medium text-indigo-800">{stats.pendingEvents} events awaiting captain approval</p>
                                <Link
                                    href={route('secretary.events')}
                                    className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    Manage events →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">All events are up to date</p>
                                <Link
                                    href={route('secretary.events')}
                                    className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    Create new event →
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Quick Navigation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
                        {quickLinks.map((link) => (
                            <Button key={link.href} asChild variant="outline" className={`w-full justify-start gap-2 ${link.className}`}>
                                <Link href={link.href}>
                                    <link.icon className={`h-4 w-4 ${link.iconClass}`} />
                                    {link.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
