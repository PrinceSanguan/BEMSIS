import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, Eye, MapPin, Plus, QrCode, Users, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
    confirmed_attendees_count: number;
    created_at: string;
}

interface Props {
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

export default function Events({ events, puroks }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [processing, setProcessing] = useState<Set<number>>(new Set());

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
        purok_id: '',
        has_certificate: false as boolean,
        target_all_residents: false as boolean,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Transform the data before submission
        const transformedData = {
            ...data,
            purok_id: data.purok_id === '' ? null : data.purok_id,
            target_all_residents: data.purok_id === '' || !data.purok_id,
        };

        router.post(route('secretary.events.create'), transformedData, {
            onSuccess: () => {
                reset();
                setIsCreateDialogOpen(false);
            },
            onError: (errors) => {
                console.log('Event creation errors:', errors);
            },
        });
    };

    const handleAssignQRCodes = (eventId: number) => {
        setProcessing((prev) => new Set([...prev, eventId]));

        router.post(
            `/secretary/events/${eventId}/assign-qr`,
            {},
            {
                onFinish: () => {
                    setProcessing((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(eventId);
                        return newSet;
                    });
                },
            },
        );
    };

    const handleAssignCertificates = (eventId: number) => {
        setProcessing((prev) => new Set([...prev, eventId]));

        router.post(
            `/secretary/events/${eventId}/assign-certificates`,
            {},
            {
                onFinish: () => {
                    setProcessing((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(eventId);
                        return newSet;
                    });
                },
            },
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isEventPast = (startDate: string) => {
        return new Date(startDate) < new Date();
    };

    return (
        <>
            <Head title="Event Management - Secretary" />
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

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
                                    <p className="mt-2 text-gray-600">Create and manage community events</p>
                                </div>

                                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Event
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Create New Event</DialogTitle>
                                            <DialogDescription>
                                                Fill in the details below to create a new community event that will be submitted for captain approval.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Event Title</Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    placeholder="Enter event title"
                                                    required
                                                />
                                                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Enter event description"
                                                    rows={3}
                                                    required
                                                />
                                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="start_date">Start Date & Time</Label>
                                                    <Input
                                                        id="start_date"
                                                        type="datetime-local"
                                                        value={data.start_date}
                                                        onChange={(e) => setData('start_date', e.target.value)}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                        required
                                                    />
                                                    {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="end_date">End Date & Time (Optional)</Label>
                                                    <Input
                                                        id="end_date"
                                                        type="datetime-local"
                                                        value={data.end_date}
                                                        onChange={(e) => setData('end_date', e.target.value)}
                                                        min={data.start_date}
                                                    />
                                                    {errors.end_date && <p className="text-sm text-red-600">{errors.end_date}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="purok_id">Target Purok</Label>
                                                <Select
                                                    value={data.purok_id}
                                                    onValueChange={(value) => setData('purok_id', value)}
                                                    disabled={puroks.length === 0}
                                                >
                                                    <SelectTrigger className={puroks.length === 0 ? 'cursor-not-allowed opacity-50' : ''}>
                                                        <SelectValue
                                                            placeholder={
                                                                puroks.length === 0
                                                                    ? 'No puroks available - All residents will be targeted'
                                                                    : 'Select a specific purok or leave blank for all residents'
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {puroks.map((purok) => (
                                                            <SelectItem key={purok.id} value={purok.id.toString()}>
                                                                {purok.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.purok_id && <p className="text-sm text-red-600">{errors.purok_id}</p>}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="has_certificate"
                                                    checked={data.has_certificate}
                                                    onCheckedChange={(checked) => setData('has_certificate', checked as boolean)}
                                                />
                                                <Label htmlFor="has_certificate" className="text-sm font-medium">
                                                    This event will have certificates
                                                </Label>
                                            </div>

                                            <Alert className="border-blue-200 bg-blue-50">
                                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-blue-800">
                                                    This event will be submitted for captain approval before being published.
                                                </AlertDescription>
                                            </Alert>

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

                            {/* Statistics */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Events</p>
                                                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                                            </div>
                                            <Calendar className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {events.filter((e) => e.status === 'approved').length}
                                                </p>
                                            </div>
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {events.filter((e) => e.status === 'pending').length}
                                                </p>
                                            </div>
                                            <Clock className="h-8 w-8 text-yellow-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {events.reduce((sum, event) => sum + event.confirmed_attendees_count, 0)}
                                                </p>
                                            </div>
                                            <Users className="h-8 w-8 text-purple-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Events List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Events
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {events.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
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
                                                                    {event.has_certificate && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="border-purple-200 bg-purple-50 text-purple-700"
                                                                        >
                                                                            <Award className="mr-1 h-3 w-3" />
                                                                            Certificate
                                                                        </Badge>
                                                                    )}
                                                                    {isPast && (
                                                                        <Badge variant="outline" className="bg-gray-50 text-gray-600">
                                                                            Past Event
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <p className="text-sm text-gray-600">{event.description}</p>

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

                                                            {event.status === 'approved' && (
                                                                <div className="flex flex-col gap-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => router.get(route('secretary.events.attendees', event.id))}
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Attendees
                                                                    </Button>

                                                                    {!isPast && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleAssignQRCodes(event.id)}
                                                                            disabled={isProcessingEvent}
                                                                        >
                                                                            <QrCode className="mr-2 h-4 w-4" />
                                                                            {isProcessingEvent ? 'Processing...' : 'Assign QR Codes'}
                                                                        </Button>
                                                                    )}

                                                                    {event.has_certificate && isPast && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleAssignCertificates(event.id)}
                                                                            disabled={isProcessingEvent}
                                                                        >
                                                                            <Award className="mr-2 h-4 w-4" />
                                                                            {isProcessingEvent ? 'Processing...' : 'Assign Certificates'}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
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
