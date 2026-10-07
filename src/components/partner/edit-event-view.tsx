'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateEvent } from '@/lib/demo/actions';
import { useAssetUrl } from '@/lib/demo/files';
import { useCurrentUser, useDb } from '@/lib/demo/store';
import { toDateTimeLocalInput, toISODateTime } from '@/lib/format';
import { route } from '@/lib/routes';
import type { BarangayEvent, Purok } from '@/lib/types';
import { useForm } from '@/lib/use-form';
import { partnerEditEventProps } from '@/lib/views/partner';
import { ArrowLeft, Upload, X, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

const HOUR = 60 * 60 * 1000;

/** datetime-local value in local time (the original used toISOString, which shifted by the UTC offset). */
const toInputValue = (date: Date) => toISODateTime(date).slice(0, 16);

export default function PartnerEditEventView({ id }: { id: number }) {
    const db = useDb();
    const user = useCurrentUser()!;
    const router = useRouter();
    const { event, puroks } = useMemo(() => partnerEditEventProps(db, user, id), [db, user, id]);

    // The controller 404'd for other partners' events and refused approved/declined ones.
    if (!event || event.status !== 'pending') {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push(route('partner.events'))} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
                        <p className="text-gray-600">Update event request details</p>
                    </div>
                </div>
                <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {event ? 'Cannot edit approved or declined events.' : 'Event not found.'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return <EditEventForm key={event.id} event={event} puroks={puroks} />;
}

function EditEventForm({ event, puroks }: { event: BarangayEvent; puroks: Purok[] }) {
    const router = useRouter();
    const existingImageUrl = useAssetUrl(event.image_path);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const imagePreview = newImagePreview ?? existingImageUrl ?? null;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, submit, processing, errors, setError, clearErrors } = useForm({
        title: event.title,
        description: event.description,
        venue: event.venue || '',
        start_date: toDateTimeLocalInput(event.start_date),
        end_date: toDateTimeLocalInput(event.end_date),
        purok_ids: event.purok_ids || [],
        has_certificate: event.has_certificate,
        target_all_residents: event.target_all_residents,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { image, ...input } = data;
        submit(() => updateEvent(event.id, input, image), {
            onSuccess: () => router.push(route('partner.events')),
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setNewImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setNewImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBack = () => {
        router.push(route('partner.events'));
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
                    <p className="text-gray-600">Update event request details</p>
                </div>
            </div>

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Duplicate Error Alert */}
                        {errors.duplicate && (
                            <Alert className="border-red-200 bg-red-50">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">{errors.duplicate}</AlertDescription>
                            </Alert>
                        )}

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

                        {/* Venue */}
                        <div>
                            <Label htmlFor="venue">Venue (Optional)</Label>
                            <Input
                                id="venue"
                                value={data.venue}
                                onChange={(e) => setData('venue', e.target.value)}
                                placeholder="Enter event venue"
                                className={errors.venue ? 'border-red-500' : ''}
                            />
                            {errors.venue && <p className="mt-1 text-sm text-red-500">{errors.venue}</p>}
                        </div>

                        {/* Event Image */}
                        <div>
                            <Label htmlFor="image">Event Image</Label>
                            <div className="space-y-4">
                                {imagePreview && (
                                    <div className="relative inline-block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imagePreview} alt="Event preview" className="h-32 w-48 rounded-lg border object-cover" />
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
                                    <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-4 w-4" />
                                        {imagePreview ? 'Change Image' : 'Upload Image'}
                                    </Button>
                                    <Input
                                        id="image"
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
                                    onChange={(e) => {
                                        setData('start_date', e.target.value);
                                        // Reset end date if it's too close to the new start date
                                        if (data.end_date && e.target.value) {
                                            const startTime = new Date(e.target.value).getTime();
                                            const endTime = new Date(data.end_date).getTime();
                                            if (endTime <= startTime + HOUR) {
                                                setData('end_date', '');
                                            }
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
                                    min={data.start_date ? toInputValue(new Date(new Date(data.start_date).getTime() + HOUR)) : undefined}
                                    onChange={(e) => {
                                        const selectedEndTime = new Date(e.target.value).getTime();
                                        const requiredMinTime = new Date(data.start_date).getTime() + HOUR;

                                        if (selectedEndTime < requiredMinTime) {
                                            setError('end_date', 'End date must be at least 1 hour after start date');
                                            return;
                                        }

                                        clearErrors('end_date');
                                        setData('end_date', e.target.value);
                                    }}
                                    className={errors.end_date ? 'border-red-500' : ''}
                                    disabled={!data.start_date}
                                />
                                {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>}
                                {!data.start_date && <p className="mt-1 text-sm text-gray-500">Please select a start date first</p>}
                                {data.start_date && <p className="mt-1 text-sm text-gray-500">Must be at least 1 hour after start date</p>}
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
                                        <Label>Select Puroks</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {puroks.map((purok) => (
                                                <div key={purok.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`purok_${purok.id}`}
                                                        checked={data.purok_ids.includes(purok.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setData('purok_ids', [...data.purok_ids, purok.id]);
                                                            } else {
                                                                setData(
                                                                    'purok_ids',
                                                                    data.purok_ids.filter((id) => id !== purok.id),
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`purok_${purok.id}`} className="text-sm">
                                                        {purok.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>

                                        {errors.purok_ids && <p className="text-sm text-red-600">{errors.purok_ids}</p>}
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
                                {processing ? 'Updating...' : 'Update Event Request'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
