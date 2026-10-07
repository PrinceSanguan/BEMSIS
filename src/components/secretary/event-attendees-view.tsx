'use client';

import PartnerResourcesUpload from '@/components/secretary/partner-resources-upload';
import { StoredImage } from '@/components/shared/stored-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDb } from '@/lib/demo/store';
import { todayISO } from '@/lib/format';
import { route } from '@/lib/routes';
import { secretaryEventAttendeesProps, type SecretaryAttendee } from '@/lib/views/secretary-operations';
import { ArrowLeft, Calendar, Clock, Download, Mail, MapPin, Phone, QrCode, Users } from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function SecretaryEventAttendeesView({ id }: { id: number }) {
    const db = useDb();
    const props = useMemo(() => secretaryEventAttendeesProps(db, id), [db, id]);
    const [selectedAttendee, setSelectedAttendee] = useState<SecretaryAttendee | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);

    if (!props) {
        return (
            <div className="mx-auto max-w-7xl space-y-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">Event not found</h3>
                        <p className="mb-4 text-gray-600">This event does not exist or was deleted.</p>
                        <Button variant="outline" asChild>
                            <Link href={route('secretary.events')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Events
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { event, attendees, eligibleForPartnerResources } = props;

    const showQRCode = (attendee: SecretaryAttendee) => {
        if (!attendee.qr_code) return;
        setSelectedAttendee(attendee);
        setShowQRModal(true);
    };

    const attendedCount = attendees.filter((a) => a.time_in).length;
    const attendanceRate = attendees.length > 0 ? Math.round((attendedCount / attendees.length) * 100) : 0;

    const downloadAttendeesCSV = () => {
        if (attendees.length === 0) return;

        // Define CSV headers
        const headers = ['Name', 'Email', 'Phone', 'Purok', 'Time-In Status', 'Time-In Label', 'Time-Out Label', 'QR Code', 'Time-In Date'];

        // Convert attendees data to CSV rows
        const csvData = attendees.map((attendee) => [
            attendee.user.name,
            attendee.user.email,
            attendee.user.phone,
            attendee.user.purok?.name || 'N/A',
            attendee.time_in ? 'Attended' : 'Registered',
            attendee.time_in_label || 'N/A',
            attendee.time_out_label || 'N/A',
            attendee.qr_code || 'N/A',
            attendee.time_in ? formatDate(attendee.time_in) : 'N/A',
        ]);

        // Combine headers and data
        const allRows = [headers, ...csvData];

        // Convert to CSV string
        const csvContent = allRows
            .map((row) =>
                row
                    .map((cell) => {
                        // Escape quotes and wrap in quotes if cell contains comma, quote, or newline
                        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                            return `"${cell.replace(/"/g, '""')}"`;
                        }
                        return cell;
                    })
                    .join(','),
            )
            .join('\n');

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);

        // Create filename with event title and current date
        const eventTitle = event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.setAttribute('download', `attendees_${eventTitle}_${todayISO()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <Button variant="outline" asChild className="shrink-0">
                            <Link href={route('secretary.events')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Events
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                            <p className="text-gray-600">Event Attendees</p>
                        </div>
                    </div>
                    <Button onClick={downloadAttendeesCSV} className="gap-2" disabled={attendees.length === 0}>
                        <Download className="h-4 w-4" />
                        Download CSV ({attendees.length})
                    </Button>
                </div>

                {/* Event Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Event Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Event Image */}
                        {event.image_path && (
                            <StoredImage path={event.image_path} alt={event.title} className="mb-4 h-48 w-full rounded-lg border object-cover" />
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                    {formatDate(event.start_date)}
                                    {event.end_date && ` - ${formatDate(event.end_date)}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{attendees.length} registered</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Registered</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{attendees.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Attended</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{attendedCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Attendance Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${
                                    attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}
                            >
                                {attendanceRate}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendees List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Attendees ({attendees.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {attendees.length === 0 ? (
                            <div className="py-8 text-center">
                                <Users className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees</h3>
                                <p className="mt-1 text-sm text-gray-500">No one has registered for this event yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {attendees.map((attendee) => (
                                    <div
                                        key={attendee.id}
                                        className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-3">
                                                <h3 className="font-medium text-gray-900">{attendee.user.name}</h3>
                                                <Badge className={attendee.time_in ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                    {attendee.time_in ? 'Attended' : 'Registered'}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-3">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{attendee.user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{attendee.user.phone}</span>
                                                </div>
                                                {attendee.user.purok && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{attendee.user.purok.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {attendee.time_in && (
                                                <div className="mt-2 text-xs text-green-600">
                                                    Time-In: {formatDate(attendee.time_in)} ({attendee.time_in_label})
                                                </div>
                                            )}
                                            {attendee.time_out && (
                                                <div className="mt-2 text-xs text-blue-600">
                                                    Time-Out: {formatDate(attendee.time_out)} ({attendee.time_out_label})
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end sm:ml-4">
                                            {attendee.qr_code && (
                                                <Button variant="outline" size="sm" onClick={() => showQRCode(attendee)}>
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    View QR
                                                </Button>
                                            )}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {attendee.time_in && (
                                                <Badge
                                                    className={
                                                        attendee.time_in_label === 'On-Time'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }
                                                >
                                                    Time-In: {attendee.time_in_label}
                                                </Badge>
                                            )}
                                            {attendee.time_out && (
                                                <Badge
                                                    className={
                                                        attendee.time_out_label === 'Completed'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }
                                                >
                                                    Time-Out: {attendee.time_out_label}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Partner Resources Upload */}
                <PartnerResourcesUpload event={event} eligibleCount={eligibleForPartnerResources} />
            </div>

            {/* QR Code Modal */}
            <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
                <DialogContent className="max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>QR Code for {selectedAttendee?.user.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4">
                        {selectedAttendee?.qr_code && (
                            <div className="rounded-lg border bg-white p-4">
                                <QRCodeSVG value={selectedAttendee.qr_code} size={192} marginSize={2} className="h-48 w-48" />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-sm break-all text-gray-600">QR Code: {selectedAttendee?.qr_code}</p>
                            <p className="mt-2 text-xs text-gray-500">This QR code is used for attendance verification.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
