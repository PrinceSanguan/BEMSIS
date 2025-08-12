import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head, router } from '@inertiajs/react';
import { Award, Calendar, CalendarDays, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    creator: { name: string };
    purok?: { name: string };
    user_registered: boolean;
    registration_status?: string;
    current_attendees: number;
    has_certificate: boolean;
}

interface Props {
    events: Event[];
}

export default function Events({ events }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [processing, setProcessing] = useState<number | null>(null);

    const handleRegister = (eventId: number) => {
        setProcessing(eventId);
        router.post(
            route('resident.events.register', eventId),
            {},
            {
                onSuccess: () => {
                    setProcessing(null);
                },
                onError: () => {
                    setProcessing(null);
                },
            },
        );
    };

    const handleUnregister = (eventId: number) => {
        setProcessing(eventId);
        router.delete(route('resident.events.unregister', eventId), {
            onSuccess: () => {
                setProcessing(null);
            },
            onError: () => {
                setProcessing(null);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'almost_full':
                return 'bg-yellow-100 text-yellow-800';
            case 'full':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'almost_full':
                return 'Almost Full';
            case 'full':
                return 'Full';
            default:
                return 'Open';
        }
    };

    return (
        <>
            <Head title="Community Events" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="resident.events" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="resident.events" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Juan Dela Cruz" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Community Events</h2>
                            <p className="text-gray-600">Browse and register for upcoming events</p>
                        </div>

                        {/* Event Calendar View */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Event Calendar
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="p-2 font-semibold">
                                            {day}
                                        </div>
                                    ))}
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <div
                                            key={i}
                                            className={`rounded border p-2 ${i === 19 || i === 24 || i === 29 ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                                        >
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Browse Events */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Browse Events</h3>

                            {events.map((event) => (
                                <Card key={event.id} className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <CardTitle className="text-lg">{event.title}</CardTitle>
                                            <div className="flex gap-2">
                                                <Badge className={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
                                                {event.userRegistered && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        Registered
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600">{event.description}</p>

                                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(event.start_date)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {formatTime(event.start_date)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {event.purok?.name || 'All Puroks'}
                                            </div>
                                        </div>

                                        {event.has_certificate && (
                                            <div className="flex items-center gap-1 text-sm text-green-600">
                                                <Award className="h-4 w-4" />
                                                Certificate Available
                                            </div>
                                        )}

                                        <div className="flex gap-2 pt-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                                                        View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>{event.title}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <p>{event.description}</p>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="font-medium">Date & Time</p>
                                                                <p>{event.date}</p>
                                                                <p>{event.time}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Location</p>
                                                                <p>{event.location}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Organizer</p>
                                                                <p>{event.organizer}</p>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Attendees</p>
                                                                <p>
                                                                    {event.currentAttendees}/{event.maxAttendees}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            {event.user_registered ? (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleUnregister(event.id)}
                                                    disabled={processing === event.id}
                                                >
                                                    {processing === event.id ? 'Processing...' : 'Unregister'}
                                                </Button>
                                            ) : (
                                                <Button size="sm" onClick={() => handleRegister(event.id)} disabled={processing === event.id}>
                                                    {processing === event.id ? 'Registering...' : 'Register'}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
