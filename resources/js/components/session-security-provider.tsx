import SessionWarningModal from '@/components/session-warning-modal';
import { useSessionActivity } from '@/hooks/useSessionActivity';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function SessionSecurityProvider({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    const { showWarning, timeRemaining, extendSession, autoLogout } = useSessionActivity({
        warningTime: 60, // Show warning 60 seconds before logout
        checkInterval: 30000, // Check every 30 seconds
    });

    // Only render session security for authenticated users
    if (!auth?.user) {
        return <>{children}</>;
    }

    return (
        <>
            {children}
            <SessionWarningModal isOpen={showWarning} timeRemaining={timeRemaining} onExtendSession={extendSession} onLogout={autoLogout} />
        </>
    );
}
