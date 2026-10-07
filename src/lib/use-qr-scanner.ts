'use client';

// Camera QR scanning with the `qr-scanner` package (same library as the original app).
// The library touches `window`, so it is loaded on demand in the browser only.
// Cameras need HTTPS or localhost; pages also offer manual code entry as a fallback.

import type QrScannerType from 'qr-scanner';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useQrScanner(onResult: (text: string) => void) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScannerType | null>(null);
    const onResultRef = useRef(onResult);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    const stop = useCallback(() => {
        scannerRef.current?.stop();
        scannerRef.current?.destroy();
        scannerRef.current = null;
        setScanning(false);
    }, []);

    /** Starts the camera. Render the <video ref={videoRef}> before calling this. */
    const start = useCallback(async () => {
        setError(null);
        setScanning(true);
        // Give React a moment to mount the <video> element (the original waited 100 ms too).
        await new Promise((resolve) => setTimeout(resolve, 100));
        const video = videoRef.current;
        if (!video) {
            setError('Video element not available');
            setScanning(false);
            return;
        }
        try {
            const QrScanner = (await import('qr-scanner')).default;
            if (!(await QrScanner.hasCamera())) throw new Error('No camera found on this device. Enter the code manually instead.');
            const scanner = new QrScanner(
                video,
                (result) => {
                    // Pause after a hit so one code is not processed many times; call resume() to scan again.
                    scanner.pause();
                    onResultRef.current(result.data);
                },
                { returnDetailedScanResult: true, highlightScanRegion: true, highlightCodeOutline: true },
            );
            scannerRef.current = scanner;
            await scanner.start();
        } catch (err) {
            setError(`Camera error: ${err instanceof Error ? err.message : String(err)}`);
            stop();
        }
    }, [stop]);

    const resume = useCallback(() => {
        void scannerRef.current?.start();
    }, []);

    useEffect(() => stop, [stop]);

    return { videoRef, scanning, error, setError, start, stop, resume };
}
