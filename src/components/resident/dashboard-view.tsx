'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser, useDb } from '@/lib/demo/store';
import { useNow } from '@/lib/hooks';
import { route } from '@/lib/routes';
import { residentDashboardProps } from '@/lib/views/resident-account';
import { Award, Calendar, MessageSquare, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function ResidentDashboardView() {
    const db = useDb();
    const user = useCurrentUser()!;
    const now = useNow();
    const { stats, recentCertificates } = useMemo(() => residentDashboardProps(db, user, now), [db, user, now]);

    const dashboardStats = [
        { title: 'Events Attended', value: stats.eventsAttended.toString(), icon: Calendar, color: 'text-indigo-600' },
        { title: 'QR Codes Generated', value: stats.qrCodesGenerated.toString(), icon: QrCode, color: 'text-green-600' },
        { title: 'Certificates Earned', value: stats.certificatesEarned.toString(), icon: Award, color: 'text-purple-600' },
        { title: 'Feedback Submitted', value: stats.feedbackSubmitted.toString(), icon: MessageSquare, color: 'text-orange-600' },
    ];

    return (
        <div>
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
                        <Link href={route('resident.certificates')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            View All
                        </Link>
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
                                        <Link
                                            href={cert.view_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                                        >
                                            View
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
