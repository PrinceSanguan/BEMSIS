import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, QrCode, Scan, Users } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockAttendanceRecords = [
    {
        id: 1,
        eventName: 'Community Clean-up Drive',
        date: '2025-08-20',
        totalAttendees: 25,
        scannedAttendees: 23,
        status: 'active',
    },
    {
        id: 2,
        eventName: 'Basketball Tournament',
        date: '2025-08-25',
        totalAttendees: 50,
        scannedAttendees: 0,
        status: 'upcoming',
    },
    {
        id: 3,
        eventName: 'Health Seminar',
        date: '2025-08-15',
        totalAttendees: 35,
        scannedAttendees: 35,
        status: 'completed',
    },
];

const mockScannedUsers = [
    { name: 'Juan Dela Cruz', time: '09:15 AM', purok: 'Purok 1' },
    { name: 'Maria Santos', time: '09:20 AM', purok: 'Purok 2' },
    { name: 'Pedro Garcia', time: '09:25 AM', purok: 'Purok 3' },
];

export default function Attendance() {
    const [attendanceRecords] = useState(mockAttendanceRecords);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [showQR, setShowQR] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const generateQRCode = (eventId: number) => {
        // Mock QR code generation
        setShowQR(true);
        setSelectedEvent(attendanceRecords.find((e) => e.id === eventId));
    };

    const startScanning = () => {
        setIsScanning(true);
        // Mock scanning process
        setTimeout(() => {
            setIsScanning(false);
            alert('QR Code scanned successfully!');
        }, 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <>
            <Head title="Attendance Management" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.attendance" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.attendance" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Secretary" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
                                <p className="text-gray-600">QR code scanning and attendance tracking</p>
                            </div>

                            <Button onClick={startScanning} className="gap-2" disabled={isScanning}>
                                <Scan className="h-4 w-4" />
                                {isScanning ? 'Scanning...' : 'Start QR Scanner'}
                            </Button>
                        </div>

                        <div className="grid gap-4 md:gap-6">
                            {attendanceRecords.map((record) => (
                                <Card key={record.id} className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <CardTitle className="text-lg">{record.eventName}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(record.status)}`}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span>{record.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-500" />
                                                <span>
                                                    {record.scannedAttendees}/{record.totalAttendees} attended
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span>{record.status === 'completed' ? 'Completed' : 'In Progress'}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" variant="outline" onClick={() => generateQRCode(record.id)} className="gap-2">
                                                <QrCode className="h-4 w-4" />
                                                Generate QR
                                            </Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        View Records
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Attendance Records - {record.eventName}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="max-h-64 space-y-2 overflow-y-auto">
                                                        {mockScannedUsers.map((user, index) => (
                                                            <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                                                                <div>
                                                                    <p className="font-medium">{user.name}</p>
                                                                    <p className="text-sm text-gray-600">{user.purok}</p>
                                                                </div>
                                                                <span className="text-sm text-gray-500">{user.time}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* QR Code Dialog */}
                        <Dialog open={showQR} onOpenChange={setShowQR}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>QR Code - {selectedEvent?.eventName}</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="flex h-48 w-48 items-center justify-center border-2 border-dashed border-gray-300 bg-gray-100">
                                        <QrCode className="h-16 w-16 text-gray-400" />
                                    </div>
                                    <p className="text-center text-sm text-gray-600">Show this QR code to attendees for scanning</p>
                                    <Button onClick={() => setShowQR(false)} className="w-full">
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
