'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hasVerifiedOtp, resetPassword } from '@/lib/demo/actions';
import { flash as flashMessage, useFlash } from '@/lib/demo/flash';
import { useDb, useHydrated } from '@/lib/demo/store';
import { route } from '@/lib/routes';
import { useForm } from '@/lib/use-form';
import { demoOtpFor } from '@/lib/views/auth';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';

const validatePassword = (password: string) => ({
    length: password.length >= 8 && password.length <= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password),
});

export default function ResetPasswordView() {
    const router = useRouter();
    const email = useSearchParams().get('email') ?? '';
    const hydrated = useHydrated();
    const db = useDb();
    const flash = useFlash();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const checked = useRef(false);

    const { data, setData, submit, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    // ForgotPasswordController@showResetPassword: only reachable right after a verified OTP.
    useEffect(() => {
        if (!hydrated || checked.current) return;
        checked.current = true;
        if (!email || !hasVerifiedOtp(db, email)) {
            flashMessage('error', 'Session expired. Please start again.');
            router.replace(route('auth.forgot-password'));
        }
    }, [hydrated, db, email, router]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submit(() => resetPassword(email, data.password, data.password_confirmation), {
            onSuccess: () => {
                setLeaving(true);
                router.push(route('auth.login'));
            },
        });
    };

    const passwordRules = validatePassword(data.password);
    const isPasswordValid = Object.values(passwordRules).every(Boolean);
    // The verified code is removed once the password changes, so keep the form up while leaving the page.
    const ready = hydrated && !!email && (!!demoOtpFor(db, email)?.verified_at || processing || leaving);

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <span className="sr-only">Loading…</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Reset Your Password</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create a new password for <strong>{email}</strong>
                    </p>
                </div>

                <div className="rounded-lg bg-white px-6 py-8 shadow">
                    {(flash.error || errors.email) && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{flash.error ?? errors.email}</AlertDescription>
                        </Alert>
                    )}

                    {/* Password Policy Info */}
                    <div className="mb-4 rounded-lg bg-indigo-50 p-4">
                        <h3 className="mb-2 font-semibold text-indigo-800">Password Requirements:</h3>
                        <ul className="space-y-1 text-sm">
                            <li className={passwordRules.length ? 'text-green-700' : 'text-indigo-700'}>
                                • 8-12 characters long {passwordRules.length && '✓'}
                            </li>
                            <li className={passwordRules.uppercase ? 'text-green-700' : 'text-indigo-700'}>
                                • At least 1 uppercase letter (A-Z) {passwordRules.uppercase && '✓'}
                            </li>
                            <li className={passwordRules.lowercase ? 'text-green-700' : 'text-indigo-700'}>
                                • At least 1 lowercase letter (a-z) {passwordRules.lowercase && '✓'}
                            </li>
                            <li className={passwordRules.number ? 'text-green-700' : 'text-indigo-700'}>
                                • At least 1 number (0-9) {passwordRules.number && '✓'}
                            </li>
                            <li className={passwordRules.special ? 'text-green-700' : 'text-indigo-700'}>
                                • At least 1 special character (!@#$%^&*) {passwordRules.special && '✓'}
                            </li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Create a strong password"
                                    className="pr-10 pl-10"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 h-4 w-4 text-gray-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Confirm your password"
                                    className="pr-10 pl-10"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 h-4 w-4 text-gray-400"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {data.password_confirmation && data.password !== data.password_confirmation && (
                                <p className="text-sm text-red-500">Passwords do not match</p>
                            )}
                            {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            disabled={processing || leaving || !isPasswordValid || data.password !== data.password_confirmation}
                        >
                            {processing ? 'Updating Password...' : 'Update Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
