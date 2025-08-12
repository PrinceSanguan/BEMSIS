import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockEvents = [
    {
        id: 1,
        title: 'Community Clean-up Drive',
        date: '2025-08-20',
        time: '8:00 AM - 12:00 PM',
        location: 'Purok 1',
        description: 'Join us in keeping our community clean and green. Bring your own gloves and cleaning materials.',
        organizer: 'Barangay Council',
        maxAttendees: 50,
        currentAttendees: 35,
        status: 'open',
        userRegistered: false,
    },
    {
        id: 2,
        title: 'Health Seminar',
        date: '2025-08-25',
        time: '2:00 PM - 5:00 PM',
        location: 'Community Hall',
        description: 'Learn about health and wellness practices for better living.',
        organizer: 'Philippine Red Cross',
        maxAttendees: 100,
        currentAttendees: 67,
        status: 'open',
        userRegistered: true,
    },
    {
        id: 3,
        title: 'Basketball Tournament',
        date: '2025-08-30',
        time: '6:00 AM - 6:00 PM',
        location: 'Basketball Court',
        description: 'Inter-purok basketball competition. Register your team now!',
        organizer: 'Sports Committee',
        maxAttendees: 200,
        currentAttendees: 180,
        status: 'almost_full',
        userRegistered: false,
    },
];

export default function Events() {
    const [events, setEvents] = useState(mockEvents);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const handleRegister = (eventId: number) => {
        setEvents(
            events.map((event) => (event.id === eventId ? { ...event, userRegistered: true, currentAttendees: event.currentAttendees + 1 } : event)),
        );
        alert('Successfully registered for the event!');
    };

    const handleUnregister = (eventId: number) => {
        setEvents(
            events.map((event) => (event.id === eventId ? { ...event, userRegistered: false, currentAttendees: event.currentAttendees - 1 } : event)),
        );
        alert('Successfully unregistered from the event!');
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

                                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {event.date}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {event.time}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {event.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {event.currentAttendees}/{event.maxAttendees}
                                            </div>
                                        </div>

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

                                            {event.userRegistered ? (
                                                <Button size="sm" variant="destructive" onClick={() => handleUnregister(event.id)}>
                                                    Unregister
                                                </Button>
                                            ) : event.status !== 'full' ? (
                                                <Button size="sm" onClick={() => handleRegister(event.id)}>
                                                    Register
                                                </Button>
                                            ) : (
                                                <Button size="sm" disabled>
                                                    Event Full
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
