import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { Award, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Grid3x3, List, MapPin, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    creator: { name: string };
    purok?: { name: string };
    purok_names?: string;
    user_registered: boolean;
    registration_status?: string;
    current_attendees: number;
    has_certificate: boolean;
}

interface Props {
    events: Event[];
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Events({ events }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [processing, setProcessing] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calendar logic
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    const daysInMonth = lastDayOfMonth.getDate();
    const daysFromPrevMonth = firstDayOfWeek;
    const totalCalendarCells = Math.ceil((daysInMonth + daysFromPrevMonth) / 7) * 7;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Group events by date
    const eventsByDate = useMemo(() => {
        const grouped: { [key: string]: Event[] } = {};
        events.forEach((event) => {
            const eventDate = new Date(event.start_date);
            const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(event);
        });
        return grouped;
    }, [events]);

    const getEventsForDate = (date: Date) => {
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        return eventsByDate[dateKey] || [];
    };

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

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
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

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderCalendarCells = () => {
        const cells = [];
        const prevMonth = new Date(currentYear, currentMonth - 1, 0);

        // Previous month days
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i);
            const dayEvents = getEventsForDate(date);

            cells.push(
                <div key={`prev-${i}`} className="min-h-12 border border-gray-200 bg-gray-50 p-1 opacity-40 sm:min-h-16 sm:p-2 lg:min-h-24">
                    <div className="text-sm text-gray-500">{date.getDate()}</div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div
                                    key={event.id}
                                    className="cursor-pointer truncate rounded bg-gray-200 px-1 py-0.5 text-xs text-gray-600"
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
                        </div>
                    )}
                </div>,
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayEvents = getEventsForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();

            cells.push(
                <div
                    key={day}
                    className={`min-h-12 border border-gray-200 bg-white p-1 sm:min-h-16 sm:p-2 lg:min-h-24 ${isToday ? 'border-blue-300 bg-blue-50' : ''}`}
                >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{day}</div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div
                                    key={event.id}
                                    className={`cursor-pointer truncate rounded px-1 py-0.5 text-xs font-medium ${
                                        event.user_registered ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                    }`}
                                    onClick={() => setSelectedEvent(event)}
                                    title={event.title}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">+{dayEvents.length - 2} more</div>
                            )}
                        </div>
                    )}
                </div>,
            );
        }

        // Next month days
        const remainingCells = totalCalendarCells - daysInMonth - daysFromPrevMonth;
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(currentYear, currentMonth + 1, day);
            const dayEvents = getEventsForDate(date);

            cells.push(
                <div key={`next-${day}`} className="min-h-12 border border-gray-200 bg-gray-50 p-1 opacity-40 sm:min-h-16 sm:p-2 lg:min-h-24">
                    <div className="text-sm text-gray-500">{day}</div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div
                                    key={event.id}
                                    className="cursor-pointer truncate rounded bg-gray-200 px-1 py-0.5 text-xs text-gray-600"
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
                        </div>
                    )}
                </div>,
            );
        }

        return cells;
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
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Header Section */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Community Events</h1>
                                    <p className="mt-2 text-gray-600">Discover and register for upcoming community events</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* View Toggle */}
                                    <div className="flex items-center rounded-lg border bg-white p-1">
                                        <Button
                                            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('calendar')}
                                            className="h-8 px-3"
                                        >
                                            <Grid3x3 className="mr-1 h-4 w-4" />
                                            Calendar
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                            className="h-8 px-3"
                                        >
                                            <List className="mr-1 h-4 w-4" />
                                            List
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Flash Messages */}
                            {flash?.success && (
                                <Alert className="border-green-200 bg-green-50">
                                    <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                                </Alert>
                            )}

                            {flash?.error && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Calendar View */}
                            {viewMode === 'calendar' && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl">
                                                    {monthNames[currentMonth]} {currentYear}
                                                </CardTitle>
                                                <CardDescription>View events in calendar format</CardDescription>
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                                                <Button variant="outline" size="sm" onClick={goToToday} className="w-full sm:w-auto">
                                                    Today
                                                </Button>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigateMonth('prev')}
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                        <span className="ml-1 sm:hidden">Prev</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigateMonth('next')}
                                                        className="flex-1 sm:flex-none"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                        <span className="ml-1 sm:hidden">Next</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        {/* Calendar Header */}
                                        <div>
                                            <div className="mb-2 grid grid-cols-7 gap-px">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                    <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-600">
                                                        <span className="hidden sm:inline">{day}</span>
                                                        <span className="sm:hidden">{day.slice(0, 1)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Calendar Grid */}
                                        <div>
                                            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-200">
                                                {renderCalendarCells()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* List View */}
                            {viewMode === 'list' && (
                                <Card>
                                    <CardContent className="p-6">
                                        {events.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <h3 className="mb-2 text-lg font-medium text-gray-900">No events available</h3>
                                                <p className="text-gray-600">There are no upcoming events at this time.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {events.map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex flex-wrap items-center gap-3">
                                                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                                    {event.user_registered && (
                                                                        <Badge className="bg-blue-100 text-blue-800">Registered</Badge>
                                                                    )}
                                                                    {event.has_certificate && <Badge variant="outline">Certificate Available</Badge>}
                                                                </div>

                                                                <p className="line-clamp-2 text-gray-600">{event.description}</p>

                                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4" />
                                                                        <span>{formatDateTime(event.start_date)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="h-4 w-4" />
                                                                        <span>{event.purok_names || 'All Residents'}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4" />
                                                                        <span>{event.current_attendees} attendees</span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-xs text-gray-500">Organized by: {event.creator.name}</div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex flex-wrap gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                                                                    View Details
                                                                </Button>

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
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleRegister(event.id)}
                                                                        disabled={processing === event.id}
                                                                    >
                                                                        {processing === event.id ? 'Registering...' : 'Register'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Event Details Dialog */}
            {selectedEvent && (
                <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selectedEvent.title}</DialogTitle>
                            <DialogDescription>Event details and information</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {selectedEvent.user_registered && <Badge className="bg-blue-100 text-blue-800">Registered</Badge>}
                                {selectedEvent.has_certificate && (
                                    <Badge variant="outline" className="text-amber-600">
                                        <Award className="mr-1 h-3 w-3" />
                                        Certificate Available
                                    </Badge>
                                )}
                            </div>

                            <p className="text-gray-600">{selectedEvent.description}</p>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="font-medium text-gray-900">Date & Time</p>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(selectedEvent.start_date)} at {formatTime(selectedEvent.start_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Location</p>
                                    <p className="text-sm text-gray-600">{selectedEvent.purok_names || 'All Residents'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Organizer</p>
                                    <p className="text-sm text-gray-600">{selectedEvent.creator.name}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Attendees</p>
                                    <p className="text-sm text-gray-600">{selectedEvent.current_attendees} registered</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4">
                                {selectedEvent.user_registered ? (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            handleUnregister(selectedEvent.id);
                                            setSelectedEvent(null);
                                        }}
                                        disabled={processing === selectedEvent.id}
                                    >
                                        {processing === selectedEvent.id ? 'Processing...' : 'Unregister from Event'}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            handleRegister(selectedEvent.id);
                                            setSelectedEvent(null);
                                        }}
                                        disabled={processing === selectedEvent.id}
                                    >
                                        {processing === selectedEvent.id ? 'Registering...' : 'Register for Event'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
