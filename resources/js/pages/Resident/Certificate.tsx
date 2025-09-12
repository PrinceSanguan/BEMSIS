import { Head } from '@inertiajs/react';
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
            }, 1000);
        }
    }, [autoDownload, hasAutoDownloaded]);

    return (
        <>
            <Head title={`Certificate - ${eventTitle}`} />

            <div className="certificate-page">
                <div className="certificate-container">
                    <div className="certificate-border">
                        {/* Barangay Logo - Top Center */}
                        <div className="header-section">
                            <img src="/assets/images/Bemsis.jpg" alt="Barangay Logo" className="barangay-logo" />
                            <h1 className="system-title">BARANGAY EVENT MANAGEMENT SYSTEM</h1>
                            <h2 className="certificate-title">CERTIFICATE OF COMPLETION</h2>
                        </div>

                        {/* Main Content */}
                        <div className="content-section">
                            <p className="certify-text">This is to certify that</p>

                            <div className="recipient-name">{userName}</div>
                            <div className="name-underline"></div>

                            <p className="completion-text">has successfully completed the community event</p>

                            <div className="event-name">"{eventTitle}"</div>
                        </div>

                        {/* Signature Area - Bottom Left */}
                        <div className="signature-section">
                            <div className="signature-placeholder">
                                {/* Signature Image Placeholder */}
                                <img src="/assets/images/signature.jpg" alt="Captain's Signature" className="signature-image" />
                            </div>
                            <div className="signature-line"></div>
                            <p className="captain-name">Captain Maria Santos</p>
                            <p className="captain-title">Barangay Captain</p>
                        </div>

                        {/* Certificate Details */}
                        <div className="certificate-footer">
                            <div className="cert-id">Certificate ID: {certificateCode}</div>
                            <div className="date-issued">Date Issued: {new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .certificate-page {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 20px;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    font-family: 'Georgia', 'Times New Roman', serif;
                }

                .certificate-container {
                    width: 297mm;
                    height: 210mm;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .certificate-border {
                    width: 100%;
                    height: 100%;
                    border: 8px solid #1e40af;
                    box-sizing: border-box;
                    padding: 60px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 60px;
                }

                .barangay-logo {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
                    border-radius: 50%;
                    border: 3px solid #1e40af;
                    margin: 0 auto 30px auto;
                    display: block;
                }

                .system-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 20px 0;
                    letter-spacing: 1px;
                }

                .certificate-title {
                    font-size: 32px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0;
                    letter-spacing: 2px;
                }

                .content-section {
                    text-align: center;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 30px;
                }

                .certify-text,
                .completion-text {
                    font-size: 20px;
                    color: #374151;
                    margin: 0;
                    font-weight: 400;
                }

                .recipient-name {
                    font-size: 48px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 20px 0 10px 0;
                    font-family: 'Georgia', serif;
                }

                .name-underline {
                    width: 400px;
                    height: 2px;
                    background: #1e40af;
                    margin: 0 auto 20px auto;
                }

                .event-name {
                    font-size: 32px;
                    font-weight: 600;
                    color: #1d4ed8;
                    margin: 20px 0;
                    font-style: italic;
                }

                .signature-section {
                    position: absolute;
                    bottom: 80px;
                    left: 60px;
                    text-align: center;
                    width: 220px;
                }

                .signature-placeholder {
                    width: 200px;
                    height: 70px;
                    margin: 0 auto 10px auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                }

                .signature-image {
                    max-width: 180px;
                    max-height: 60px;
                    object-fit: contain;
                }

                .signature-line {
                    width: 200px;
                    height: 1px;
                    background: #374151;
                    margin: 0 auto 15px auto;
                }

                .captain-name {
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e40af;
                    margin: 0 0 5px 0;
                }

                .captain-title {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                    font-weight: 600;
                }

                .certificate-footer {
                    position: absolute;
                    bottom: 30px;
                    right: 60px;
                    text-align: right;
                    font-size: 12px;
                    color: #6b7280;
                }

                .cert-id,
                .date-issued {
                    margin: 5px 0;
                }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                    }

                    .certificate-page {
                        width: 297mm;
                        height: 210mm;
                        padding: 0;
                        background: white;
                        margin: 0;
                    }

                    .certificate-container {
                        width: 100%;
                        height: 100%;
                        box-shadow: none;
                        border-radius: 0;
                    }

                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                }

                @media screen and (max-width: 1200px) {
                    .certificate-page {
                        padding: 10px;
                    }

                    .certificate-container {
                        transform: scale(0.8);
                        transform-origin: center;
                    }
                }

                @media screen and (max-width: 768px) {
                    .certificate-container {
                        transform: scale(0.6);
                    }
                }
            `}</style>
        </>
    );
}
