import { ImageResponse } from 'next/og';

export const alt = 'BEMSIS — Barangay Event Management & Information System';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '80px',
                background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 55%, #4F46E5 100%)',
                color: 'white',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                <div
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '24px',
                        background: '#4F46E5',
                        border: '4px solid rgba(255,255,255,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="76" height="76" viewBox="0 0 24 24">
                        <path d="M2 10L12 2L22 10Z" fill="white" />
                        <rect x="3" y="10" width="18" height="1.5" fill="white" />
                        <rect x="4" y="11.5" width="2" height="6" fill="white" />
                        <rect x="9" y="11.5" width="2" height="6" fill="white" />
                        <rect x="13" y="11.5" width="2" height="6" fill="white" />
                        <rect x="18" y="11.5" width="2" height="6" fill="white" />
                        <rect x="3" y="17.5" width="18" height="1" fill="white" />
                        <rect x="2" y="18.5" width="20" height="1.25" fill="white" />
                        <rect x="1" y="19.75" width="22" height="1.25" fill="white" />
                    </svg>
                </div>
                <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: '-2px' }}>BEMSIS</div>
            </div>
            <div style={{ marginTop: '36px', fontSize: 44, fontWeight: 700, maxWidth: '980px', lineHeight: 1.2 }}>
                Barangay Event Management &amp; Information System
            </div>
            <div style={{ marginTop: '24px', fontSize: 30, color: '#C7D2FE' }}>Event approvals · QR attendance · Certificates · Announcements</div>
        </div>,
        { ...size },
    );
}
