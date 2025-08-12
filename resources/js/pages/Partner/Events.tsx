import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Partner/Header';
import Sidebar from '@/pages/Partner/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, Edit, MapPin, Plus, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockEvents = [
    {
        id: 1,
        title: 'Health Awareness Campaign',
        date: '2025-08-25',
        location: 'Community Hall',
        description: 'Health education and free check-ups for residents',
        status: 'approved',
        expectedAttendees: 100,
        submittedAt: '2025-08-10',
    },
    {
        id: 2,
        title: 'Youth Leadership Training',
        date: '2025-08-30',
        location: 'Conference Room',
        description: 'Leadership skills development for young adults',
        status: 'pending',
        expectedAttendees: 50,
        submittedAt: '2025-08-12',
    },
    {
        id: 3,
        title: 'Skills Development Workshop',
        date: '2025-09-10',
        location: 'Training Center',
        description: 'Technical skills training for employment',
        status: 'rejected',
        expectedAttendees: 75,
        submittedAt: '2025-08-08',
    },
];

export default function Events() {
    const [events, setEvents] = useState(mockEvents);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        location: '',
        description: '',
        expectedAttendees: '',
    });

    const handleCreateEvent = () => {
        const event = {
            id: events.length + 1,
            ...newEvent,
            expectedAttendees: parseInt(newEvent.expectedAttendees) || 0,
            status: 'pending',
            submittedAt: new Date().toISOString().split('T')[0],
        };
        setEvents([...events, event]);
        setNewEvent({ title: '', date: '', location: '', description: '', expectedAttendees: '' });
        setIsCreateDialogOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <>
            <Head title="Events Management" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="partner.events" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="partner.events" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Partner Agency" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                                <p className="text-gray-600">Create and manage your event requests</p>
                            </div>

                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Event Request
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Submit Event Request</DialogTitle>
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
                                            <Label htmlFor="expectedAttendees">Expected Attendees</Label>
                                            <Input
                                                id="expectedAttendees"
                                                type="number"
                                                value={newEvent.expectedAttendees}
                                                onChange={(e) => setNewEvent({ ...newEvent, expectedAttendees: e.target.value })}
                                                placeholder="Number of expected attendees"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={newEvent.description}
                                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                                placeholder="Event description and objectives"
                                            />
                                        </div>
                                        <Button onClick={handleCreateEvent} className="w-full">
                                            Submit Request
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

                                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
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
                                                {event.expectedAttendees} expected
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-500">Submitted: {event.submittedAt}</div>

                                        {(event.status === 'pending' || event.status === 'rejected') && (
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <Edit className="h-4 w-4" />
                                                    Edit Request
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
