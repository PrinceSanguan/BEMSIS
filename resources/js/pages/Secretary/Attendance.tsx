import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { BarChart3, Calendar, CheckCircle, Clock, Eye, MapPin, TrendingDown, TrendingUp, UserCheck, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Purok {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    has_certificate: boolean;
    status: 'pending' | 'approved' | 'declined';
    creator: User;
    purok?: Purok;
    total_confirmed: number;
    total_scanned: number;
    attendance_rate: number;
    created_at: string;
}

interface Props {
    events: Event[];
    className?: string;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Attendance({ events, className }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getAttendanceColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600';
        if (rate >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getAttendanceBadge = (rate: number) => {
        if (rate >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (rate >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    const isEventPast = (startDate: string) => {
        return new Date(startDate) < new Date();
    };

    // Calculate overall statistics
    const totalEvents = events.length;
    const totalConfirmed = events.reduce((sum, event) => sum + event.total_confirmed, 0);
    const totalScanned = events.reduce((sum, event) => sum + event.total_scanned, 0);
    const overallAttendanceRate = totalConfirmed > 0 ? Math.round((totalScanned / totalConfirmed) * 100) : 0;

    return (
        <>
            <Head title="Attendance Management - Secretary" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.attendance" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.attendance" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${className || ''}`}>
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                                <p className="mt-2 text-gray-600">Monitor and manage event attendance records</p>
                            </div>

                            {/* Flash Messages */}
                            {flash?.success && (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                                </Alert>
                            )}

                            {flash?.error && (
                                <Alert className="border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Overall Statistics */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Events</p>
                                                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                                            </div>
                                            <Calendar className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Confirmed</p>
                                                <p className="text-2xl font-bold text-gray-900">{totalConfirmed}</p>
                                            </div>
                                            <Users className="h-8 w-8 text-green-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Attended</p>
                                                <p className="text-2xl font-bold text-gray-900">{totalScanned}</p>
                                            </div>
                                            <UserCheck className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Overall Rate</p>
                                                <p className={`text-2xl font-bold ${getAttendanceColor(overallAttendanceRate)}`}>
                                                    {overallAttendanceRate}%
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                {overallAttendanceRate >= 70 ? (
                                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="h-8 w-8 text-red-600" />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Events Attendance List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Event Attendance Records
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {events.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900">No events found</h3>
                                            <p className="text-gray-600">No events available for attendance tracking.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {events.map((event) => {
                                                const isPast = isEventPast(event.start_date);

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                                    <Badge variant="outline" className={getAttendanceBadge(event.attendance_rate)}>
                                                                        {event.attendance_rate}% attendance
                                                                    </Badge>
                                                                    {!isPast && (
                                                                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                                                            Ongoing
                                                                        </Badge>
                                                                    )}
                                                                    {event.has_certificate && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="border-purple-200 bg-purple-50 text-purple-700"
                                                                        >
                                                                            Certificate Event
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <p className="text-sm text-gray-600">{event.description}</p>

                                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4" />
                                                                        <span>{formatDate(event.start_date)}</span>
                                                                    </div>
                                                                    {event.purok && (
                                                                        <div className="flex items-center gap-2">
                                                                            <MapPin className="h-4 w-4" />
                                                                            <span>{event.purok?.name || 'All Residents'}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4" />
                                                                        <span>{event.total_confirmed} confirmed</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <UserCheck className="h-4 w-4" />
                                                                        <span>{event.total_scanned} attended</span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-xs text-gray-500">
                                                                    Created by: {event.creator.name} • {formatDate(event.created_at)}
                                                                </div>
                                                            </div>

                                                            <div className="flex min-w-[140px] flex-col gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => router.get(`/secretary/events/${event.id}/attendees`)}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Button>

                                                                {/* Attendance Progress Bar */}
                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between text-xs text-gray-600">
                                                                        <span>Attendance</span>
                                                                        <span>{event.attendance_rate}%</span>
                                                                    </div>
                                                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                                                        <div
                                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                                event.attendance_rate >= 80
                                                                                    ? 'bg-green-500'
                                                                                    : event.attendance_rate >= 60
                                                                                      ? 'bg-yellow-500'
                                                                                      : 'bg-red-500'
                                                                            }`}
                                                                            style={{ width: `${event.attendance_rate}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
