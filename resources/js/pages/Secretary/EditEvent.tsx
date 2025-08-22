import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Upload, X } from 'lucide-react';
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
    target_all_residents: boolean;
    purok?: Purok;
    image_path?: string;
}

interface EditEventProps {
    event: Event;
    puroks: Purok[];
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function EditEvent({ event, puroks }: EditEventProps) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(event.image_path ? `/storage/${event.image_path}` : null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, processing, errors, reset } = useForm({
        title: event.title,
        description: event.description,
        start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
        purok_id: event.purok?.id?.toString() || '',
        has_certificate: event.has_certificate,
        target_all_residents: event.target_all_residents,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Form submission started', {
            eventId: event.id,
            formData: data,
            route: route('secretary.events.update', event.id),
        });

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('start_date', data.start_date);
        if (data.end_date) formData.append('end_date', data.end_date);
        if (data.purok_id) formData.append('purok_id', data.purok_id);
        formData.append('has_certificate', data.has_certificate ? '1' : '0');
        formData.append('target_all_residents', data.target_all_residents ? '1' : '0');
        if (data.image) formData.append('image', data.image);
        formData.append('_method', 'PUT');

        console.log('FormData prepared, sending request...');

        router.post(route('secretary.events.update', event.id), formData, {
            forceFormData: true,
            onStart: () => {
                console.log('Request started');
            },
            onSuccess: (page) => {
                console.log('Request successful', page);
            },
            onError: (errors) => {
                console.error('Request failed', errors);
            },
            onFinish: () => {
                console.log('Request finished');
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
        setImagePreview(event.image_path ? `/storage/${event.image_path}` : null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBack = () => {
        router.get(route('secretary.events'));
    };

    return (
        <>
            <Head title="Edit Event" />
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
                        <div className="mx-auto max-w-3xl space-y-6">
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

                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
                                    <p className="text-gray-600">Update event details</p>
                                </div>
                            </div>

                            {/* Edit Form */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                                    className={errors.end_date ? 'border-red-500' : ''}
                                                />
                                                {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
                                            </div>
                                        </div>

                                        {/* Target Audience */}
                                        <div>
                                            <Label htmlFor="target_audience">Target Audience</Label>
                                            <div className="space-y-3">
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

                                        {/* Submit Button */}
                                        <div className="flex gap-4">
                                            <Button type="button" variant="outline" onClick={handleBack} disabled={processing}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Updating...' : 'Update Event'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
