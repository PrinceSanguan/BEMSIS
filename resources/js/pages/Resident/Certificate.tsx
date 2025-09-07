import { Card, CardContent } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventDuration: string;
    certificateCode: string;
    autoDownload?: boolean;
}

export default function Certificate({ userName, eventTitle, eventDate, eventDuration, certificateCode, autoDownload }: Props) {
    const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);

    // Auto-download when accessed via QR code
    React.useEffect(() => {
        if (autoDownload && !hasAutoDownloaded) {
            setTimeout(() => {
                window.print();
                setHasAutoDownloaded(true);
            }, 1000); // Small delay to ensure page is fully loaded
        }
    }, [autoDownload, hasAutoDownloaded]);

    return (
        <>
            <Head title={`Certificate - ${eventTitle}`} />
            <div className="min-h-screen bg-gray-50 p-4 md:p-6">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* Header - Hidden in Print */}
                    <div className="text-center print:hidden">
                        <h1 className="text-2xl font-bold text-gray-900">Certificate of Completion</h1>
                        <p className="text-gray-600">Your achievement certificate</p>
                        {autoDownload && <p className="mt-2 text-sm text-blue-600">Certificate will download automatically...</p>}
                    </div>

                    {/* Certificate - Landscape Layout */}
                    <Card className="certificate-container bg-gradient-to-br from-blue-50 to-indigo-100 print:bg-white print:shadow-none">
                        <CardContent className="p-0">
                            <div className="certificate-content aspect-[4/3] w-full bg-white p-8 md:p-12 lg:p-16">
                                {/* Certificate Border */}
                                <div className="relative h-full w-full rounded-lg border-8 border-double border-blue-600 bg-gradient-to-br from-blue-50 to-white p-8 md:p-12">
                                    {/* Header with Logo */}
                                    <div className="mb-8 text-center">
                                        <div className="mb-6 flex items-center justify-center gap-4">
                                            {/* Barangay Logo */}
                                            <img
                                                src="/assets/images/Bemsis.jpg"
                                                alt="Barangay Logo"
                                                className="h-20 w-20 object-contain md:h-24 md:w-24"
                                            />
                                            {/* Award Icon */}
                                            <Award className="h-16 w-16 text-yellow-500 md:h-20 md:w-20" />
                                        </div>

                                        <div className="space-y-2">
                                            <h1 className="text-xl font-bold text-blue-800 md:text-2xl lg:text-3xl">
                                                BARANGAY EVENT MANAGEMENT SYSTEM
                                            </h1>
                                            <h2 className="text-2xl font-bold text-blue-800 md:text-3xl lg:text-4xl">Certificate of Completion</h2>
                                        </div>
                                        <div className="mx-auto mt-4 h-1 w-32 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-6 text-center md:space-y-8">
                                        <p className="text-lg text-gray-700 md:text-xl">This is to certify that</p>

                                        <div className="mx-auto max-w-md border-b-2 border-blue-600 pb-2">
                                            <h3 className="text-2xl font-bold text-blue-800 md:text-3xl lg:text-4xl">{userName}</h3>
                                        </div>

                                        <p className="text-lg text-gray-700 md:text-xl">has successfully completed the community event</p>

                                        <div className="mx-auto max-w-2xl">
                                            <h4 className="text-xl font-semibold text-blue-700 md:text-2xl lg:text-3xl">"{eventTitle}"</h4>
                                        </div>

                                        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-8">
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">Date</p>
                                                <p className="text-lg font-semibold text-blue-700">{eventDate}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">Duration</p>
                                                <p className="text-lg font-semibold text-blue-700">{eventDuration}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="absolute right-8 bottom-8 left-8 flex items-end justify-between">
                                        <div className="text-left">
                                            <div className="mb-2 flex flex-col items-center">
                                                <div className="font-script mb-1 text-lg text-blue-800" style={{ fontFamily: 'cursive' }}>
                                                    Captain Maria Santos
                                                </div>
                                                <div className="h-px w-32 bg-gray-400"></div>
                                            </div>
                                            <p className="text-sm font-medium text-gray-600">Barangay Captain</p>
                                            <p className="text-xs text-gray-500">Authorized Signature</p>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Certificate ID: {certificateCode}</p>
                                            <p className="text-xs text-gray-500">Issued: {new Date().toLocaleDateString()}</p>
                                            <p className="mt-1 text-xs text-gray-500">This certificate is digitally verified</p>
                                        </div>

                                        <div className="text-right">
                                            <div className="mb-2 h-px w-32 bg-gray-400"></div>
                                            <p className="text-sm font-medium text-gray-600">Date Issued</p>
                                            <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-container,
                    .certificate-container * {
                        visibility: visible;
                    }
                    .certificate-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:bg-white {
                        background: white !important;
                    }
                   @page {
                        size: landscape;
                        margin: 0.5in;
                    }
                    .certificate-content {
                        padding: 2rem !important;
                    }
                    .font-script {
                        font-family: 'Brush Script MT', cursive;
                    }
                }
            `}
            </style>
        </>
    );
}
