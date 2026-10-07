'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { StoredImage } from '@/components/shared/stored-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { secretaryDeleteEvent } from '@/lib/demo/actions';
import { useCurrentUser, useDb } from '@/lib/demo/store';
import { isEventEnded } from '@/lib/domain/queries';
import { useNow, useUrlFilters } from '@/lib/hooks';
import { route } from '@/lib/routes';
import { secretaryEventsProps, type SecretaryEventRow } from '@/lib/views/secretary';
import { Calendar as CalendarIcon, Clock, Edit, Eye, Grid3x3, List, MapPin, Plus, Search, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EventsCalendar } from './events-calendar';
import { EventsCreateDialog } from './events-create-dialog';

const FILTER_KEYS = ['search', 'purok_id'] as const;

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

export default function SecretaryEventsView() {
    const db = useDb();
    const currentUser = useCurrentUser()!;
    const now = useNow();
    const { filters: query, setFilters } = useUrlFilters(FILTER_KEYS);
    const { events, puroks, filters } = useMemo(() => secretaryEventsProps(db, query), [db, query]);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(new Set<number>());
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedPurok, setSelectedPurok] = useState(filters.purok_id);

    const selectedEvent = selectedEventId === null ? null : (events.find((e) => e.id === selectedEventId) ?? null);

    // The server only lets the creator edit a pending event, and deletes approved events once they have ended.
    const canEdit = (event: SecretaryEventRow) => event.status === 'pending' && event.created_by === currentUser.id;
    const canDelete = (event: SecretaryEventRow) => event.status !== 'approved' || isEventEnded(event, now);

    const handleSearch = (search: string, purokId: string) => {
        setFilters({
            search: search || null,
            purok_id: purokId !== 'all' ? purokId : null,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchTerm, selectedPurok);
    };

    const handlePurokChange = (purokId: string) => {
        setSelectedPurok(purokId);
        handleSearch(searchTerm, purokId);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedPurok('all');
        handleSearch('', 'all');
    };

    const deleteEvent = async (eventId: number) => {
        setProcessing((prev) => new Set(prev).add(eventId));
        try {
            await secretaryDeleteEvent(eventId);
        } finally {
            setProcessing((prev) => {
                const newSet = new Set(prev);
                newSet.delete(eventId);
                return newSet;
            });
            setSelectedEventId(null);
        }
    };

    return (
        <>
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

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <EventsCalendar
                        events={events}
                        currentDate={currentDate}
                        onCurrentDateChange={setCurrentDate}
                        now={now}
                        onSelectEvent={setSelectedEventId}
                    />
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <Card>
                        <CardContent className="p-6">
                            {/* Search and Filter Controls */}
                            <div className="mb-6 space-y-4">
                                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 md:flex-row">
                                    <div className="flex-1">
                                        <Input
                                            type="text"
                                            placeholder="Search by event title, description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={selectedPurok} onValueChange={handlePurokChange}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Filter by Purok" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Puroks</SelectItem>
                                                {puroks.map((purok) => (
                                                    <SelectItem key={purok.id} value={purok.id.toString()}>
                                                        {purok.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="submit" variant="outline">
                                            <Search className="mr-1 h-4 w-4" />
                                            Search
                                        </Button>
                                        {(searchTerm || selectedPurok !== 'all') && (
                                            <Button type="button" variant="outline" onClick={clearFilters}>
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </div>

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
                                <div className="space-y-4 pb-4">
                                    {events.map((event) => {
                                        const isProcessingEvent = processing.has(event.id);

                                        return (
                                            <div key={event.id} className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                            <Badge className={getStatusColor(event.status)}>
                                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                            </Badge>
                                                            {event.has_certificate && <Badge variant="outline">Has Certificate</Badge>}
                                                        </div>

                                                        <p className="line-clamp-2 text-gray-600">{event.description}</p>

                                                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                <span>{formatDate(event.start_date)}</span>
                                                            </div>
                                                            {event.purok_names && (
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span>{event.purok_names}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4" />
                                                                <span>{event.confirmed_attendees_count} attendees</span>
                                                            </div>
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                            Created by: {event.creator?.name ?? 'Unknown'} • {formatDate(event.created_at)}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {canEdit(event) && (
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={route('secretary.events.edit', event.id)}>
                                                                    <Edit className="mr-1 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </Button>
                                                        )}

                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={route('secretary.events.attendees', event.id)}>
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </Button>

                                                        {canDelete(event) && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDeleteEventId(event.id)}
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

            {/* Event Details Dialog */}
            {selectedEvent && (
                <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEventId(null)}>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-4 sm:max-h-[80vh] sm:p-6">
                        <DialogHeader>
                            <DialogTitle>{selectedEvent.title}</DialogTitle>
                            <DialogDescription>Event details and information</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pb-4">
                            {selectedEvent.image_path && (
                                <div className="w-full">
                                    <StoredImage
                                        path={selectedEvent.image_path}
                                        alt={selectedEvent.title}
                                        className="h-48 w-full rounded-lg border object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <Badge className={getStatusColor(selectedEvent.status)}>
                                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                                </Badge>
                                {selectedEvent.has_certificate && <Badge variant="outline">Has Certificate</Badge>}
                            </div>

                            <p className="text-gray-600">{selectedEvent.description}</p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(selectedEvent.start_date)}</span>
                                </div>
                                {selectedEvent.purok_names && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{selectedEvent.purok_names}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span>{selectedEvent.confirmed_attendees_count} attendees</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-4">
                                {canEdit(selectedEvent) && (
                                    <Button asChild size="sm">
                                        <Link href={route('secretary.events.edit', selectedEvent.id)} onClick={() => setSelectedEventId(null)}>
                                            <Edit className="mr-1 h-4 w-4" />
                                            Edit Event
                                        </Link>
                                    </Button>
                                )}

                                <Button asChild variant="outline" size="sm">
                                    <Link href={route('secretary.events.attendees', selectedEvent.id)} onClick={() => setSelectedEventId(null)}>
                                        <Eye className="mr-1 h-4 w-4" />
                                        View Details
                                    </Link>
                                </Button>

                                {canDelete(selectedEvent) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setDeleteEventId(selectedEvent.id);
                                            setSelectedEventId(null);
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-1 h-4 w-4" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Create Event Dialog */}
            <EventsCreateDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} puroks={puroks} now={now} />

            <ConfirmDialog
                open={deleteEventId !== null}
                onOpenChange={(open) => !open && setDeleteEventId(null)}
                title="Delete event?"
                description="Are you sure you want to delete this event? This action cannot be undone."
                confirmLabel="Delete"
                destructive
                onConfirm={async () => {
                    if (deleteEventId !== null) await deleteEvent(deleteEventId);
                }}
            />
        </>
    );
}
