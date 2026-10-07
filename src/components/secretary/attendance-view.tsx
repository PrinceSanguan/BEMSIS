'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { scanQrCode } from '@/lib/demo/actions';
import { useDb } from '@/lib/demo/store';
import { route } from '@/lib/routes';
import { useQrScanner } from '@/lib/use-qr-scanner';
import { secretaryAttendanceProps } from '@/lib/views/secretary-operations';
import { BarChart3, Calendar, CheckCircle, Clock, Eye, Keyboard, Scan, TrendingDown, TrendingUp, UserCheck, Users, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

const SUCCESS_MESSAGE = 'Congratulations, attendance recorded successfully!';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
};

const getAttendanceBadge = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
};

const scanErrorMessage = (errors: Record<string, string>) => errors.message ?? errors.qr_code ?? 'Invalid QR code';

export default function SecretaryAttendanceView() {
    const db = useDb();
    const { events } = useMemo(() => secretaryAttendanceProps(db), [db]);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [manualQrCode, setManualQrCode] = useState('');

    // useQrScanner (below) owns stop/resume; the result handler reaches them through this ref.
    const scannerControls = useRef<{ stop: () => void; resume: () => void } | null>(null);

    // The scanner pauses itself after each hit; resume it after an error so the next code can be read.
    const handleScannedQR = (qrCode: string) => {
        const result = scanQrCode(qrCode);
        if (result.ok) {
            setScanResult({ success: true, message: SUCCESS_MESSAGE });
            setTimeout(() => {
                setScanResult(null);
                setIsScannerOpen(false);
                scannerControls.current?.stop();
            }, 2000);
        } else {
            setScanError(scanErrorMessage(result.errors));
            setTimeout(() => {
                setScanError(null);
                scannerControls.current?.resume();
            }, 2000);
        }
    };

    const {
        videoRef,
        scanning: isScanning,
        error: cameraError,
        setError: setCameraError,
        start: startScanning,
        stop: stopScanning,
        resume,
    } = useQrScanner(handleScannedQR);

    useEffect(() => {
        scannerControls.current = { stop: stopScanning, resume };
    }, [stopScanning, resume]);

    const handleManualScan = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!manualQrCode.trim()) return;

        const result = scanQrCode(manualQrCode);
        if (result.ok) {
            setScanResult({ success: true, message: SUCCESS_MESSAGE });
            setManualQrCode('');
            setTimeout(() => {
                setScanResult(null);
                setIsScannerOpen(false);
                stopScanning();
            }, 2000);
        } else {
            setScanError(scanErrorMessage(result.errors));
            setTimeout(() => setScanError(null), 3000);
        }
    };

    // Calculate overall statistics
    const totalEvents = events.length;
    const totalConfirmed = events.reduce((sum, event) => sum + event.total_confirmed, 0);
    const totalScanned = events.reduce((sum, event) => sum + event.total_scanned, 0);
    const overallAttendanceRate = totalConfirmed > 0 ? Math.round((totalScanned / totalConfirmed) * 100) : 0;

    const dialogError = scanError ?? cameraError;

    const manualEntry = (inputId: string) => (
        <form onSubmit={handleManualScan} className="space-y-2">
            <Label htmlFor={inputId}>Enter code manually</Label>
            <div className="flex gap-2">
                <Input
                    id={inputId}
                    value={manualQrCode}
                    onChange={(e) => setManualQrCode(e.target.value)}
                    placeholder="QR-1-5-ABCD1234"
                    autoComplete="off"
                    className="font-mono"
                />
                <Button type="submit" disabled={!manualQrCode.trim()} className="shrink-0 gap-2">
                    <UserCheck className="h-4 w-4" />
                    Record
                </Button>
            </div>
            <p className="text-xs text-gray-500">
                Tip: open the Resident&apos;s Attendance page in another tab and copy their code. The first entry records Time-In, the second
                Time-Out.
            </p>
        </form>
    );

    return (
        <>
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
                        <p className="mt-2 text-gray-600">Monitor and manage event attendance records</p>
                    </div>
                    <Button onClick={() => setIsScannerOpen(true)} className="gap-2">
                        <Scan className="h-4 w-4" />
                        Scan Barcode
                    </Button>
                </div>

                {/* Manual code entry (for visitors without a camera) */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Keyboard className="h-5 w-5" />
                            No camera? Record attendance by code
                        </CardTitle>
                    </CardHeader>
                    <CardContent>{manualEntry('manual_qr_code')}</CardContent>
                </Card>

                {/* Overall Statistics */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Confirmed</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalConfirmed}</p>
                                </div>
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Attended</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalScanned}</p>
                                </div>
                                <UserCheck className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Overall Rate</p>
                                    <p className={`text-2xl font-bold ${getAttendanceColor(overallAttendanceRate)}`}>{overallAttendanceRate}%</p>
                                </div>
                                <div className="flex items-center">
                                    {overallAttendanceRate >= 70 ? (
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                    ) : (
                                        <TrendingDown className="h-8 w-8 text-red-600" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Events Attendance List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Event Attendance Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {events.length === 0 ? (
                            <div className="py-12 text-center">
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No events found</h3>
                                <p className="text-gray-600">No events available for attendance tracking.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <div key={event.id} className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                                    <Badge variant="outline" className={getAttendanceBadge(event.attendance_rate)}>
                                                        {event.attendance_rate}% attendance
                                                    </Badge>
                                                    {event.has_certificate && (
                                                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                                                            Certificate Event
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600">{event.description}</p>

                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{formatDate(event.start_date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        <span>{event.total_confirmed} confirmed</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck className="h-4 w-4" />
                                                        <span>{event.total_scanned} attended</span>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    Created by: {event.creator?.name ?? 'Unknown'} • {formatDate(event.created_at)}
                                                </div>
                                            </div>

                                            <div className="flex min-w-[140px] flex-col gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('secretary.events.attendees', event.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </Button>

                                                {/* Attendance Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-gray-600">
                                                        <span>Attendance</span>
                                                        <span>{event.attendance_rate}%</span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                event.attendance_rate >= 80
                                                                    ? 'bg-green-500'
                                                                    : event.attendance_rate >= 60
                                                                      ? 'bg-yellow-500'
                                                                      : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${event.attendance_rate}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* QR Scanner Dialog */}
            <Dialog
                open={isScannerOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        stopScanning();
                        setScanError(null);
                        setCameraError(null);
                        setScanResult(null);
                    }
                    setIsScannerOpen(open);
                }}
            >
                <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>QR Code Scanner</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {dialogError && (
                            <Alert className="border-red-200 bg-red-50">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">{dialogError}</AlertDescription>
                            </Alert>
                        )}

                        {scanResult && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">{scanResult.message}</AlertDescription>
                            </Alert>
                        )}

                        {!isScanning ? (
                            <div className="py-8 text-center">
                                <Scan className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <Button onClick={startScanning} size="lg">
                                    Start Scan
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative overflow-hidden rounded-lg bg-black">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full bg-black object-cover"
                                        style={{ minHeight: '300px', maxHeight: '400px' }}
                                    >
                                        Video stream not available.
                                    </video>

                                    {/* Simple scanning indicator */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-pulse rounded-full bg-blue-500/90 px-4 py-2 text-sm font-medium text-white">
                                        Point camera at QR code
                                    </div>
                                </div>

                                <Button variant="destructive" onClick={stopScanning} className="w-full">
                                    Stop Scanning
                                </Button>
                            </div>
                        )}

                        <div className="border-t pt-4">{manualEntry('dialog_manual_qr_code')}</div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
