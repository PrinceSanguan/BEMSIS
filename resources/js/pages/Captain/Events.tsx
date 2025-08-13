import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Captain/Header';
import Sidebar from '@/pages/Captain/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { useState } from 'react';

interface Purok {
    id: number;
    name: string;
}

interface Creator {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    has_certificate: boolean;
    status: 'pending' | 'approved' | 'declined';
    creator: Creator;
    creator_role: string;
    purok?: Purok;
    created_at: string;
}

interface Props {
    pendingEvents: Event[];
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Events({ pendingEvents }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [processing, setProcessing] = useState<number | null>(null);
    const { flash } = usePage<PageProps>().props;

    const handleEventAction = async (eventId: number, action: 'approve' | 'decline') => {
        setProcessing(eventId);

        try {
            await router.patch(
                `/captain/events/${eventId}/${action}`,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setProcessing(null),
                },
            );
        } catch (error) {
            setProcessing(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'secretary':
                return 'bg-blue-100 text-blue-800';
            case 'partner_agency':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'secretary':
                return 'Secretary';
            case 'partner_agency':
                return 'Partner Agency';
            default:
                return role;
        }
    };

    return (
        <>
            <Head title="Event Approvals" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar />
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
                            <h1 className="text-3xl font-bold text-gray-900">Event Approvals</h1>
                            <p className="text-gray-600">Review and approve community event requests</p>
                        </div>

                        {/* Events List */}
                        {pendingEvents.length === 0 ? (
                            <Card className="shadow-sm">
                                <CardContent className="p-8 text-center">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
                                    <p className="mt-2 text-gray-600">There are no pending events to review at this time.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {pendingEvents.map((event) => (
                                    <Card key={event.id} className="shadow-sm">
                                        <CardHeader className="pb-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="space-y-2">
                                                    <CardTitle className="text-xl">{event.title}</CardTitle>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className={getRoleColor(event.creator_role)}>{getRoleLabel(event.creator_role)}</Badge>
                                                        {event.has_certificate && (
                                                            <Badge className="bg-amber-100 text-amber-800">
                                                                <Award className="mr-1 h-3 w-3" />
                                                                Has Certificate
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge className="bg-yellow-100 text-yellow-800">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Pending Review
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <p className="text-gray-600">{event.description}</p>

                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(event.start_date)}</span>
                                                </div>

                                                {event.end_date && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Ends: {formatDate(event.end_date)}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <User className="h-4 w-4" />
                                                    <span>{event.creator.name}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{event.purok ? event.purok.name : 'All Residents'}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 border-t pt-4">
                                                <Button
                                                    onClick={() => handleEventAction(event.id, 'approve')}
                                                    disabled={processing === event.id}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {processing === event.id ? (
                                                        <>
                                                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Approve Event
                                                        </>
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleEventAction(event.id, 'decline')}
                                                    disabled={processing === event.id}
                                                >
                                                    {processing === event.id ? (
                                                        <>
                                                            <Clock className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="mr-2 h-4 w-4" />
                                                            Decline Event
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
