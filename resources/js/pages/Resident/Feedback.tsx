import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Award, Calendar, Download, Eye, MessageSquare, Send, Star } from 'lucide-react';
import { useState } from 'react';

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

interface CertificateData {
    code: string;
    qr_url: string;
    view_url: string;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
        certificate_data?: CertificateData;
    };
}

interface Props {
    eventsNeedingFeedback: EventNeedingFeedback[];
    feedbackHistory: FeedbackHistory[];
}

export default function Feedback({ eventsNeedingFeedback, feedbackHistory }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventNeedingFeedback | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

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

                // Check if certificate was generated
                if (flash?.certificate_data) {
                    setCertificateData(flash.certificate_data);
                    setShowCertificateModal(true);
                }
            },
        });
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedEvent(null);
        reset();
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
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
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Event Feedback</h1>
                                <p className="text-gray-600">Share your thoughts about events you've attended.</p>
                            </div>

                            <Tabs defaultValue="pending" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="pending">Pending Feedback ({eventsNeedingFeedback.length})</TabsTrigger>
                                    <TabsTrigger value="history">Feedback History ({feedbackHistory.length})</TabsTrigger>
                                </TabsList>

                                {/* Pending Feedback */}
                                <TabsContent value="pending" className="space-y-4">
                                    {eventsNeedingFeedback.length > 0 ? (
                                        <div className="grid gap-4 md:gap-6">
                                            {eventsNeedingFeedback.map((event) => (
                                                <Card key={event.id} className="shadow-sm">
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center justify-between text-lg">
                                                            {event.event_name}
                                                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-600">
                                                                Feedback Pending
                                                            </span>
                                                        </CardTitle>
                                                    </CardHeader>

                                                    <CardContent className="space-y-4">
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(event.date).toLocaleDateString()}
                                                            </div>
                                                            {event.has_certificate && (
                                                                <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-600">
                                                                    Certificate Available
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex gap-2 pt-2">
                                                            <Button size="sm" onClick={() => handleSubmitFeedback(event)} className="gap-2">
                                                                <MessageSquare className="h-4 w-4" />
                                                                Submit Feedback
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="p-8 text-center">
                                            <CardContent>
                                                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <h3 className="mb-2 text-lg font-medium text-gray-900">No Pending Feedback</h3>
                                                <p className="text-gray-600">You're all caught up! No events are waiting for your feedback.</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                {/* Feedback History */}
                                <TabsContent value="history" className="space-y-4">
                                    {feedbackHistory.length > 0 ? (
                                        <div className="grid gap-4 md:gap-6">
                                            {feedbackHistory.map((feedback) => (
                                                <Card key={feedback.id} className="shadow-sm">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <CardTitle className="text-lg">{feedback.event_name}</CardTitle>
                                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                                                                Submitted
                                                            </span>
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-2">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                Event Date: {new Date(feedback.date).toLocaleDateString()}
                                                            </div>
                                                            <div>Submitted: {new Date(feedback.submitted_date).toLocaleDateString()}</div>
                                                        </div>

                                                        {/* Display rating if available */}
                                                        {feedback.rating && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">Rating:</span>
                                                                <div className="flex gap-1">{renderStars(feedback.rating)}</div>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <p className="mb-2 text-sm font-medium text-gray-700">Your Feedback:</p>
                                                            <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">{feedback.comment}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="p-8 text-center">
                                            <CardContent>
                                                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                                <h3 className="mb-2 text-lg font-medium text-gray-900">No Feedback History</h3>
                                                <p className="text-gray-600">Your submitted feedback will appear here.</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>
                </div>

                {/* Feedback Submission Modal */}
                <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Submit Feedback</DialogTitle>
                        </DialogHeader>

                        {selectedEvent && (
                            <form onSubmit={submitFeedback} className="space-y-4">
                                <div>
                                    <h3 className="mb-2 font-medium text-gray-900">{selectedEvent.event_name}</h3>
                                    <p className="text-sm text-gray-600">Event Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Your Comments <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        placeholder="Share your thoughts about this event..."
                                        value={data.comments}
                                        onChange={(e) => setData('comments', e.target.value)}
                                        className="min-h-[100px]"
                                        required
                                    />
                                    {errors.comments && <p className="text-sm text-red-500">{errors.comments}</p>}
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="submit" disabled={processing} className="flex-1 gap-2">
                                        <Send className="h-4 w-4" />
                                        {processing ? 'Submitting...' : 'Submit Feedback'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={closeFeedbackModal} disabled={processing}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Certificate Success Modal */}
                <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-600" />
                                Certificate Generated!
                            </DialogTitle>
                        </DialogHeader>

                        {certificateData && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Congratulations! Your certificate has been generated and is ready for download.
                                </p>

                                <div className="flex flex-col items-center space-y-4">
                                    <div className="rounded-lg border bg-white p-4">
                                        <img src={certificateData.qr_url} alt="Certificate QR Code" className="h-32 w-32" />
                                    </div>

                                    <p className="text-center text-xs text-gray-500">
                                        Scan this QR code or use the buttons below to access your certificate
                                    </p>

                                    <div className="flex w-full gap-2">
                                        <Button className="flex-1 gap-2" onClick={() => window.open(certificateData.view_url, '_blank')}>
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 gap-2"
                                            onClick={() => {
                                                navigator.clipboard.writeText(certificateData.view_url);
                                                alert('Certificate link copied to clipboard!');
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                            Copy Link
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
