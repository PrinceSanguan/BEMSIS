import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { Bell, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface Announcement {
    id: number;
    title: string;
    content: string;
    created_by: string;
    created_at: string;
    target_scope: string;
}

interface Props {
    announcements: Announcement[];
}

export default function Announcements({ announcements }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            <Head title="Announcements - Resident" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="resident.announcements" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="resident.announcements" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
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
                                            <p className="text-gray-500">
                                                There are currently no announcements for your area. Check back later for updates.
                                            </p>
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
                                                    You're viewing announcements targeted to your purok and community-wide announcements. Check back
                                                    regularly for the latest updates.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
