import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Captain/Header';
import Sidebar from '@/pages/Captain/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data - replace with actual data from backend
const mockEvents = [
    {
        id: 1,
        title: 'Community Clean-up Drive',
        date: '2025-08-20',
        location: 'Purok 1',
        attendees: 25,
        status: 'pending',
        description: 'Monthly community cleaning activity',
    },
    {
        id: 2,
        title: 'Basketball Tournament',
        date: '2025-08-25',
        location: 'Court Area',
        attendees: 50,
        status: 'pending',
        description: 'Inter-purok basketball competition',
    },
    {
        id: 3,
        title: 'Health Seminar',
        date: '2025-08-30',
        location: 'Community Hall',
        attendees: 35,
        status: 'pending',
        description: 'Health awareness program for residents',
    },
];

type EventStatus = 'pending' | 'approved' | 'disapproved';

export default function Dashboard() {
    const [events, setEvents] = useState(mockEvents);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleEventAction = (eventId: number, action: 'approved' | 'disapproved') => {
        setEvents(events.map((event) => (event.id === eventId ? { ...event, status: action as EventStatus } : event)));
    };

    const getStatusColor = (status: EventStatus) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'disapproved':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <>
            <Head title="Dashboard" />
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
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Event Requests</h2>
                            <p className="text-gray-600">Review and manage community event applications</p>
                        </div>

                        <div className="grid gap-4 md:gap-6">
                            {events.map((event) => (
                                <Card key={event.id} className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <CardTitle className="text-lg">{event.title}</CardTitle>
                                            <Badge className={getStatusColor(event.status)}>
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <p className="text-gray-600">{event.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {event.date}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {event.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {event.attendees} attendees
                                            </div>
                                        </div>

                                        {event.status === 'pending' && (
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEventAction(event.id, 'approved')}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleEventAction(event.id, 'disapproved')}>
                                                    Disapprove
                                                </Button>
                                            </div>
                                        )}
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
