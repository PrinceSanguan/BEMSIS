import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail } from 'lucide-react';

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    [key: string]: any;
}

export default function ForgotPassword() {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('auth.forgot-password.send'));
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Forgot your password?</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Enter your email address and we'll send you an OTP to reset your password.
                        </p>
                    </div>

                    <div className="rounded-lg bg-white px-6 py-8 shadow">
                        {flash?.error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.success && (
                            <Alert className="mb-4 border-green-600 bg-green-100">
                                <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                            </Alert>
                        )}

                        {flash?.info && (
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
                                        placeholder="your.email@example.com"
                                        className="pl-10"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={processing}>
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
        </>
    );
}
