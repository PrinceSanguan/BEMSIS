'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser, useDb } from '@/lib/demo/store';
import { partnerDashboardProps } from '@/lib/views/partner';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function PartnerDashboardView() {
    const db = useDb();
    const user = useCurrentUser()!;
    const { stats } = useMemo(() => partnerDashboardProps(db, user), [db, user]);

    return (
        <div>
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
                            <Calendar className="h-8 w-8 text-indigo-600" />
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
        </div>
    );
}
