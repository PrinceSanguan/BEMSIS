'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ensureQrCode } from '@/lib/demo/actions';
import { flash } from '@/lib/demo/flash';
import { useCurrentUser, useDb } from '@/lib/demo/store';
import { useNow } from '@/lib/hooks';
import { residentAttendanceProps, type ResidentAttendanceProps } from '@/lib/views/resident';
import { Calendar, Check, CheckCircle, Clock, Copy, MapPin, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';

type ConfirmedEvent = ResidentAttendanceProps['confirmedEvents'][number];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'attended':
            return 'bg-green-100 text-green-800';
        case 'missed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-blue-100 text-blue-800';
    }
};

export default function ResidentAttendanceView() {
    const db = useDb();
    const user = useCurrentUser()!;
    const now = useNow();
    const { confirmedEvents, attendanceHistory } = useMemo(() => residentAttendanceProps(db, user, now), [db, user, now]);

    const [selectedEvent, setSelectedEvent] = useState<ConfirmedEvent | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const showQRCode = (eventData: ConfirmedEvent) => {
        setSelectedEvent(eventData);
        const result = ensureQrCode(eventData.id);
        if (!result.ok) {
            if (result.errors.error) flash('error', `Error loading QR code: ${result.errors.error}. Please try again.`);
            return;
        }
        setQrCode(result.data.qr_code);
        setCopied(false);
        setShowQRModal(true);
    };

    const copyCode = async () => {
        if (!qrCode) return;
        try {
            await navigator.clipboard.writeText(qrCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            flash('error', 'Could not copy the code. Select it and copy it manually.');
        }
    };

    return (
        <>
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                        <p className="text-gray-600">Track your event attendance and generate QR codes.</p>
                    </div>
                </div>

                <Tabs defaultValue="confirmed" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="confirmed">Confirmed Events</TabsTrigger>
                        <TabsTrigger value="history">Attendance History</TabsTrigger>
                    </TabsList>

                    {/* Confirmed Events */}
                    <TabsContent value="confirmed" className="space-y-4">
                        {confirmedEvents.map((eventData) => (
                            <Card key={eventData.id} className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between text-lg">
                                        {eventData.event.title}
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">Confirmed</span>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(eventData.event.start_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {new Date(eventData.event.start_date).toLocaleTimeString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {eventData.event.purok_names || 'All Puroks'}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {eventData.time_in && eventData.time_out ? (
                                            <div className="flex flex-col gap-2">
                                                <Badge className="bg-green-100 text-green-800">✅ Fully Attended</Badge>
                                                <span className="text-xs text-gray-600">
                                                    Time-In: {eventData.time_in_label} | Time-Out: {eventData.time_out_label}
                                                </span>
                                            </div>
                                        ) : eventData.time_in ? (
                                            <div className="flex flex-col gap-2">
                                                <Badge className="bg-blue-100 text-blue-800">⏰ Time-In Recorded - Awaiting Time-Out</Badge>
                                                <Button size="sm" className="gap-2" onClick={() => showQRCode(eventData)}>
                                                    <QrCode className="h-4 w-4" />
                                                    Scan for Time-Out
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" className="gap-2" onClick={() => showQRCode(eventData)}>
                                                <QrCode className="h-4 w-4" />
                                                Scan for Time-In
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Attendance History */}
                    <TabsContent value="history" className="space-y-4">
                        {attendanceHistory.map((record) => (
                            <Card key={record.id} className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{record.event.title}</CardTitle>
                                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(record.status)}`}>
                                            {record.status === 'attended' ? (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Attended
                                                </div>
                                            ) : (
                                                'Missed'
                                            )}
                                        </span>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <p className="font-medium text-gray-700">Date</p>
                                            <p className="text-gray-600">{new Date(record.event.start_date).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-700">Location</p>
                                            <p className="text-gray-600">{record.event.purok_names || 'All Puroks'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>

            {/* QR Code Modal */}
            <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code for {selectedEvent?.event.title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4">
                        {qrCode && (
                            <>
                                <div className="rounded-lg border bg-white p-4">
                                    <QRCodeSVG value={qrCode} size={192} marginSize={2} title="QR Code" />
                                </div>
                                <div className="flex w-full flex-col items-center gap-2">
                                    <code className="rounded-md bg-gray-100 px-3 py-1.5 font-mono text-sm break-all text-gray-800 select-all">
                                        {qrCode}
                                    </code>
                                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={copyCode}>
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy code'}
                                    </Button>
                                </div>
                            </>
                        )}
                        <p className="text-center text-sm text-gray-600">Show this QR code to the event organizer for attendance verification.</p>
                        <p className="text-center text-xs text-gray-500">
                            Demo tip: the Secretary can paste this code in Attendance → &quot;Enter code manually&quot; instead of scanning it.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
