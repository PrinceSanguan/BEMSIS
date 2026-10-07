'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendOtp } from '@/lib/demo/actions';
import { clearStaleFlash, useFlash } from '@/lib/demo/flash';
import { useHydrated } from '@/lib/demo/store';
import { route, withQuery } from '@/lib/routes';
import { useForm } from '@/lib/use-form';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect } from 'react';

export default function ForgotPasswordView() {
    const router = useRouter();
    const hydrated = useHydrated();
    const flash = useFlash();
    const { data, setData, submit, processing, errors } = useForm({
        email: '',
    });

    useEffect(() => {
        clearStaleFlash(15_000);
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit(() => sendOtp(data.email), {
            onSuccess: (result) => router.push(withQuery(route('auth.verify-otp'), { email: result.email })),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Forgot your password?</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address and we&apos;ll send you an OTP to reset your password.
                    </p>
                </div>

                <div className="rounded-lg bg-white px-6 py-8 shadow">
                    {flash.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{flash.error}</AlertDescription>
                        </Alert>
                    )}

                    {flash.success && (
                        <Alert className="mb-4 border-indigo-600 bg-indigo-100">
                            <AlertDescription className="text-indigo-800">{flash.success}</AlertDescription>
                        </Alert>
                    )}

                    {flash.info && (
                        <Alert className="mb-4 border-blue-600 bg-blue-100">
                            <AlertDescription className="text-blue-800">{flash.info}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="your.email@example.com"
                                    className="pl-10"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!hydrated || processing}>
                            {processing ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link href={route('auth.login')} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
