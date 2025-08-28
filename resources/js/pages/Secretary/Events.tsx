import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, Edit, Eye, MapPin, Plus, QrCode, Trash2, Upload, Users, X, XCircle } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

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
    image_path?: string;
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);
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
                window.location.reload();
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

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleEdit = (eventId: number) => {
        router.get(route('secretary.events.edit', eventId));
    };

    const handleDelete = (eventId: number) => {
        setProcessing((prev) => new Set([...prev, eventId]));

        router.delete(route('secretary.events.delete', eventId), {
            onFinish: () => {
                setProcessing((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(eventId);
                    return newSet;
                });
                setDeleteConfirmOpen(null);
            },
        });
    };

    const assignQrCodes = (eventId: number) => {
        setProcessing((prev) => new Set([...prev, eventId]));

        router.post(
            route('secretary.events.assign-qr', eventId),
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

    const assignCertificates = (eventId: number) => {
        setProcessing((prev) => new Set([...prev, eventId]));

        router.post(
            route('secretary.events.assign-certificates', eventId),
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
                                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Create New Event</DialogTitle>
                                            <DialogDescription>
                                                Fill in the details below to create a new community event that will be submitted for captain approval.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* Event Title */}
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Event Title *</Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    placeholder="Enter event title"
                                                    className={errors.title ? 'border-red-500' : ''}
                                                />
                                                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                            </div>

                                            {/* Event Description */}
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description *</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Enter event description"
                                                    rows={4}
                                                    className={errors.description ? 'border-red-500' : ''}
                                                />
                                                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                            </div>

                                            {/* Event Image */}
                                            <div className="space-y-2">
                                                <Label htmlFor="image">Event Image</Label>
                                                <div className="space-y-4">
                                                    {imagePreview && (
                                                        <div className="relative inline-block">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Event preview"
                                                                className="h-32 w-48 rounded-lg border object-cover"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                                onClick={removeImage}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="gap-2"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                            {imagePreview ? 'Change Image' : 'Upload Image'}
                                                        </Button>
                                                        <Input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="hidden"
                                                        />
                                                        <span className="text-sm text-gray-500">JPG, PNG, GIF up to 2MB</span>
                                                    </div>
                                                </div>
                                                {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                                            </div>

                                            {/* Date Range */}
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="start_date">Start Date *</Label>
                                                    <Input
                                                        id="start_date"
                                                        type="datetime-local"
                                                        value={data.start_date}
                                                        onChange={(e) => setData('start_date', e.target.value)}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                        className={errors.start_date ? 'border-red-500' : ''}
                                                    />
                                                    {errors.start_date && <p className="text-sm text-red-600">{errors.start_date}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="end_date">End Date (Optional)</Label>
                                                    <Input
                                                        id="end_date"
                                                        type="datetime-local"
                                                        value={data.end_date}
                                                        onChange={(e) => setData('end_date', e.target.value)}
                                                        min={
                                                            data.start_date
                                                                ? new Date(new Date(data.start_date).getTime() + 24 * 60 * 60 * 1000)
                                                                      .toISOString()
                                                                      .slice(0, 16)
                                                                : undefined
                                                        }
                                                        className={errors.end_date ? 'border-red-500' : ''}
                                                    />
                                                    {errors.end_date && <p className="text-sm text-red-600">{errors.end_date}</p>}
                                                </div>
                                            </div>

                                            {/* Target Audience */}
                                            <div className="space-y-3">
                                                <Label>Target Audience</Label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="target_all_residents"
                                                        checked={data.target_all_residents}
                                                        onCheckedChange={(checked) => {
                                                            setData('target_all_residents', checked as boolean);
                                                            if (checked) {
                                                                setData('purok_ids', []);
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor="target_all_residents" className="text-sm">
                                                        Target all residents
                                                    </Label>
                                                </div>

                                                {!data.target_all_residents && (
                                                    <div className="space-y-2">
                                                        <Label>Select Puroks (up to 3)</Label>
                                                        <div className="grid grid-cols-2 gap-2">
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
                                                        {data.purok_ids.length >= 3 && (
                                                            <p className="mt-1 text-sm text-amber-600">Maximum of 3 puroks can be selected</p>
                                                        )}
                                                        {errors.purok_ids && <p className="text-sm text-red-600">{errors.purok_ids}</p>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Certificate Option */}
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="has_certificate"
                                                    checked={data.has_certificate}
                                                    onCheckedChange={(checked) => setData('has_certificate', checked as boolean)}
                                                />
                                                <Label htmlFor="has_certificate" className="text-sm">
                                                    This event will have certificates
                                                </Label>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsCreateDialogOpen(false);
                                                        reset();
                                                        setImagePreview(null);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = '';
                                                        }
                                                    }}
                                                >
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
                                                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {events.filter((e) => e.status === 'pending').length}
                                                </p>
                                            </div>
                                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Approved Events</p>
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
                                    <CardTitle>All Events</CardTitle>
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
                                                                    {event.has_certificate && (
                                                                        <Badge variant="outline" className="border-purple-200 text-purple-800">
                                                                            <Award className="mr-1 h-3 w-3" />
                                                                            Certificate
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                {/* Event Image */}
                                                                {event.image_path && (
                                                                    <div className="mb-3">
                                                                        <img
                                                                            src={`/storage/${event.image_path}`}
                                                                            alt={event.title}
                                                                            className="h-32 w-48 rounded-lg border object-cover"
                                                                        />
                                                                    </div>
                                                                )}

                                                                <p className="text-gray-600">{event.description}</p>

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
                                                            <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
                                                                {/* Edit/Delete Buttons (only for non-approved events) */}
                                                                {canEdit && (
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => handleEdit(event.id)}
                                                                            className="gap-2"
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => setDeleteConfirmOpen(event.id)}
                                                                            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            Delete
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                {/* Event Management Buttons (only for approved events) */}
                                                                {event.status === 'approved' && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => viewAttendees(event.id)}
                                                                            className="gap-2"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                            View Attendees
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => assignQrCodes(event.id)}
                                                                            disabled={isProcessingEvent}
                                                                            className="gap-2"
                                                                        >
                                                                            <QrCode className="h-4 w-4" />
                                                                            {isProcessingEvent ? 'Processing...' : 'Assign QR Codes'}
                                                                        </Button>
                                                                        {event.has_certificate && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => assignCertificates(event.id)}
                                                                                disabled={isProcessingEvent}
                                                                                className="gap-2"
                                                                            >
                                                                                <Award className="h-4 w-4" />
                                                                                {isProcessingEvent ? 'Processing...' : 'Assign Certificates'}
                                                                            </Button>
                                                                        )}
                                                                    </div>
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
                        </div>
                    </main>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen !== null} onOpenChange={() => setDeleteConfirmOpen(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this event? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteConfirmOpen && handleDelete(deleteConfirmOpen)}
                            disabled={deleteConfirmOpen ? processing.has(deleteConfirmOpen) : false}
                        >
                            {deleteConfirmOpen && processing.has(deleteConfirmOpen) ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
