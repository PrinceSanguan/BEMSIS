'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createEvent } from '@/lib/demo/actions';
import { toDate, toISODateTime } from '@/lib/format';
import type { Purok } from '@/lib/types';
import { useForm } from '@/lib/use-form';
import { Upload, X, XCircle } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

const HOUR = 60 * 60 * 1000;

/** Value for a datetime-local input in local time ("2026-10-14T06:00"). */
const toLocalInput = (date: Date) => toISODateTime(date).slice(0, 16);

interface EventsCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    puroks: Purok[];
    now: Date;
}

/** "Create New Event" dialog of the Secretary events page. */
export function EventsCreateDialog({ open, onOpenChange, puroks, now }: EventsCreateDialogProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, submit, processing, errors, setError, clearErrors, reset } = useForm({
        title: '',
        description: '',
        venue: '',
        start_date: '',
        end_date: '',
        purok_ids: [] as number[],
        has_certificate: false as boolean,
        target_all_residents: false as boolean,
        image: null as File | null,
    });

    const startTime = toDate(data.start_date)?.getTime();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Validate purok selection
        if (!data.target_all_residents && data.purok_ids.length === 0) {
            setError('purok_ids', 'Please select at least one purok or check "Target all residents"');
            return;
        }

        const { image, ...input } = data;
        submit(
            () =>
                createEvent(
                    {
                        ...input,
                        // When targeting all residents, purok_ids are not sent at all
                        purok_ids: input.target_all_residents ? [] : input.purok_ids,
                    },
                    image,
                ),
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            },
        );
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-4 sm:max-h-[80vh] sm:p-6">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create a new community event that will be submitted for captain approval.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    {/* Image Upload */}
                    <div>
                        <Label>Event Image (Optional)</Label>
                        <div className="mt-2 space-y-3">
                            {imagePreview && (
                                <div className="relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imagePreview} alt="Preview" className="h-32 w-full rounded-lg border object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        aria-label="Remove image"
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
                                min={toLocalInput(now)}
                                onChange={(e) => {
                                    setData('start_date', e.target.value);
                                    // Reset end date if it's too close to the new start date
                                    const newStart = toDate(e.target.value);
                                    const end = toDate(data.end_date);
                                    if (newStart && end && end.getTime() <= newStart.getTime() + HOUR) {
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
                                min={startTime !== undefined ? toLocalInput(new Date(startTime + HOUR)) : undefined}
                                onChange={(e) => {
                                    const selectedEnd = toDate(e.target.value);
                                    if (selectedEnd && startTime !== undefined && selectedEnd.getTime() < startTime + HOUR) {
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
                            <Label>Select Puroks</Label>
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {puroks.map((purok) => (
                                    <div key={purok.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`purok_${purok.id}`}
                                            checked={data.purok_ids.includes(purok.id)}
                                            onCheckedChange={(checked) => {
                                                clearErrors('purok_ids');
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
                            {data.purok_ids.length === 0 && !data.target_all_residents && !errors.purok_ids && (
                                <p className="mt-1 text-sm text-amber-600">
                                    Please select at least one purok or check &quot;Target all residents&quot;
                                </p>
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
