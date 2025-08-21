import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PageProps {
    email: string;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    [key: string]: any;
}

export default function VerifyOtp() {
    const { email, flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        email: email,
        otp: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('auth.verify-otp.check'));
    };

    return (
        <>
            <Head title="Verify OTP" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Verify OTP</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            We've sent a 6-digit code to <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="rounded-lg bg-white px-6 py-8 shadow">
                        {flash?.error && (
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

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={processing || data.otp.length !== 6}>
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
                </div>
            </div>
        </>
    );
}
