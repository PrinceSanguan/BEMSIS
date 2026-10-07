const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function nextId(rows: { id: number }[]): number {
    return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

export function randomString(length: number, alphabet = ALPHANUMERIC): string {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    return Array.from(values, (n) => alphabet[n % alphabet.length]).join('');
}

/** Attendance QR payload. The scanner matches it exactly. */
export function attendanceQrCode(eventId: number, userId: number): string {
    return `QR-${eventId}-${userId}-${randomString(8)}`;
}

/** One format for every certificate (the original had three). */
export function certificateCode(): string {
    return `CERT-${randomString(10)}`;
}

export function otpCode(): string {
    return randomString(6, '0123456789');
}
