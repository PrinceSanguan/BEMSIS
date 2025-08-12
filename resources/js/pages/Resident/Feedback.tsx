import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, MessageSquare, Send, Star } from 'lucide-react';
import { useState } from 'react';

import { useForm } from '@inertiajs/react';

interface EventNeedingFeedback {
    id: number;
    event_name: string;
    date: string;
    has_certificate: boolean;
}

interface FeedbackHistory {
    id: number;
    event_name: string;
    date: string;
    comment: string;
    submitted_date: string;
    rating: number;
}

interface Props {
    eventsNeedingFeedback: EventNeedingFeedback[];
    feedbackHistory: FeedbackHistory[];
}

export default function Feedback({ eventsNeedingFeedback, feedbackHistory }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventNeedingFeedback | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        event_id: 0,
        comments: '',
    });

    const handleSubmitFeedback = (event: EventNeedingFeedback) => {
        setSelectedEvent(event);
        setData('event_id', event.id);
        setShowFeedbackModal(true);
    };

    const submitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('resident.feedback.submit'), {
            onSuccess: () => {
                setShowFeedbackModal(false);
                reset();
                setSelectedEvent(null);
            },
        });
    };
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [pendingEvents, setPendingEvents] = useState(pendingFeedback);

    const handleSubmitFeedback = () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        // Remove from pending and add to history (mock)
        setPendingEvents(pendingEvents.filter((e) => e.id !== selectedEvent.id));
        alert('Feedback submitted successfully!');
        setSelectedEvent(null);
        setRating(0);
        setComment('');
    };

    const renderStars = (currentRating: number, isInteractive = false) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-5 w-5 cursor-pointer ${i < currentRating ? 'fill-current text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                onClick={isInteractive ? () => setRating(i + 1) : undefined}
            />
        ));
    };

    return (
        <>
            <Head title="Event Feedback" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="resident.feedback" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="resident.feedback" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Juan Dela Cruz" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Event Feedback</h2>
                            <p className="text-gray-600">Share your thoughts about community events</p>
                        </div>

                        <Tabs defaultValue="pending" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="pending">Pending Feedback</TabsTrigger>
                                <TabsTrigger value="history">Feedback History</TabsTrigger>
                            </TabsList>

                            {/* Pending Feedback */}
                            <TabsContent value="pending" className="space-y-4">
                                {pendingEvents.length > 0 ? (
                                    pendingEvents.map((event) => (
                                        <Card key={event.id} className="shadow-sm">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                                    {event.eventName}
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                                    <div>
                                                        <p className="font-medium text-gray-700">Event Date</p>
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <Calendar className="h-4 w-4" />
                                                            {event.date}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-700">Organizer</p>
                                                        <p className="text-gray-600">{event.organizer}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" onClick={() => setSelectedEvent(event)} className="gap-2">
                                                                <Send className="h-4 w-4" />
                                                                Submit Feedback
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>Event Feedback</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{selectedEvent?.eventName}</p>
                                                                    <p className="text-sm text-gray-600">{selectedEvent?.date}</p>
                                                                </div>

                                                                <div>
                                                                    <p className="mb-2 font-medium">Rating</p>
                                                                    <div className="flex gap-1">{renderStars(rating, true)}</div>
                                                                </div>

                                                                <div>
                                                                    <p className="mb-2 font-medium">Comments</p>
                                                                    <Textarea
                                                                        placeholder="Share your thoughts about this event..."
                                                                        value={comment}
                                                                        onChange={(e) => setComment(e.target.value)}
                                                                        className="min-h-[100px]"
                                                                    />
                                                                </div>

                                                                <Button onClick={handleSubmitFeedback} className="w-full">
                                                                    Submit Feedback
                                                                </Button>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Card className="p-8 text-center">
                                        <CardContent>
                                            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900">No Pending Feedback</h3>
                                            <p className="text-gray-600">You're all caught up! No events need your feedback right now.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Feedback History */}
                            <TabsContent value="history" className="space-y-4">
                                {feedbackHistory.map((feedback) => (
                                    <Card key={feedback.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <CardTitle className="text-lg">{feedback.eventName}</CardTitle>
                                                <div className="flex items-center gap-1">{renderStars(feedback.rating)}</div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                                <div>
                                                    <p className="font-medium text-gray-700">Event Date</p>
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        {feedback.date}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Feedback Submitted</p>
                                                    <p className="text-gray-600">{feedback.submittedDate}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="mb-2 font-medium text-gray-700">Your Comments</p>
                                                <div className="rounded-lg bg-gray-50 p-3">
                                                    <p className="text-sm text-gray-700">{feedback.comment}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </>
    );
}
