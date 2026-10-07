'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { clearStaleFlash, dismissFlash, useFlashMessages, type FlashType } from '@/lib/demo/flash';
import { cn } from '@/lib/utils';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const styles: Record<FlashType, { className: string; icon: typeof Info }> = {
    success: { className: 'border-green-200 bg-green-50 text-green-800', icon: CheckCircle2 },
    error: { className: 'border-red-200 bg-red-50 text-red-800', icon: XCircle },
    info: { className: 'border-blue-200 bg-blue-50 text-blue-800', icon: Info },
};

/** Shows the latest action messages at the top of admin pages. */
export function FlashAlerts({ className }: { className?: string }) {
    const messages = useFlashMessages();
    const pathname = usePathname();

    // A message survives the redirect that follows an action, then clears on the next navigation.
    useEffect(() => {
        clearStaleFlash(4000);
    }, [pathname]);

    useEffect(() => {
        const timers = messages.filter((m) => m.type !== 'error').map((m) => setTimeout(() => dismissFlash(m.id), 6000));
        return () => timers.forEach(clearTimeout);
    }, [messages]);

    return (
        <div aria-live="polite" className={cn('space-y-2 empty:hidden', className)}>
            {messages.map((message) => {
                const { className: tone, icon: Icon } = styles[message.type];
                return (
                    <Alert key={message.id} className={cn('pr-10', tone)}>
                        <Icon className="h-4 w-4" />
                        <AlertDescription className="text-current">{message.message}</AlertDescription>
                        <button
                            type="button"
                            onClick={() => dismissFlash(message.id)}
                            className="absolute top-2.5 right-2.5 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
                            aria-label="Dismiss message"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </Alert>
                );
            })}
        </div>
    );
}
