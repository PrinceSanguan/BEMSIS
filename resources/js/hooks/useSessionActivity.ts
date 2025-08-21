import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SessionActivityOptions {
    warningTime?: number; // Show warning X seconds before logout (default: 60)
    checkInterval?: number; // Check interval in milliseconds (default: 30000)
}

export function useSessionActivity(options: SessionActivityOptions = {}) {
    const { warningTime = 60 } = options;
    const { auth } = usePage<SharedData>().props;
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const lastActivityRef = useRef<number>(Date.now());
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Session lifetime in seconds (15 minutes = 900 seconds)
    const sessionLifetime = 900; // Fixed to 15 minutes for session security

    // Clear timers helper
    const clearTimers = useCallback(() => {
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        if (checkTimerRef.current) {
            clearTimeout(checkTimerRef.current);
            checkTimerRef.current = null;
        }
    }, []);

    // Handle session expiration
    const handleSessionExpired = useCallback(() => {
        setShowWarning(false);
        clearTimers();

        router.get(
            route('auth.logout'),
            {},
            {
                onFinish: () => {
                    window.location.href = route('auth.login');
                },
            },
        );
    }, [clearTimers]);

    // Track user activity
    const updateActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setShowWarning(false);

        // Clear existing timers
        clearTimers();

        // Set warning timer
        const warningDelay = (sessionLifetime - warningTime) * 1000;
        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setTimeRemaining(warningTime);
        }, warningDelay);

        // Set check timer
        checkTimerRef.current = setTimeout(() => {
            handleSessionExpired();
        }, sessionLifetime * 1000);
    }, [sessionLifetime, warningTime, clearTimers, handleSessionExpired]);

    // Extend session (user clicked continue)
    const extendSession = useCallback(() => {
        // Make a simple request to update session activity
        router.reload({
            only: ['auth'],
            onSuccess: () => {
                updateActivity();
            },
        });
    }, [updateActivity]);

    // Auto logout (user didn't respond to warning)
    const autoLogout = useCallback(() => {
        handleSessionExpired();
    }, [handleSessionExpired]);

    // Set up activity listeners
    useEffect(() => {
        if (!auth?.user) return;

        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        const throttledUpdateActivity = throttle(updateActivity, 1000);

        // Add event listeners
        activityEvents.forEach((event) => {
            document.addEventListener(event, throttledUpdateActivity, true);
        });

        // Initialize activity tracking
        updateActivity();

        // Cleanup
        return () => {
            activityEvents.forEach((event) => {
                document.removeEventListener(event, throttledUpdateActivity, true);
            });

            clearTimers();
        };
    }, [auth?.user, updateActivity, clearTimers]);

    // Warning countdown timer
    useEffect(() => {
        if (!showWarning) return;

        const countdown = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    autoLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdown);
    }, [showWarning, autoLogout]);

    return {
        showWarning,
        timeRemaining,
        extendSession,
        autoLogout,
    };
}

// Simple throttle function
function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
            func(...args);
            lastExecTime = currentTime;
        } else {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(
                () => {
                    func(...args);
                    lastExecTime = Date.now();
                },
                delay - (currentTime - lastExecTime),
            );
        }
    };
}
