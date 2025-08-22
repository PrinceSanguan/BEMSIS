import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Monitor, Shield } from 'lucide-react';

interface Props {
    message: string;
    device: {
        name: string;
        platform: string;
        browser: string;
    };
}

export default function DeviceVerified({ message, device }: Props) {
    return (
        <>
            <Head title="Device Verified" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="mb-2 text-3xl font-bold text-gray-900">Device Verified!</h2>
                        <p className="text-gray-600">Your device has been successfully verified</p>
                    </div>

                    <div className="space-y-6 rounded-lg bg-white p-6 shadow-lg">
                        <div className="flex items-start space-x-3">
                            <Shield className="mt-1 h-6 w-6 text-green-600" />
                            <div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900">Security Status</h3>
                                <p className="text-sm leading-relaxed text-gray-600">{message}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-start space-x-3">
                                <Monitor className="mt-1 h-6 w-6 text-blue-600" />
                                <div>
                                    <h3 className="mb-3 text-lg font-medium text-gray-900">Verified Device</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Device:</span>
                                            <span className="font-medium text-gray-900">{device.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Platform:</span>
                                            <span className="font-medium text-gray-900">{device.platform}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Browser:</span>
                                            <span className="font-medium text-gray-900">{device.browser}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md border border-green-200 bg-green-50 p-4">
                            <div className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                                <p className="text-sm font-medium text-green-800">
                                    You will no longer receive security notifications for this device.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 text-center">
                        <Link
                            href={route('auth.login')}
                            className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Continue to Login
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
                            This verification confirms the security of your account.
                            <br />
                            You can manage your devices from your account settings.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
