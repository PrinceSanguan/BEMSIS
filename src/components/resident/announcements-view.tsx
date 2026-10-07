'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser, useDb } from '@/lib/demo/store';
import { residentAnnouncementsProps } from '@/lib/views/resident-account';
import { Bell, Calendar, User } from 'lucide-react';
import { useMemo } from 'react';

export default function ResidentAnnouncementsView() {
    const db = useDb();
    const user = useCurrentUser()!;
    const { announcements } = useMemo(() => residentAnnouncementsProps(db, user), [db, user]);

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Announcements</h1>
                <p className="mt-2 text-gray-600">Stay updated with the latest community news and updates</p>
            </div>

            {/* Announcements List */}
            <div className="space-y-6">
                {announcements.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No announcements available</h3>
                            <p className="text-gray-500">There are currently no announcements for your area. Check back later for updates.</p>
                        </CardContent>
                    </Card>
                ) : (
                    announcements.map((announcement) => (
                        <Card key={announcement.id} className="transition-shadow hover:shadow-lg">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="mb-2 text-xl text-gray-900">{announcement.title}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                <span>By {announcement.created_by}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>{announcement.created_at}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={announcement.target_scope === 'All Puroks' ? 'default' : 'secondary'}>
                                        {announcement.target_scope}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">{announcement.content}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Info Card */}
            {announcements.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Bell className="mt-0.5 h-5 w-5 text-blue-600" />
                            <div>
                                <h4 className="font-medium text-blue-900">Stay Connected</h4>
                                <p className="mt-1 text-sm text-blue-700">
                                    You&apos;re viewing announcements targeted to your purok and community-wide announcements. Check back regularly
                                    for the latest updates.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
