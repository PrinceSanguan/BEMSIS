import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Mail, MapPin, Phone, QrCode, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Purok {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    purok?: Purok;
}

interface Attendee {
    id: number;
    user: User;
    qr_code: string;
    scanned: boolean;
    scanned_at: string;
}

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    has_certificate: boolean;
    image_path?: string;
    creator: User;
    purok?: Purok;
}

interface Props {
    event: Event;
    attendees: Attendee[];
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function EventAttendees({ event, attendees }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const showQRCode = (attendee: Attendee) => {
        if (!attendee.qr_code) {
            alert('No QR code assigned to this attendee');
            return;
        }

        setSelectedAttendee(attendee);

        // Generate QR code URL using GoQR.me API
        const qrCodeUrl =
            'https://api.qrserver.com/v1/create-qr-code/?' +
            new URLSearchParams({
                size: '200x200',
                data: attendee.qr_code,
                color: '000000',
                bgcolor: 'FFFFFF',
                ecc: 'M',
                margin: '10',
            });

        setQrCodeImageUrl(qrCodeUrl);
        setShowQRModal(true);
    };

    const attendedCount = attendees.filter((a) => a.scanned).length;
    const attendanceRate = attendees.length > 0 ? Math.round((attendedCount / attendees.length) * 100) : 0;

    return (
        <>
            <Head title={`Attendees - ${event.title}`} />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.events" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.events" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-7xl space-y-6">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <Button variant="outline" onClick={() => router.get('/secretary/events')} className="shrink-0">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Events
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                                    <p className="text-gray-600">Event Attendees</p>
                                </div>
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

                            {/* Event Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Event Image */}
                                    {event.image_path && (
                                        <div className="mb-4">
                                            <img
                                                src={`/storage/${event.image_path}`}
                                                alt={event.title}
                                                className="h-48 w-full rounded-lg border object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">
                                                {formatDate(event.start_date)}
                                                {event.end_date && ` - ${formatDate(event.end_date)}`}
                                            </span>
                                        </div>
                                        {event.purok && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{event.purok.name}</span>
                                            </div>
                                        )}
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
                                                <div key={attendee.id} className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-3">
                                                            <h3 className="font-medium text-gray-900">{attendee.user.name}</h3>
                                                            <Badge
                                                                className={
                                                                    attendee.scanned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                }
                                                            >
                                                                {attendee.scanned ? 'Attended' : 'Registered'}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-3">
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
                                                        {attendee.scanned && attendee.scanned_at && (
                                                            <div className="mt-2 text-xs text-green-600">
                                                                Attended: {formatDate(attendee.scanned_at)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        {attendee.qr_code && (
                                                            <Button variant="outline" size="sm" onClick={() => showQRCode(attendee)}>
                                                                <QrCode className="mr-2 h-4 w-4" />
                                                                View QR
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>

            {/* QR Code Modal */}
            <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>QR Code for {selectedAttendee?.user.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4">
                        {qrCodeImageUrl && (
                            <div className="rounded-lg border bg-white p-4">
                                <img
                                    src={qrCodeImageUrl}
                                    alt="QR Code"
                                    className="h-48 w-48"
                                    onError={(e) => {
                                        console.error('Failed to load QR code image');
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">QR Code: {selectedAttendee?.qr_code}</p>
                            <p className="mt-2 text-xs text-gray-500">This QR code is used for attendance verification.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
