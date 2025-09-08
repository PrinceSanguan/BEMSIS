import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, Eye, MessageSquare, User, X, XCircle } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Event {
    id: number;
    title: string;
    start_date: string;
    end_date?: string;
    description: string;
    creator: User;
    feedbacks_count: number;
    status: string;
}

interface EventFeedback {
    id: number;
    comments: string;
    created_at: string;
    user: User;
}

interface Props {
    events: Event[];
    className?: string;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Feedback({ events, className }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventFeedbacks, setEventFeedbacks] = useState<EventFeedback[]>([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [loadingFeedback, setLoadingFeedback] = useState(false);

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

    const handleViewFeedback = async (event: Event) => {
        setSelectedEvent(event);
        setLoadingFeedback(true);
        setShowFeedbackModal(true);

        try {
            const response = await fetch(route('secretary.feedback.event', event.id));
            const data = await response.json();
            setEventFeedbacks(data.feedbacks);
        } catch (error) {
            console.error('Error loading feedback:', error);
            setEventFeedbacks([]);
        } finally {
            setLoadingFeedback(false);
        }
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedEvent(null);
        setEventFeedbacks([]);
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

    const totalFeedback = events.reduce((sum, event) => sum + event.feedbacks_count, 0);

    return (
        <>
            <Head title="Feedback Review" />

            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.feedback" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.feedback" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${className || ''}`}>
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Feedback Review</h1>
                                <p className="mt-2 text-gray-600">Review and manage feedback submitted by residents for events</p>
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
                                        Events that have received participant feedback. Click "View Feedback" to see all responses.
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
                                                                        <span>Created by {event.creator.name}</span>
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
                                            <p className="text-gray-600">
                                                No feedback has been submitted yet. Check back later for participant responses.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && selectedEvent && (
                <Dialog open={showFeedbackModal} onOpenChange={closeFeedbackModal}>
                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">Feedback for "{selectedEvent.title}"</h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {formatDate(selectedEvent.start_date)} • {eventFeedbacks.length} feedback
                                        {eventFeedbacks.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={closeFeedbackModal}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {loadingFeedback ? (
                                <div className="p-8 text-center">
                                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                                    <p className="text-gray-600">Loading feedback...</p>
                                </div>
                            ) : eventFeedbacks.length > 0 ? (
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
