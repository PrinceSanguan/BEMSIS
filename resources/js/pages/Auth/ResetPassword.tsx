import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

interface PageProps {
    email: string;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: any;
}

export default function ResetPassword() {
    const { email, flash } = usePage<PageProps>().props;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('auth.reset-password.update'));
    };

    const validatePassword = (password: string) => {
        const rules = {
            length: password.length >= 8 && password.length <= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password),
        };
        return rules;
    };

    const passwordRules = validatePassword(data.password);
    const isPasswordValid = Object.values(passwordRules).every(Boolean);

    return (
        <>
            <Head title="Reset Password" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Reset Your Password</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Create a new password for <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="rounded-lg bg-white px-6 py-8 shadow">
                        {flash?.error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Password Policy Info */}
                        <div className="mb-4 rounded-lg bg-blue-50 p-4">
                            <h3 className="mb-2 font-semibold text-blue-800">Password Requirements:</h3>
                            <ul className="space-y-1 text-sm">
                                <li className={passwordRules.length ? 'text-green-700' : 'text-blue-700'}>
                                    • 8-12 characters long {passwordRules.length && '✓'}
                                </li>
                                <li className={passwordRules.uppercase ? 'text-green-700' : 'text-blue-700'}>
                                    • At least 1 uppercase letter (A-Z) {passwordRules.uppercase && '✓'}
                                </li>
                                <li className={passwordRules.lowercase ? 'text-green-700' : 'text-blue-700'}>
                                    • At least 1 lowercase letter (a-z) {passwordRules.lowercase && '✓'}
                                </li>
                                <li className={passwordRules.number ? 'text-green-700' : 'text-blue-700'}>
                                    • At least 1 number (0-9) {passwordRules.number && '✓'}
                                </li>
                                <li className={passwordRules.special ? 'text-green-700' : 'text-blue-700'}>
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
                                    >
                                        {showPassword ? <EyeOff /> : <Eye />}
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
                                    >
                                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                                    </button>
                                </div>
                                {data.password_confirmation && data.password !== data.password_confirmation && (
                                    <p className="text-sm text-red-500">Passwords do not match</p>
                                )}
                                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={processing || !isPasswordValid || data.password !== data.password_confirmation}
                            >
                                {processing ? 'Updating Password...' : 'Update Password'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
