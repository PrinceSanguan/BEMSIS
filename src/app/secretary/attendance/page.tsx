import SecretaryAttendanceView from '@/components/secretary/attendance-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Attendance Management - Secretary',
};

export default function SecretaryAttendancePage() {
    return <SecretaryAttendanceView />;
}
