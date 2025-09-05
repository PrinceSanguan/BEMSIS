import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head, router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, MapPin, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmedEvent {
    id: number;
    event: {
        id: number;
        title: string;
        start_date: string;
        end_date?: string;
        purok_names?: string;
    };
    qr_code: string;
    has_qr: boolean;
    scanned?: boolean;
}

interface AttendanceRecord {
    id: number;
    event: {
        title: string;
        start_date: string;
        purok?: { name: string };
    };
    status: 'attended' | 'missed';
    scanned_at?: string;
}

interface Props {
    confirmedEvents: ConfirmedEvent[];
    attendanceHistory: AttendanceRecord[];
}

export default function Attendance({ confirmedEvents, attendanceHistory }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ConfirmedEvent | null>(null);
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh functionality
    const refreshAttendance = () => {
        setIsRefreshing(true);
        router.visit(route('resident.attendance'), {
            preserveState: false,
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false),
        });
    };

    // Auto-refresh every 30 seconds to check for scan updates
    useEffect(() => {
        const interval = setInterval(refreshAttendance, 30000);
        return () => clearInterval(interval);
    }, []);

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

    const showQRCode = async (eventData: ConfirmedEvent) => {
        setSelectedEvent(eventData);

        try {
            const response = await fetch(route('resident.attendance.qr', eventData.id));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.qr_image_url) {
                setQrCodeImageUrl(data.qr_image_url);
                setShowQRModal(true);
            } else {
                throw new Error('No QR code data received');
            }
        } catch (error: unknown) {
            console.error('Error fetching QR code:', error);
            alert(`Error loading QR code: ${(error as Error).message}. Please try again.`);
        }
    };

    return (
        <>
            <Head title="My Attendance" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="resident.attendance" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="resident.attendance" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <div className="mx-auto max-w-4xl space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                                    <p className="text-gray-600">Track your event attendance and generate QR codes.</p>
                                </div>
                                <Button variant="outline" onClick={refreshAttendance} disabled={isRefreshing} className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                </Button>
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
                                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
                                                        Confirmed
                                                    </span>
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
                                                    {eventData.scanned ? (
                                                        <div className="flex items-center gap-2 rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Already Scanned
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" className="gap-2" onClick={() => showQRCode(eventData)}>
                                                            <QrCode className="h-4 w-4" />
                                                            Generate QR Code
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
                                                        <p className="text-gray-600">{record.event.purok?.name || 'All Puroks'}</p>
                                                    </div>
                                                    {record.scanned_at && (
                                                        <div>
                                                            <p className="font-medium text-gray-700">Scanned At</p>
                                                            <p className="text-gray-600">{new Date(record.scanned_at).toLocaleTimeString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </main>
                </div>

                {/* QR Code Modal */}
                <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>QR Code for {selectedEvent?.event.title}</DialogTitle>
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
                            <p className="text-center text-sm text-gray-600">Show this QR code to the event organizer for attendance verification.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
