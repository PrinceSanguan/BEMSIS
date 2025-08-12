import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, MapPin, Plus, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockEvents = [
    {
        id: 1,
        title: 'Community Clean-up Drive',
        date: '2025-08-20',
        location: 'Purok 1',
        description: 'Monthly community cleaning activity',
        status: 'active',
        attendees: ['Juan Dela Cruz', 'Maria Santos', 'Pedro Garcia'],
    },
    {
        id: 2,
        title: 'Basketball Tournament',
        date: '2025-08-25',
        location: 'Court Area',
        description: 'Inter-purok basketball competition',
        status: 'upcoming',
        attendees: ['Ana Lopez', 'Carlos Reyes'],
    },
];

export default function Events() {
    const [events, setEvents] = useState(mockEvents);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        location: '',
        description: '',
    });

    const handleCreateEvent = () => {
        const event = {
            id: events.length + 1,
            ...newEvent,
            status: 'upcoming',
            attendees: [],
        };
        setEvents([...events, event]);
        setNewEvent({ title: '', date: '', location: '', description: '' });
        setIsCreateDialogOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <>
            <Head title="Events Management" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.events" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.events" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Secretary" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Events Management</h2>
                                <p className="text-gray-600">Create and manage community events</p>
                            </div>

                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Event
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Create New Event</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Event Title</Label>
                                            <Input
                                                id="title"
                                                value={newEvent.title}
                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                placeholder="Enter event title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={newEvent.date}
                                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                value={newEvent.location}
                                                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                                placeholder="Event location"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={newEvent.description}
                                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                placeholder="Event description"
                                            />
                                        </div>
                                        <Button onClick={handleCreateEvent} className="w-full">
                                            Create Event
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
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
                                                {event.attendees.length} attendees
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                                                        View Attendees
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Attendees - {event.title}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-2">
                                                        {event.attendees.length > 0 ? (
                                                            event.attendees.map((attendee, index) => (
                                                                <div key={index} className="rounded bg-gray-50 p-2">
                                                                    {attendee}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-gray-500">No attendees yet</p>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Button size="sm" variant="outline">
                                                Edit
                                            </Button>
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
