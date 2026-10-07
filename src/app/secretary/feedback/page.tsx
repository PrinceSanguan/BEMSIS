import SecretaryFeedbackView from '@/components/secretary/feedback-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Feedback Review',
};

export default function SecretaryFeedbackPage() {
    return <SecretaryFeedbackView />;
}
