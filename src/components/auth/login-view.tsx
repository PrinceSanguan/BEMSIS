'use client';

import BemsisLogo from '@/components/bemsis-logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, login, quickLogin } from '@/lib/demo/actions';
import { clearStaleFlash, useFlash } from '@/lib/demo/flash';
import { useHydrated } from '@/lib/demo/store';
import { route } from '@/lib/routes';
import type { Role } from '@/lib/types';
import { useForm } from '@/lib/use-form';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

const demoAccounts: { role: Role; label: string; color: string }[] = [
    { role: 'captain', label: 'Captain', color: 'bg-red-100 text-red-700' },
    { role: 'secretary', label: 'Secretary', color: 'bg-blue-100 text-blue-700' },
    { role: 'resident', label: 'Resident', color: 'bg-green-100 text-green-700' },
    { role: 'partner_agency', label: 'Partner', color: 'bg-purple-100 text-purple-700' },
];

const AREA_PREFIX: Record<string, string> = {
    '/captain/dashboard': '/captain/',
    '/secretary/dashboard': '/secretary/',
    '/partner/dashboard': '/partner/',
    '/resident/dashboard': '/resident/',
};

export default function LoginView() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hydrated = useHydrated();
    const flash = useFlash();
    const { data, setData, submit, processing, errors } = useForm({ email: '', password: '' });
    const [authError, setAuthError] = useState<string | null>(null);

    // Messages flashed before arriving here ("Please login to access this page") stay visible a bit longer.
    useEffect(() => {
        clearStaleFlash(15_000);
    }, []);

    /** Back to the page that sent us here when it belongs to the user's own area, else their dashboard. */
    const goTo = (dashboard: string) => {
        const target = searchParams.get('redirect');
        const allowed = target && (target === '/devices' || target.startsWith(AREA_PREFIX[dashboard] ?? '\u0000'));
        router.replace(allowed ? target : dashboard);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        submit(() => login(data.email, data.password), {
            onSuccess: (result) => goTo(result.redirect),
            onError: (errs) => setAuthError(errs.auth ?? null),
        });
    };

    const signInAs = (role: Role) => {
        setAuthError(null);
        const result = quickLogin(role);
        if (result.ok) goTo(result.data.redirect);
        else setAuthError(result.errors.auth);
    };

    const locked = Boolean(authError?.includes('locked'));
    const flashType = flash.error ? 'error' : flash.success ? 'success' : flash.info ? 'info' : null;
    const flashMessage = flash.error ?? flash.success ?? flash.info;

    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-6 text-black">
            <div className="flex w-full max-w-sm flex-col items-center gap-4">
                <Card className="w-full rounded-2xl border border-indigo-600 bg-white shadow-xl">
                    <CardContent className="p-8">
                        <div className="mb-6 text-center">
                            <div className="mb-4 flex justify-center">
                                <Link href="/" aria-label="BEMSIS home">
                                    <BemsisLogo size="lg" />
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
                        </div>

                        {flashMessage && !authError && (
                            <Alert
                                className={`mb-4 ${flashType === 'error' ? 'border-red-600 bg-red-100' : flashType === 'info' ? 'border-blue-600 bg-blue-50' : 'border-green-600 bg-green-100'}`}
                            >
                                <AlertDescription
                                    className={flashType === 'error' ? 'text-red-800' : flashType === 'info' ? 'text-blue-800' : 'text-green-800'}
                                >
                                    {flashMessage}
                                </AlertDescription>
                            </Alert>
                        )}

                        {authError && (
                            <Alert variant="destructive" className={`mb-4 ${locked ? 'border-orange-500 bg-orange-50' : ''}`}>
                                <AlertDescription className={locked ? 'text-orange-800' : ''}>{authError}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="your.email@example.com"
                                    className="w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="w-full"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-indigo-600 text-white hover:bg-indigo-700"
                                disabled={!hydrated || processing || locked}
                            >
                                {processing ? 'Logging in...' : locked ? 'Account Locked' : 'Login'}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <Link href={route('auth.forgot-password')} className="text-sm text-blue-600 underline hover:text-blue-500">
                                Forgot your password?
                            </Link>
                        </div>

                        <p className="mt-4 text-center text-sm text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href={route('auth.register')} className="text-blue-500 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* One-click demo accounts (portfolio showcase) */}
                <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="mb-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">Demo Accounts</p>
                    <div className="space-y-2">
                        {demoAccounts.map((account) => (
                            <button
                                key={account.role}
                                type="button"
                                disabled={!hydrated}
                                onClick={() => signInAs(account.role)}
                                className="flex w-full items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-indigo-50 hover:shadow-md disabled:opacity-60"
                            >
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${account.color}`}>{account.label}</span>
                                <span className="flex min-w-0 items-center gap-2 text-gray-600">
                                    <span className="truncate">{DEMO_ACCOUNTS[account.role]}</span>
                                    <LogIn className="h-4 w-4 shrink-0 text-indigo-500" />
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-3 text-center text-xs text-gray-400">
                        Click to sign in instantly · Password: <span className="font-mono font-semibold text-gray-600">{DEMO_PASSWORD}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
