'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyOtp } from '@/lib/demo/actions';
import { clearStaleFlash, flash as flashMessage, useFlash } from '@/lib/demo/flash';
import { useDb, useHydrated } from '@/lib/demo/store';
import { formatDateTime, toDate } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { route, withQuery } from '@/lib/routes';
import { useForm } from '@/lib/use-form';
import { demoOtpFor } from '@/lib/views/auth';
import { ArrowLeft, Inbox, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo } from 'react';

export default function VerifyOtpView() {
    const router = useRouter();
    const email = useSearchParams().get('email') ?? '';
    const hydrated = useHydrated();
    const db = useDb();
    const now = useNow(10_000);
    const flash = useFlash();
    const { data, setData, submit, processing, errors } = useForm({
        otp: '',
    });

    // ForgotPasswordController@showVerifyOtp: no email means the reset flow was not started.
    useEffect(() => {
        if (email) {
            clearStaleFlash(15_000);
            return;
        }
        flashMessage('error', 'Session expired. Please start again.');
        router.replace(route('auth.forgot-password'));
    }, [email, router]);

    const demoToken = useMemo(() => (hydrated && email ? demoOtpFor(db, email) : null), [hydrated, db, email]);
    const demoExpiresAt = toDate(demoToken?.expires_at);
    const demoExpired = !demoExpiresAt || demoExpiresAt < now;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit(() => verifyOtp(email, data.otp), {
            onSuccess: (result) => router.push(withQuery(route('auth.reset-password'), { email: result.email })),
        });
    };

    if (!email) return null;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Verify OTP</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We&apos;ve sent a 6-digit code to <strong>{email}</strong>
                    </p>
                </div>

                <div className="rounded-lg bg-white px-6 py-8 shadow">
                    {flash.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter 6-digit OTP</Label>
                            <div className="relative">
                                <Shield className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="123456"
                                    className="pl-10 text-center text-lg tracking-widest"
                                    value={data.otp}
                                    onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            disabled={!hydrated || processing || data.otp.length !== 6}
                        >
                            {processing ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link href={route('auth.forgot-password')} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Email Entry
                        </Link>
                    </div>
                </div>

                {/* Demo inbox: this portfolio demo cannot send email, so the code is shown here instead. */}
                {hydrated && (
                    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4" aria-live="polite">
                        <div className="mb-2 flex items-center gap-2">
                            <Inbox className="h-4 w-4 text-amber-700" />
                            <p className="text-xs font-semibold tracking-wider text-amber-800 uppercase">Demo inbox</p>
                        </div>
                        {demoToken ? (
                            <>
                                <p className="text-sm text-amber-900">
                                    In the real system this 6-digit code is emailed to you. Demo code:{' '}
                                    <span className="font-mono text-base font-bold tracking-widest">{demoToken.otp}</span>
                                </p>
                                <p className="mt-1 text-xs text-amber-700">
                                    {demoExpired
                                        ? 'This code has expired. Go back and request a new one.'
                                        : `Valid until ${formatDateTime(demoToken.expires_at)}.`}
                                </p>
                                {!demoExpired && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="mt-3 border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
                                        onClick={() => setData('otp', demoToken.otp)}
                                    >
                                        Use this code
                                    </Button>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-amber-900">
                                No code has been requested for this email.{' '}
                                <Link href={route('auth.forgot-password')} className="font-medium underline">
                                    Request one
                                </Link>
                                .
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
