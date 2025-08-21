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

    return (
        <>
            <Head title="Login" />
            <div className="flex min-h-screen items-center justify-center bg-white p-6 text-black dark:bg-black dark:text-white">
                <Card className="w-full max-w-sm rounded-2xl border border-green-600 bg-white shadow-xl dark:bg-black">
                    <CardContent className="p-8">
                        <div className="mb-6 text-center">
                            <img src="/assets/images/Bemsis.jpg" alt="Bemsis Logo" className="mx-auto mb-4 h-16 w-auto" />
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
                                className="mt-4 w-full bg-green-600 text-white hover:bg-green-700"
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
            </div>
        </>
    );
}
