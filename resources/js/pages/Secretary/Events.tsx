import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    Grid3x3,
    List,
    MapPin,
    Plus,
    Trash2,
    Upload,
    Users,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

interface Creator {
    id: number;
    name: string;
    role: string;
}

interface Purok {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    status: 'pending' | 'approved' | 'declined';
    has_certificate: boolean;
    target_all_residents: boolean;
    purok_ids?: number[];
    image_path?: string;
    creator: Creator;
    purok?: Purok;
    created_at: string;
    confirmed_attendees_count: number;
}

interface EventsProps {
    events: Event[];
    puroks: Purok[];
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Events({ events, puroks }: EventsProps) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(new Set<number>());
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Add form state for create dialog
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        post,
        processing: formProcessing,
        errors,
        reset,
    } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        purok_ids: [] as number[],
        has_certificate: false as boolean,
        target_all_residents: false as boolean,
        image: null as File | null,
    });

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

    const renderCalendarCells = () => {
        const cells = [];
        const prevMonth = new Date(currentYear, currentMonth - 1, 0);

        // Previous month days
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i);
            const dayEvents = getEventsForDate(date);

            cells.push(
                <div key={`prev-${i}`} className="min-h-16 border border-gray-200 bg-gray-50 p-1 opacity-40 sm:min-h-20 sm:p-2 lg:min-h-24">
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
                    className={`min-h-16 border border-gray-200 bg-white p-1 sm:min-h-20 sm:p-2 lg:min-h-24 ${isToday ? 'border-blue-300 bg-blue-50' : ''}`}
                >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                        {isToday && <span className="ml-1 text-xs">(Today)</span>}
                    </div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                                <div
                                    key={event.id}
                                    className={`cursor-pointer truncate rounded px-1 py-0.5 text-xs font-medium ${
                                        event.status === 'approved'
                                            ? 'bg-green-100 text-green-700'
                                            : event.status === 'declined'
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-yellow-100 text-yellow-700'
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
                <div key={`next-${day}`} className="min-h-16 border border-gray-200 bg-gray-50 p-1 opacity-40 sm:min-h-20 sm:p-2 lg:min-h-24">
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

    const deleteEvent = (eventId: number) => {
        if (confirm('Are you sure you want to delete this event?')) {
            setProcessing((prev) => new Set(prev).add(eventId));

            router.delete(route('secretary.events.destroy', eventId), {
                onFinish: () => {
                    setProcessing((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(eventId);
                        return newSet;
                    });
                    setSelectedEvent(null);
                },
            });
        }
    };

    const viewAttendees = (eventId: number) => {
        router.get(route('secretary.events.attendees', eventId));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isEventPast = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);
        if (data.purok_ids.length > 0) {
            data.purok_ids.forEach((id, index) => {
                formData.append(`purok_ids[${index}]`, id.toString());
            });
        }
        formData.append('has_certificate', data.has_certificate ? '1' : '0');
        formData.append('target_all_residents', data.target_all_residents ? '1' : '0');
        if (data.image) formData.append('image', data.image);

        router.post(route('secretary.events.create'), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setIsCreateDialogOpen(false);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const timer = setTimeout(() => {
                // Flash messages will be cleared by Inertia on next request
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    return (
        <>
            <Head title="Event Management" />
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
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Header Section */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                                    <p className="mt-2 text-gray-600">Manage and organize community events</p>
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

                                    <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Event
                                    </Button>
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
                                        <div className="overflow-x-auto">
                                            <div className="mb-2 grid min-w-[640px] grid-cols-7 gap-px lg:min-w-0">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                    <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-600">
                                                        <span className="hidden sm:inline">{day}</span>
                                                        <span className="sm:hidden">{day.slice(0, 1)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="overflow-x-auto">
                                            <div className="grid min-w-[640px] grid-cols-7 gap-px overflow-hidden rounded-lg border border-gray-200 lg:min-w-0">
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
                                                <h3 className="mb-2 text-lg font-medium text-gray-900">No events found</h3>
                                                <p className="mb-4 text-gray-600">Create your first event to get started.</p>
                                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create Event
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {events.map((event) => {
                                                    const isProcessingEvent = processing.has(event.id);
                                                    const isPast = isEventPast(event.start_date);
                                                    const canEdit = event.status === 'pending';

                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                                                        >
                                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                                <div className="flex-1 space-y-3">
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                                        <Badge className={getStatusColor(event.status)}>
                                                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                                        </Badge>
                                                                        {event.has_certificate && <Badge variant="outline">Has Certificate</Badge>}
                                                                        {isPast && <Badge variant="secondary">Past Event</Badge>}
                                                                    </div>

                                                                    <p className="line-clamp-2 text-gray-600">{event.description}</p>

                                                                    <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>{formatDate(event.start_date)}</span>
                                                                        </div>
                                                                        {event.purok && (
                                                                            <div className="flex items-center gap-2">
                                                                                <MapPin className="h-4 w-4" />
                                                                                <span>{event.purok.name}</span>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-2">
                                                                            <Users className="h-4 w-4" />
                                                                            <span>{event.confirmed_attendees_count} attendees</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-xs text-gray-500">
                                                                        Created by: {event.creator.name} • {formatDate(event.created_at)}
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex flex-wrap gap-2">
                                                                    {canEdit && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => router.get(route('secretary.events.edit', event.id))}
                                                                            disabled={isProcessingEvent}
                                                                        >
                                                                            <Edit className="mr-1 h-4 w-4" />
                                                                            Edit
                                                                        </Button>
                                                                    )}

                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => viewAttendees(event.id)}
                                                                        disabled={isProcessingEvent}
                                                                    >
                                                                        <Eye className="mr-1 h-4 w-4" />
                                                                        View Details
                                                                    </Button>

                                                                    {canEdit && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => deleteEvent(event.id)}
                                                                            disabled={isProcessingEvent}
                                                                            className="text-red-600 hover:text-red-700"
                                                                        >
                                                                            <Trash2 className="mr-1 h-4 w-4" />
                                                                            Delete
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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
                                <Badge className={getStatusColor(selectedEvent.status)}>
                                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                                </Badge>
                                {selectedEvent.has_certificate && <Badge variant="outline">Has Certificate</Badge>}
                                {isEventPast(selectedEvent.start_date) && <Badge variant="secondary">Past Event</Badge>}
                            </div>

                            <p className="text-gray-600">{selectedEvent.description}</p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(selectedEvent.start_date)}</span>
                                </div>
                                {selectedEvent.purok && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{selectedEvent.purok.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span>{selectedEvent.confirmed_attendees_count} attendees</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4">
                                {selectedEvent.status === 'pending' && (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            router.get(route('secretary.events.edit', selectedEvent.id));
                                            setSelectedEvent(null);
                                        }}
                                    >
                                        <Edit className="mr-1 h-4 w-4" />
                                        Edit Event
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        viewAttendees(selectedEvent.id);
                                        setSelectedEvent(null);
                                    }}
                                >
                                    <Eye className="mr-1 h-4 w-4" />
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Create Event Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to create a new community event that will be submitted for captain approval.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Event Title */}
                        <div>
                            <Label htmlFor="title">Event Title *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Enter event title"
                                className={errors.title ? 'border-red-500' : ''}
                            />
                            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                        </div>

                        {/* Event Description */}
                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Enter event description"
                                rows={4}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <Label>Event Image (Optional)</Label>
                            <div className="mt-2 space-y-3">
                                {imagePreview && (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Preview" className="h-32 w-full rounded-lg border object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setData('image', null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-fit">
                                        <Upload className="mr-2 h-4 w-4" />
                                        {imagePreview ? 'Change Image' : 'Upload Image'}
                                    </Button>
                                    <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    <span className="text-sm text-gray-500">JPG, PNG, GIF up to 2MB</span>
                                </div>
                            </div>
                            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="start_date">Start Date *</Label>
                                <Input
                                    id="start_date"
                                    type="datetime-local"
                                    value={data.start_date}
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) => {
                                        setData('start_date', e.target.value);
                                        // Reset end date if it's before the new start date
                                        if (data.end_date && e.target.value >= data.end_date) {
                                            setData('end_date', '');
                                        }
                                    }}
                                    className={errors.start_date ? 'border-red-500' : ''}
                                />
                                {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>}
                            </div>

                            <div>
                                <Label htmlFor="end_date">End Date (Optional)</Label>
                                <Input
                                    id="end_date"
                                    type="datetime-local"
                                    value={data.end_date}
                                    min={data.start_date || new Date().toISOString().slice(0, 16)}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className={errors.end_date ? 'border-red-500' : ''}
                                    disabled={!data.start_date}
                                />
                                {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
                                {!data.start_date && <p className="mt-1 text-sm text-gray-500">Please select a start date first</p>}
                            </div>
                        </div>

                        {/* Target All Residents Checkbox */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="target_all_residents"
                                checked={data.target_all_residents}
                                onCheckedChange={(checked) => setData('target_all_residents', !!checked)}
                            />
                            <Label htmlFor="target_all_residents" className="text-sm font-medium">
                                Target all residents (ignore purok selection)
                            </Label>
                        </div>

                        {/* Purok Selection */}
                        {!data.target_all_residents && (
                            <div>
                                <Label>Select Puroks (up to 3)</Label>
                                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {puroks.map((purok) => (
                                        <div key={purok.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`purok_${purok.id}`}
                                                checked={data.purok_ids.includes(purok.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        if (data.purok_ids.length < 3) {
                                                            setData('purok_ids', [...data.purok_ids, purok.id]);
                                                        }
                                                    } else {
                                                        setData(
                                                            'purok_ids',
                                                            data.purok_ids.filter((id) => id !== purok.id),
                                                        );
                                                    }
                                                }}
                                                disabled={!data.purok_ids.includes(purok.id) && data.purok_ids.length >= 3}
                                            />
                                            <Label htmlFor={`purok_${purok.id}`} className="text-sm">
                                                {purok.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {data.purok_ids.length === 0 && !data.target_all_residents && (
                                    <p className="mt-1 text-sm text-amber-600">Please select at least one purok or check "Target all residents"</p>
                                )}
                                {errors.purok_ids && <p className="mt-1 text-sm text-red-500">{errors.purok_ids}</p>}
                            </div>
                        )}

                        {/* Certificate Option */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="has_certificate"
                                checked={data.has_certificate}
                                onCheckedChange={(checked) => setData('has_certificate', !!checked)}
                            />
                            <Label htmlFor="has_certificate" className="text-sm font-medium">
                                This event will provide certificates
                            </Label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={formProcessing}>
                                {formProcessing ? 'Creating...' : 'Create Event'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
