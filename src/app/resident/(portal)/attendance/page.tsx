import ResidentAttendanceView from '@/components/resident/attendance-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Attendance',
};

export default function ResidentAttendancePage() {
    return <ResidentAttendanceView />;
}
