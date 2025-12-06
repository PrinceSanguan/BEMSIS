import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { ExternalLink, FileUp, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface Event {
    id: number;
    partner_feedback_link?: string;
    partner_certificate_path?: string;
}

interface PartnerResourcesUploadProps {
    event: Event;
    eligibleCount: number;
}

export default function PartnerResourcesUpload({ event, eligibleCount }: PartnerResourcesUploadProps) {
    const [feedbackLink, setFeedbackLink] = useState(event.partner_feedback_link || '');
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        const formData = new FormData();
        if (feedbackLink) formData.append('partner_feedback_link', feedbackLink);
        if (certificateFile) formData.append('partner_certificate', certificateFile);

        router.post(route('secretary.events.upload-partner-resources', event.id), formData, {
            onFinish: () => {
                setUploading(false);
                setCertificateFile(null);
            },
        });
    };

    const handleRemoveFeedbackLink = () => {
        if (confirm('Remove partner feedback link?')) {
            router.delete(route('secretary.events.remove-partner-feedback', event.id));
        }
    };

    const handleRemoveCertificate = () => {
        if (confirm('Remove partner certificate?')) {
            router.delete(route('secretary.events.remove-partner-certificate', event.id));
        }
    };

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5" />
                    Partner Agency Resources
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Upload feedback link and certificate for partner agencies. Only residents who completed attendance and submitted feedback (
                    {eligibleCount} residents) can access these.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleUpload} className="space-y-4">
                    {/* Feedback Link */}
                    <div>
                        <Label htmlFor="feedback_link">Partner Feedback Link</Label>
                        <div className="flex gap-2">
                            <Input
                                id="feedback_link"
                                type="url"
                                placeholder="https://forms.google.com/..."
                                value={feedbackLink}
                                onChange={(e) => setFeedbackLink(e.target.value)}
                            />
                            {event.partner_feedback_link && (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(event.partner_feedback_link, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={handleRemoveFeedbackLink}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Certificate File */}
                    <div>
                        <Label htmlFor="certificate_file">Partner Certificate (PDF/Image)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="certificate_file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                            />
                            {event.partner_certificate_path && (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/storage/${event.partner_certificate_path}`, '_blank')}
                                    >
                                        <FileUp className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="destructive" size="sm" onClick={handleRemoveCertificate}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        {event.partner_certificate_path && (
                            <p className="mt-1 text-xs text-gray-600">Current: {event.partner_certificate_path.split('/').pop()}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={uploading || (!feedbackLink && !certificateFile)} className="gap-2">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Resources'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
