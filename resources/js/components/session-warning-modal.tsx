import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface SessionWarningModalProps {
    isOpen: boolean;
    timeRemaining: number;
    onExtendSession: () => void;
    onLogout: () => void;
}

export default function SessionWarningModal({ isOpen, timeRemaining, onExtendSession, onLogout }: SessionWarningModalProps) {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `${secs} seconds`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <DialogTitle className="text-lg font-semibold">Session Expiring Soon</DialogTitle>
                    <DialogDescription className="text-center">
                        Your session will expire in <span className="font-semibold text-red-600">{formatTime(timeRemaining)}</span> due to inactivity.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button onClick={onExtendSession} className="w-full sm:w-auto" size="sm">
                        Stay Logged In
                    </Button>
                    <Button onClick={onLogout} variant="outline" className="w-full sm:w-auto" size="sm">
                        Log Out Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
