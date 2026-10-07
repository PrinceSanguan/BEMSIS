'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { submitFeedback, type CertificateData } from '@/lib/demo/actions';
import { flash } from '@/lib/demo/flash';
import { useCurrentUser, useDb } from '@/lib/demo/store';
import { absoluteUrl } from '@/lib/domain/queries';
import { toDate } from '@/lib/format';
import { useForm } from '@/lib/use-form';
import { residentFeedbackProps, type EventNeedingFeedback } from '@/lib/views/resident';
import { Award, Calendar, Check, Download, Eye, MessageSquare, Send, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FormEvent, useMemo, useState } from 'react';

/** Date strings shown in the visitor's locale ("YYYY-MM-DD" parsed as a local date, not UTC). */
const formatLocalDate = (date: string) => (toDate(date) ?? new Date(date)).toLocaleDateString();

const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
    ));
};

export default function ResidentFeedbackView() {
    const db = useDb();
    const user = useCurrentUser()!;
    const { eventsNeedingFeedback, feedbackHistory } = useMemo(() => residentFeedbackProps(db, user), [db, user]);

    const [selectedEvent, setSelectedEvent] = useState<EventNeedingFeedback | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const { data, setData, submit, processing, errors, reset } = useForm({
        event_id: 0,
        comments: '',
        rating: 0,
    });

    const handleSubmitFeedback = (event: EventNeedingFeedback) => {
        setSelectedEvent(event);
        setData('event_id', event.id);
        setShowFeedbackModal(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit(() => submitFeedback(data), {
            onSuccess: (result) => {
                setShowFeedbackModal(false);
                reset();
                setSelectedEvent(null);

                // Certificate generated for this event: show it right away.
                if (result.certificate) {
                    setCertificateData(result.certificate);
                    setLinkCopied(false);
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

    const copyCertificateLink = async (viewUrl: string) => {
        try {
            await navigator.clipboard.writeText(absoluteUrl(viewUrl));
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            flash('error', 'Could not copy the certificate link.');
        }
    };

    return (
        <>
            <div className="mx-auto max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Event Feedback</h1>
                    <p className="text-gray-600">Share your thoughts about events you&apos;ve attended.</p>
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
                                                    {formatLocalDate(event.date)}
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
                                    <p className="text-gray-600">You&apos;re all caught up! No events are waiting for your feedback.</p>
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
                                                    Event Date: {formatLocalDate(feedback.date)}
                                                </div>
                                                <div>Submitted: {formatLocalDate(feedback.submitted_date)}</div>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-sm font-medium text-gray-700">Your Feedback:</p>
                                                {!!feedback.rating && (
                                                    <div className="mb-2 flex items-center gap-1">
                                                        {renderStars(feedback.rating)}
                                                        <span className="ml-2 text-sm text-gray-600">({feedback.rating}/5)</span>
                                                    </div>
                                                )}
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

            {/* Feedback Submission Modal */}
            <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Submit Feedback</DialogTitle>
                    </DialogHeader>

                    {selectedEvent && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900">{selectedEvent.event_name}</h3>
                                <p className="text-sm text-gray-600">Event Date: {formatLocalDate(selectedEvent.date)}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Rating (Optional)</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            className="transition-transform hover:scale-110"
                                            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                                        >
                                            <Star
                                                className={`h-8 w-8 ${star <= data.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {data.rating > 0 && (
                                    <p className="text-sm text-gray-600">
                                        You rated this event {data.rating} star{data.rating !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="feedback-comments" className="text-sm font-medium text-gray-700">
                                    Your Comments <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    id="feedback-comments"
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
                            <p className="text-sm text-gray-600">Congratulations! Your certificate has been generated and is ready for download.</p>

                            <div className="flex flex-col items-center space-y-4">
                                <div className="rounded-lg border bg-white p-4">
                                    <QRCodeSVG value={absoluteUrl(certificateData.view_url)} size={128} marginSize={2} title="Certificate QR Code" />
                                </div>

                                <p className="text-center text-xs text-gray-500">
                                    Scan this QR code or use the buttons below to access your certificate
                                </p>

                                <div className="flex w-full gap-2">
                                    <Button className="flex-1 gap-2" onClick={() => window.open(certificateData.view_url, '_blank')}>
                                        <Eye className="h-4 w-4" />
                                        View certificate
                                    </Button>
                                    <Button variant="outline" className="flex-1 gap-2" onClick={() => copyCertificateLink(certificateData.view_url)}>
                                        {linkCopied ? <Check className="h-4 w-4 text-green-600" /> : <Download className="h-4 w-4" />}
                                        {linkCopied ? 'Copied!' : 'Copy Link'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
