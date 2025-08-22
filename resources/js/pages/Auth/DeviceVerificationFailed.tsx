import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';

interface Props {
    message: string;
}

export default function DeviceVerificationFailed({ message }: Props) {
    return (
        <>
            <Head title="Device Verification Failed" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">Verification Failed</h2>
                        <p className="text-gray-600">We couldn't verify your device</p>
                    </div>

                    <div className="space-y-6 rounded-lg bg-white p-6 shadow-lg">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="mt-1 h-6 w-6 text-red-600" />
                            <div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900">What happened?</h3>
                                <p className="text-sm leading-relaxed text-gray-600">{message}</p>
                            </div>
                        </div>

                        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                            <div className="flex items-start">
                                <AlertTriangle className="mt-0.5 mr-3 h-5 w-5 text-yellow-600" />
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-yellow-800">Common causes:</h4>
                                    <ul className="space-y-1 text-sm text-yellow-700">
                                        <li>• The verification link has expired</li>
                                        <li>• The link has already been used</li>
                                        <li>• The link was corrupted in email</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="mb-3 text-lg font-medium text-gray-900">What can you do?</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start">
                                    <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                        <span className="text-xs font-bold text-blue-600">1</span>
                                    </div>
                                    <p>Try logging in again to receive a new verification email</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                        <span className="text-xs font-bold text-blue-600">2</span>
                                    </div>
                                    <p>Check if you received multiple emails and use the latest one</p>
                                </div>
                                <div className="flex items-start">
                                    <div className="mt-0.5 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                        <span className="text-xs font-bold text-blue-600">3</span>
                                    </div>
                                    <p>Contact support if the problem persists</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 text-center">
                        <Link
                            href={route('auth.login')}
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Try Login Again
                        </Link>

                        <div>
                            <Link
                                href={route('home')}
                                className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700"
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to Home
                            </Link>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Having trouble? Contact our support team for assistance.
                            <br />
                            We're here to help keep your account secure.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
