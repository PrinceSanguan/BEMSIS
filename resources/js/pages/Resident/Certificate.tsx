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
                        {/* Header with Two Logos */}
                        <div className="header-section">
                            <div className="logo-left">
                                <img src="/assets/images/virac-logo.png" alt="Virac Logo" className="header-logo" />
                            </div>
                            <div className="header-text">
                                <p className="gov-header">REPUBLIC OF THE PHILIPPINES</p>
                                <p className="province-header">PROVINCE OF CATANDUANES</p>
                                <p className="municipality-header">MUNICIPALITY OF VIRAC</p>
                                <h1 className="barangay-header">BARANGAY CALATAGAN TIBANG</h1>
                            </div>
                            <div className="logo-right">
                                <img src="/assets/images/barangay-logo.jpg" alt="Barangay Logo" className="header-logo" />
                            </div>
                        </div>

                        {/* Certificate Title */}
                        <h2 className="certificate-title">Certificate of Completion</h2>
                        <p className="certificate-subtitle">This Certificate is Proudly Presented To</p>

                        {/* Recipient Name */}
                        <div className="recipient-section">
                            <div className="recipient-name">({userName.toUpperCase()})</div>
                            <div className="name-underline"></div>
                        </div>

                        {/* Completion Text */}
                        <p className="completion-text">Has Successfully Completed the Community Event</p>

                        {/* Event Title */}
                        <div className="event-title">({eventTitle.toUpperCase()})</div>

                        {/* Bottom Section */}
                        <div className="bottom-section">
                            {/* Left: System Note */}
                            <div className="system-note">
                                <p className="note-italic">This certificate is system-generated and</p>
                                <p className="note-italic">includes authorized e-signatures from</p>
                                <p className="note-italic">Barangay Calatagan Tibang.</p>
                            </div>

                            {/* Center: Signature */}
                            <div className="signature-section">
                                <div className="signature-placeholder">
                                    {/* Signature Image Placeholder */}
                                    <img src="/assets/images/signature.png" alt="Captain's Signature" className="signature-image" />
                                </div>
                                <div className="signature-line"></div>
                                <p className="captain-name">MARISTELA T. UBALDE</p>
                                <p className="captain-title">PUNONG BARANGAY</p>
                            </div>

                            {/* Right: Certificate Info */}
                            <div className="certificate-info">
                                <p className="cert-id">Certificate ID:{certificateCode}</p>
                                <p className="date-issued">
                                    Date Issued: {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .certificate-page {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    font-family: 'Georgia', 'Times New Roman', serif;
                    overflow: hidden;
                }

                .certificate-container {
                    width: 90vw;
                    height: 90vh;
                    max-width: 1200px;
                    max-height: 850px;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .certificate-border {
                    width: 100%;
                    height: 100%;
                    border: 12px solid #0f4c81;
                    box-sizing: border-box;
                    padding: 40px 60px;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .header-section {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .logo-left,
                .logo-right {
                    flex-shrink: 0;
                }

                .header-logo {
                    width: 100px;
                    height: 100px;
                    object-fit: contain;
                }

                .header-text {
                    flex: 1;
                    text-align: center;
                }

                .gov-header,
                .province-header,
                .municipality-header {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #000;
                    letter-spacing: 1px;
                    line-height: 1.4;
                }

                .barangay-header {
                    margin: 5px 0 0 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #000;
                    letter-spacing: 2px;
                }

                .certificate-title {
                    text-align: center;
                    font-size: 38px;
                    font-weight: 700;
                    color: #0f4c81;
                    margin: 15px 0 8px 0;
                    letter-spacing: 2px;
                }

                .certificate-subtitle {
                    text-align: center;
                    font-size: 16px;
                    color: #000;
                    margin: 0 0 20px 0;
                    font-weight: 400;
                }

                .recipient-section {
                    text-align: center;
                    margin: 15px 0;
                }

                .recipient-name {
                    font-size: 36px;
                    font-weight: 700;
                    color: #0f4c81;
                    margin: 0 0 5px 0;
                    font-family: 'Georgia', serif;
                }

                .name-underline {
                    width: 600px;
                    height: 3px;
                    background: #000;
                    margin: 0 auto;
                }

                .completion-text {
                    text-align: center;
                    font-size: 16px;
                    color: #000;
                    margin: 20px 0 15px 0;
                    font-weight: 400;
                }

                .event-title {
                    text-align: center;
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f4c81;
                    margin: 15px 0 20px 0;
                    font-family: 'Georgia', serif;
                }

                .bottom-section {
                    position: absolute;
                    bottom: 30px;
                    left: 60px;
                    right: 60px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 20px;
                }

                .system-note {
                    flex: 1;
                    text-align: left;
                }

                .note-italic {
                    font-size: 11px;
                    color: #000;
                    margin: 2px 0;
                    font-style: italic;
                    line-height: 1.4;
                }

                .signature-section {
                    flex: 1;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    margin-bottom: -20px;
                }

                .signature-placeholder {
                    width: 280px;
                    height: 90px;
                    margin-bottom: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .signature-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    margin-bottom: -50px;
                }

                .signature-line {
                    width: 240px;
                    height: 2px;
                    background: #000;
                    margin: 3px 0;
                }

                .captain-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: #000;
                    margin: 5px 0 2px 0;
                    letter-spacing: 1px;
                }

                .captain-title {
                    font-size: 12px;
                    color: #000;
                    margin: 0;
                    font-weight: 600;
                }

                .certificate-info {
                    flex: 1;
                    text-align: right;
                }

                .cert-id,
                .date-issued {
                    font-size: 11px;
                    color: #000;
                    margin: 2px 0;
                    line-height: 1.4;
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
