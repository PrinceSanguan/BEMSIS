import ResidentFeedbackView from '@/components/resident/feedback-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Event Feedback',
};

export default function ResidentFeedbackPage() {
    return <ResidentFeedbackView />;
}
