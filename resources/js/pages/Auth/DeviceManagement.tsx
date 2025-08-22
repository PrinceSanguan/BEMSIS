import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Monitor, Shield, Trash2, XCircle } from 'lucide-react';

interface Device {
    id: number;
    device_name: string;
    platform: string;
    browser: string;
    ip_address: string;
    is_trusted: boolean;
    last_used_at: string;
    first_used_at: string;
}

interface Props {
    devices: Device[];
}

export default function DeviceManagement({ devices }: Props) {
    const { delete: destroy } = useForm();

    const handleRevoke = (deviceId: number) => {
        if (
            confirm(
                'Are you sure you want to revoke trust for this device? You will receive security notifications the next time you log in from this device.',
            )
        ) {
            destroy(route('auth.devices.revoke', deviceId));
        }
    };

    return (
        <>
            <Head title="Device Management" />

            <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
                                    <p className="mt-1 text-gray-600">Manage your trusted devices and security settings</p>
                                </div>
                                <Link href={route('home')} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Back
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            {devices.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Monitor className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
                                    <p className="mt-1 text-sm text-gray-500">You haven't logged in from any devices yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {devices.map((device) => (
                                        <div key={device.id} className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <Monitor className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="text-lg font-medium text-gray-900">{device.device_name}</h3>
                                                            {device.is_trusted ? (
                                                                <div className="flex items-center space-x-1">
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    <span className="text-sm font-medium text-green-600">Trusted</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-1">
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                    <span className="text-sm font-medium text-red-600">Unverified</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Platform:</span> {device.platform}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Browser:</span> {device.browser}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">IP Address:</span> {device.ip_address}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Last Used:</span> {device.last_used_at}
                                                            </div>
                                                        </div>

                                                        <p className="mt-2 text-xs text-gray-500">First used: {device.first_used_at}</p>
                                                    </div>
                                                </div>

                                                {device.is_trusted && (
                                                    <button
                                                        onClick={() => handleRevoke(device.id)}
                                                        className="flex items-center space-x-1 rounded-md px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>Revoke</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-b-lg border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-start space-x-3">
                                <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Security Information</h4>
                                    <p className="mt-1 text-xs text-gray-600">
                                        Trusted devices won't require email verification for future logins. Revoke trust for devices you no longer
                                        recognize or use.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
