import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Partner/Header';
import Sidebar from '@/pages/Partner/Sidebar';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, Edit, MapPin, Plus, Trash2, Upload, Users, X, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';

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
    confirmed_attendees_count: number;
    purok?: Purok;
    created_at: string;
    image_path?: string;
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);
    const [processing, setProcessing] = useState<Set<number>>(new Set());
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
        purok_id: '',
        has_certificate: false as boolean,
        target_all_residents: false as boolean,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);
        if (data.purok_id) formData.append('purok_id', data.purok_id);
        formData.append('has_certificate', data.has_certificate ? '1' : '0');
        formData.append('target_all_residents', data.target_all_residents ? '1' : '0');
        if (data.image) formData.append('image', data.image);

        router.post(route('partner.events.create'), formData, {
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
        router.get(route('partner.events.edit', eventId));
    };

    const handleDelete = (eventId: number) => {
        setProcessing((prev) => new Set([...prev, eventId]));

        router.delete(route('partner.events.delete', eventId), {
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
                                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Create New Event Request</DialogTitle>
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

                                        {/* Event Image */}
                                        <div>
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
                                                    onChange={(e) => setData('start_date', e.target.value)}
                                                    min={new Date().toISOString().slice(0, 16)}
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
                                                {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
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
                                                            setData('purok_id', '');
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor="target_all_residents" className="text-sm">
                                                    Target all residents
                                                </Label>
                                            </div>

                                            {!data.target_all_residents && (
                                                <div>
                                                    <Label htmlFor="purok_id">Select Purok</Label>
                                                    <Select value={data.purok_id} onValueChange={(value) => setData('purok_id', value)}>
                                                        <SelectTrigger className={errors.purok_id ? 'border-red-500' : ''}>
                                                            <SelectValue placeholder="Select a purok" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {puroks.map((purok) => (
                                                                <SelectItem key={purok.id} value={purok.id.toString()}>
                                                                    {purok.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.purok_id && <p className="mt-1 text-sm text-red-500">{errors.purok_id}</p>}
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
                                                {formProcessing ? 'Creating...' : 'Create Event Request'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="mb-6">
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-6">
                                <Alert className="border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {/* Events Grid */}
                        <div className="grid gap-4 md:gap-6">
                            {events.length > 0 ? (
                                events.map((event) => {
                                    const canEdit = event.status === 'pending';
                                    const isProcessingEvent = processing.has(event.id);

                                    return (
                                        <Card key={event.id} className="shadow-sm">
                                            <CardHeader className="pb-3">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <CardTitle className="text-lg">{event.title}</CardTitle>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className={getStatusColor(event.status)}>
                                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                        </Badge>
                                                        {event.has_certificate && <Badge variant="outline">Certificate</Badge>}
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                {/* Event Image */}
                                                {event.image_path && (
                                                    <div>
                                                        <img
                                                            src={`/storage/${event.image_path}`}
                                                            alt={event.title}
                                                            className="h-32 w-48 rounded-lg border object-cover"
                                                        />
                                                    </div>
                                                )}

                                                <p className="text-gray-600">{event.description}</p>

                                                <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(event.start_date)}
                                                        {event.end_date && ` - ${formatDate(event.end_date)}`}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {event.purok ? event.purok.name : 'All Residents'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {event.confirmed_attendees_count} attendees
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500">Created: {formatDate(event.created_at)}</div>

                                                {/* Action Buttons */}
                                                {canEdit && (
                                                    <div className="flex gap-2 pt-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(event.id)} className="gap-2">
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
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <h3 className="mb-2 text-lg font-medium text-gray-900">No events found</h3>
                                        <p className="mb-4 text-gray-600">Create your first event request to get started.</p>
                                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Event Request
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen !== null} onOpenChange={() => setDeleteConfirmOpen(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-gray-600">Are you sure you want to delete this event request? This action cannot be undone.</p>
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
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
