import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/pages/Resident/Header';
import Sidebar from '@/pages/Resident/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, MapPin, QrCode } from 'lucide-react';
import { useState } from 'react';

// Mock data
const confirmedEvents = [
    {
        id: 1,
        title: 'Community Clean-up Drive',
        date: '2025-08-20',
        time: '8:00 AM - 12:00 PM',
        location: 'Purok 1',
        status: 'upcoming',
        hasQR: true,
    },
    {
        id: 2,
        title: 'Health Seminar',
        date: '2025-08-25',
        time: '2:00 PM - 5:00 PM',
        location: 'Community Hall',
        status: 'upcoming',
        hasQR: true,
    },
];

const attendanceHistory = [
    {
        id: 1,
        title: 'Skills Workshop',
        date: '2025-08-10',
        location: 'Training Center',
        status: 'attended',
        checkIn: '2:00 PM',
        checkOut: '5:30 PM',
    },
    {
        id: 2,
        title: 'Community Meeting',
        date: '2025-08-05',
        location: 'Barangay Hall',
        status: 'attended',
        checkIn: '7:00 PM',
        checkOut: '9:15 PM',
    },
    {
        id: 3,
        title: 'Tree Planting Activity',
        date: '2025-07-28',
        location: 'Park Area',
        status: 'missed',
        checkIn: null,
        checkOut: null,
    },
];

export default function Attendance() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

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

    const showQRCode = (event: any) => {
        setSelectedEvent(event);
    };

    return (
        <>
            <Head title="Attendance Tracking" />
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
                    <Header userName="Juan Dela Cruz" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Attendance Tracking</h2>
                            <p className="text-gray-600">Manage your event attendance and QR codes</p>
                        </div>

                        <Tabs defaultValue="confirmed" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="confirmed">Confirmed Events</TabsTrigger>
                                <TabsTrigger value="qrcodes">My QR Codes</TabsTrigger>
                                <TabsTrigger value="history">Attendance History</TabsTrigger>
                            </TabsList>

                            {/* Confirmed Events */}
                            <TabsContent value="confirmed" className="space-y-4">
                                {confirmedEvents.map((event) => (
                                    <Card key={event.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center justify-between text-lg">
                                                {event.title}
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                                                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                                </span>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 sm:grid-cols-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {event.date}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {event.time}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" onClick={() => showQRCode(event)} className="gap-2">
                                                    <QrCode className="h-4 w-4" />
                                                    Show QR Code
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>

                            {/* My QR Codes */}
                            <TabsContent value="qrcodes" className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {confirmedEvents
                                        .filter((event) => event.hasQR)
                                        .map((event) => (
                                            <Card key={event.id} className="shadow-sm">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base">{event.title}</CardTitle>
                                                </CardHeader>

                                                <CardContent className="space-y-4">
                                                    <div className="flex justify-center">
                                                        <div className="flex h-32 w-32 items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100">
                                                            <QrCode className="h-12 w-12 text-gray-400" />
                                                        </div>
                                                    </div>

                                                    <div className="text-center text-sm text-gray-600">
                                                        <p>{event.date}</p>
                                                        <p>{event.location}</p>
                                                    </div>

                                                    <Button size="sm" className="w-full" onClick={() => showQRCode(event)}>
                                                        View Full QR Code
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            </TabsContent>

                            {/* Attendance History */}
                            <TabsContent value="history" className="space-y-4">
                                {attendanceHistory.map((record) => (
                                    <Card key={record.id} className="shadow-sm">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{record.title}</CardTitle>
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
                                            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                                <div>
                                                    <p className="font-medium text-gray-700">Date</p>
                                                    <p className="text-gray-600">{record.date}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Location</p>
                                                    <p className="text-gray-600">{record.location}</p>
                                                </div>
                                                {record.checkIn && (
                                                    <>
                                                        <div>
                                                            <p className="font-medium text-gray-700">Check In</p>
                                                            <p className="text-gray-600">{record.checkIn}</p>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-700">Check Out</p>
                                                            <p className="text-gray-600">{record.checkOut}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </TabsContent>
                        </Tabs>

                        {/* QR Code Dialog */}
                        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>QR Code - {selectedEvent?.title}</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="flex h-48 w-48 items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100">
                                        <QrCode className="h-16 w-16 text-gray-400" />
                                    </div>
                                    <div className="text-center text-sm text-gray-600">
                                        <p className="font-medium">{selectedEvent?.date}</p>
                                        <p>{selectedEvent?.location}</p>
                                        <p className="mt-2">Show this QR code for attendance check-in</p>
                                    </div>
                                    <Button onClick={() => setSelectedEvent(null)} className="w-full">
                                        Close
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </main>
                </div>
            </div>
        </>
    );
}
