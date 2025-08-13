import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, Clock, Mail, MapPin, Phone, UserCheck, Users as UsersIcon, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Purok {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'resident' | 'partner_agency' | 'secretary' | 'captain';
    status: 'pending' | 'approved' | 'declined';
    purok?: Purok;
    created_at: string;
}

interface Props {
    pendingUsers: User[];
    className?: string;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Users({ pendingUsers, className }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [processingUsers, setProcessingUsers] = useState<Set<number>>(new Set());

    const handleApproveUser = (userId: number) => {
        setProcessingUsers((prev) => new Set([...prev, userId]));

        router.patch(
            `/secretary/users/${userId}/approve`,
            {},
            {
                onFinish: () => {
                    setProcessingUsers((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(userId);
                        return newSet;
                    });
                },
            },
        );
    };

    const handleDeclineUser = (userId: number) => {
        setProcessingUsers((prev) => new Set([...prev, userId]));

        router.patch(
            `/secretary/users/${userId}/decline`,
            {},
            {
                onFinish: () => {
                    setProcessingUsers((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(userId);
                        return newSet;
                    });
                },
            },
        );
    };

    const getRoleDisplay = (role: 'resident' | 'partner_agency' | 'secretary' | 'captain') => {
        const roleMap: Record<string, { label: string; color: string }> = {
            resident: { label: 'Resident', color: 'bg-blue-100 text-blue-800' },
            partner_agency: { label: 'Partner Agency', color: 'bg-green-100 text-green-800' },
            secretary: { label: 'Secretary', color: 'bg-purple-100 text-purple-800' },
            captain: { label: 'Captain', color: 'bg-red-100 text-red-800' },
        };
        return roleMap[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="User Management - Secretary" />
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar currentPage="secretary.users" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="secretary.users" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${className || ''}`}>
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                                <p className="mt-2 text-gray-600">Review and approve pending user registrations</p>
                            </div>

                            {/* Flash Messages */}
                            {flash?.success && (
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                                </Alert>
                            )}

                            {flash?.error && (
                                <Alert className="border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Statistics */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Pending Users</p>
                                                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
                                            </div>
                                            <UsersIcon className="h-8 w-8 text-orange-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Residents</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {pendingUsers.filter((user) => user.role === 'resident').length}
                                                </p>
                                            </div>
                                            <UserCheck className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Partner Agencies</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {pendingUsers.filter((user) => user.role === 'partner_agency').length}
                                                </p>
                                            </div>
                                            <UserX className="h-8 w-8 text-green-600" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Pending Users List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UsersIcon className="h-5 w-5" />
                                        Pending User Registrations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pendingUsers.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900">No pending users</h3>
                                            <p className="text-gray-600">All user registrations have been reviewed.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {pendingUsers.map((user) => {
                                                const roleDisplay = getRoleDisplay(user.role);
                                                const isProcessing = processingUsers.has(user.id);

                                                return (
                                                    <div
                                                        key={user.id}
                                                        className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                                                                    <Badge className={roleDisplay.color}>{roleDisplay.label}</Badge>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="h-4 w-4" />
                                                                        <span>{user.email}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="h-4 w-4" />
                                                                        <span>{user.phone}</span>
                                                                    </div>
                                                                    {user.purok && (
                                                                        <div className="flex items-center gap-2">
                                                                            <MapPin className="h-4 w-4" />
                                                                            <span>{user.purok.name}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4" />
                                                                        <span>Registered: {formatDate(user.created_at)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <Button
                                                                    onClick={() => handleApproveUser(user.id)}
                                                                    disabled={isProcessing}
                                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                                    size="sm"
                                                                >
                                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                                    {isProcessing ? 'Processing...' : 'Approve'}
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDeclineUser(user.id)}
                                                                    disabled={isProcessing}
                                                                    variant="destructive"
                                                                    size="sm"
                                                                >
                                                                    <UserX className="mr-2 h-4 w-4" />
                                                                    {isProcessing ? 'Processing...' : 'Decline'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
