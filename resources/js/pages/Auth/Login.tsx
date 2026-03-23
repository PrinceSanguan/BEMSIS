import CivicHubLogo from '@/components/civic-hub-logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface LoginProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Login({ flash }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const [authError, setAuthError] = useState<string | null>(null);
    const [flashMessage, setFlashMessage] = useState<{
        type: 'success' | 'error' | null;
        message: string | null;
    }>({ type: null, message: null });

    // Check for flash messages
    useEffect(() => {
        if (flash?.success) {
            setFlashMessage({
                type: 'success',
                message: flash.success,
            });
        } else if (flash?.error) {
            setFlashMessage({
                type: 'error',
                message: flash.error,
            });
        } else {
            setFlashMessage({ type: null, message: null });
        }
    }, [flash]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setFlashMessage({ type: null, message: null });

        post(route('auth.login.store'), {
            onError: (errors) => {
                // If we received an authentication error from the backend
                if (errors.auth) {
                    setAuthError(errors.auth);
                }
                // Handle validation errors
                if (errors.email) {
                    setAuthError(errors.email);
                }
                if (errors.password) {
                    setAuthError(errors.password);
                }
            },
        });
    };

    const demoAccounts = [
        { role: 'Captain', email: 'captain@gmail.com', color: 'bg-red-100 text-red-700' },
        { role: 'Secretary', email: 'secretary@gmail.com', color: 'bg-blue-100 text-blue-700' },
        { role: 'Resident', email: 'resident@gmail.com', color: 'bg-green-100 text-green-700' },
        { role: 'Partner', email: 'partner@gmail.com', color: 'bg-purple-100 text-purple-700' },
    ];

    const fillCredentials = (email: string) => {
        setData({ email, password: 'password123' });
        setAuthError(null);
    };

    return (
        <>
            <Head title="Login" />
            <div className="flex min-h-screen items-center justify-center bg-white p-6 text-black dark:bg-black dark:text-white">
                <div className="flex w-full max-w-sm flex-col items-center gap-4">
                    <Card className="w-full rounded-2xl border border-indigo-600 bg-white shadow-xl dark:bg-black">
                        <CardContent className="p-8">
                            <div className="mb-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    <CivicHubLogo size="lg" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
                            </div>

                            {/* Show flash messages */}
                            {flashMessage.message && (
                                <Alert
                                    className={`mb-4 ${flashMessage.type === 'error' ? 'border-red-600 bg-red-100' : 'border-green-600 bg-green-100'}`}
                                >
                                    <AlertDescription className={flashMessage.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                        {flashMessage.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Show authentication error if any */}
                            {authError && (
                                <Alert
                                    variant={authError.includes('locked') ? 'destructive' : 'destructive'}
                                    className={`mb-4 ${authError.includes('locked') ? 'border-orange-500 bg-orange-50' : ''}`}
                                >
                                    <AlertDescription className={authError.includes('locked') ? 'text-orange-800' : ''}>{authError}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className="w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="mt-4 w-full bg-indigo-600 text-white hover:bg-indigo-700"
                                    disabled={processing || Boolean(authError?.includes('locked'))}
                                >
                                    {processing ? 'Logging in...' : authError?.includes('locked') ? 'Account Locked' : 'Login'}
                                </Button>
                            </form>

                            {/* Forgot Password Link */}
                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => (window.location.href = route('auth.forgot-password'))}
                                    className="text-sm text-blue-600 underline hover:text-blue-500"
                                >
                                    Forgot your password?
                                </button>
                            </div>

                            {/* Signup Link */}
                            <p className="mt-4 text-center text-sm text-gray-500">
                                Don't have an account?{' '}
                                <a href={route('auth.register')} className="text-blue-500 hover:underline">
                                    Sign up
                                </a>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Demo Credentials */}
                    <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                        <p className="mb-3 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase">Demo Accounts</p>
                        <div className="space-y-2">
                            {demoAccounts.map((account) => (
                                <button
                                    key={account.email}
                                    type="button"
                                    onClick={() => fillCredentials(account.email)}
                                    className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
                                >
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${account.color}`}>{account.role}</span>
                                    <span className="text-gray-600">{account.email}</span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 text-center text-xs text-gray-400">Click to auto-fill credentials</p>
                    </div>
                </div>
            </div>
        </>
    );
}
