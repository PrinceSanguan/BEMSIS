'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { removePartnerCertificate, removePartnerFeedbackLink, uploadPartnerResources } from '@/lib/demo/actions';
import { isStoredFile, openStoredFile } from '@/lib/demo/files';
import { useForm } from '@/lib/use-form';
import { ExternalLink, FileUp, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface Event {
    id: number;
    partner_feedback_link: string | null;
    partner_certificate_path: string | null;
}

interface PartnerResourcesUploadProps {
    event: Event;
    eligibleCount: number;
    className?: string;
}

export default function PartnerResourcesUpload({ event, eligibleCount, className }: PartnerResourcesUploadProps) {
    const {
        data,
        setData,
        errors,
        processing: uploading,
        submit,
    } = useForm({
        partner_feedback_link: event.partner_feedback_link || '',
        partner_certificate: null as File | null,
    });
    // Remounts the file input after an upload so it no longer shows the sent file.
    const [fileInputKey, setFileInputKey] = useState(0);
    const [confirming, setConfirming] = useState<'link' | 'certificate'>('link');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const askToRemove = (resource: 'link' | 'certificate') => {
        setConfirming(resource);
        setConfirmOpen(true);
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        submit(() => uploadPartnerResources(event.id, data.partner_feedback_link, data.partner_certificate), {
            onSuccess: () => {
                setData('partner_certificate', null);
                setFileInputKey((key) => key + 1);
            },
        });
    };

    const handleRemoveFeedbackLink = () => {
        const result = removePartnerFeedbackLink(event.id);
        if (result.ok) setData('partner_feedback_link', '');
    };

    const handleRemoveCertificate = async () => {
        await removePartnerCertificate(event.id);
    };

    const certificatePath = event.partner_certificate_path;

    return (
        <Card className={className}>
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
                                value={data.partner_feedback_link}
                                onChange={(e) => setData('partner_feedback_link', e.target.value)}
                            />
                            {event.partner_feedback_link && (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(event.partner_feedback_link!, '_blank', 'noopener')}
                                        aria-label="Open partner feedback link"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => askToRemove('link')}
                                        aria-label="Remove partner feedback link"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        {errors.partner_feedback_link && <p className="mt-1 text-sm text-red-500">{errors.partner_feedback_link}</p>}
                    </div>

                    {/* Certificate File */}
                    <div>
                        <Label htmlFor="certificate_file">Partner Certificate (PDF/Image)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                key={fileInputKey}
                                id="certificate_file"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setData('partner_certificate', e.target.files?.[0] || null)}
                            />
                            {certificatePath && (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => void openStoredFile(certificatePath)}
                                        aria-label="View partner certificate"
                                    >
                                        <FileUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => askToRemove('certificate')}
                                        aria-label="Remove partner certificate"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        {errors.partner_certificate && <p className="mt-1 text-sm text-red-500">{errors.partner_certificate}</p>}
                        {certificatePath && (
                            <p className="mt-1 text-xs text-gray-600">
                                Current: {isStoredFile(certificatePath) ? 'uploaded certificate file' : certificatePath.split('/').pop()}
                            </p>
                        )}
                    </div>

                    <Button type="submit" disabled={uploading || (!data.partner_feedback_link && !data.partner_certificate)} className="gap-2">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload Resources'}
                    </Button>
                </form>
            </CardContent>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={confirming === 'certificate' ? 'Remove partner certificate?' : 'Remove partner feedback link?'}
                description={
                    confirming === 'certificate'
                        ? 'Residents will no longer be able to download the partner certificate for this event.'
                        : 'Residents will no longer see the partner feedback link for this event.'
                }
                confirmLabel="Remove"
                destructive
                onConfirm={confirming === 'certificate' ? handleRemoveCertificate : handleRemoveFeedbackLink}
            />
        </Card>
    );
}
