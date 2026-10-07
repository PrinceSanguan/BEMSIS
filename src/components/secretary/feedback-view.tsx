'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDb } from '@/lib/demo/store';
import { secretaryEventFeedback, secretaryFeedbackProps, type SecretaryFeedbackEvent } from '@/lib/views/secretary-operations';
import { Calendar, Eye, MessageSquare, Star, User } from 'lucide-react';
import { useMemo, useState } from 'react';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

export default function SecretaryFeedbackView() {
    const db = useDb();
    const { events } = useMemo(() => secretaryFeedbackProps(db), [db]);
    const [selectedEvent, setSelectedEvent] = useState<SecretaryFeedbackEvent | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // What the page used to fetch from route('secretary.feedback.event', id).
    const eventFeedbacks = useMemo(() => (selectedEvent ? (secretaryEventFeedback(db, selectedEvent.id)?.feedbacks ?? []) : []), [db, selectedEvent]);

    const handleViewFeedback = (event: SecretaryFeedbackEvent) => {
        setSelectedEvent(event);
        setShowFeedbackModal(true);
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedEvent(null);
    };

    const totalFeedback = events.reduce((sum, event) => sum + event.feedbacks_count, 0);

    return (
        <>
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Feedback Review</h1>
                    <p className="mt-2 text-gray-600">Review and manage feedback submitted by residents for events</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Events with Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{events.length}</div>
                            <p className="text-xs text-gray-500">Events that received feedback</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{totalFeedback}</div>
                            <p className="text-xs text-gray-500">All feedback submissions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Average per Event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">
                                {events.length > 0 ? (totalFeedback / events.length).toFixed(1) : '0'}
                            </div>
                            <p className="text-xs text-gray-500">Feedback per event</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Events with Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Events with Feedback
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                            Events that have received participant feedback. Click &quot;View Feedback&quot; to see all responses.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {events.length > 0 ? (
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <Card key={event.id} className="border border-gray-200 transition-shadow hover:shadow-md">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                        <Badge className={getStatusColor(event.status)}>
                                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-gray-600">{truncateText(event.description, 150)}</p>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{formatDate(event.start_date)}</span>
                                                            {event.end_date && <span> - {formatDate(event.end_date)}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            <span>Created by {event.creator?.name ?? 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="h-4 w-4" />
                                                            <span>
                                                                {event.feedbacks_count} feedback{event.feedbacks_count !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <Button onClick={() => handleViewFeedback(event)} className="gap-2" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                        View Feedback ({event.feedbacks_count})
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No Feedback Found</h3>
                                <p className="text-gray-600">No feedback has been submitted yet. Check back later for participant responses.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && selectedEvent && (
                <Dialog open={showFeedbackModal} onOpenChange={closeFeedbackModal}>
                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle asChild>
                                <div>
                                    <h2 className="text-xl font-semibold">Feedback for &quot;{selectedEvent.title}&quot;</h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {formatDate(selectedEvent.start_date)} • {eventFeedbacks.length} feedback
                                        {eventFeedbacks.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {eventFeedbacks.length > 0 ? (
                                eventFeedbacks.map((feedback) => (
                                    <Card key={feedback.id} className="border border-gray-200">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-gray-900">{feedback.user.name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {feedback.user.role}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{formatDateTime(feedback.created_at)}</span>
                                                </div>

                                                {!!feedback.rating && (
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-4 w-4 ${
                                                                    star <= (feedback.rating ?? 0)
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                        <span className="ml-2 text-sm text-gray-600">({feedback.rating}/5)</span>
                                                    </div>
                                                )}
                                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                                    <div className="flex items-start gap-2">
                                                        <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                                        <p className="text-sm leading-relaxed text-amber-700">{feedback.comments}</p>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500">Contact: {feedback.user.email}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">No Feedback</h3>
                                    <p className="text-gray-600">No feedback has been submitted for this event yet.</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
