import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle,
    Download,
    Eye,
    IdCard,
    Mail,
    MapPin,
    Phone,
    User,
    UserCheck,
    UserX,
    XCircle,
} from 'lucide-react';
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
    updated_at: string;

    // Resident fields
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    extension?: string;
    place_of_birth?: string;
    date_of_birth?: string;
    age?: number;
    sex?: 'Male' | 'Female';
    civil_status?: string;
    citizenship?: string;
    occupation?: string;
    special_notes?: string;
    contact_number?: string;
    valid_id_path?: string;

    // Partner fields
    agency_name?: string;
    representative_first_name?: string;
    representative_last_name?: string;
    agency_address?: string;
    agency_contact_number?: string;
    agency_valid_id_path?: string;
    agency_endorsement_path?: string;
}

interface Props {
    user: User;
    className?: string;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function UserDetail({ user, className }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleApproveUser = () => {
        setProcessing(true);
        router.patch(
            `/secretary/users/${user.id}/approve`,
            {},
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => router.get('/secretary/users'),
            },
        );
    };

    const handleDeclineUser = () => {
        setProcessing(true);
        router.patch(
            `/secretary/users/${user.id}/decline`,
            {},
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => router.get('/secretary/users'),
            },
        );
    };

    const getRoleDisplay = (role: string) => {
        const roleMap: Record<string, { label: string; color: string }> = {
            resident: { label: 'Resident', color: 'bg-blue-100 text-blue-800' },
            partner_agency: { label: 'Partner Agency', color: 'bg-green-100 text-green-800' },
            secretary: { label: 'Secretary', color: 'bg-purple-100 text-purple-800' },
            captain: { label: 'Captain', color: 'bg-red-100 text-red-800' },
        };
        return roleMap[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
    };

    const getStatusDisplay = (status: string) => {
        const statusMap: Record<string, { label: string; color: string; icon: any }> = {
            pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
            approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
            declined: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: XCircle },
        };
        return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Calendar };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatBirthDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const roleDisplay = getRoleDisplay(user.role);
    const statusDisplay = getStatusDisplay(user.status);
    const StatusIcon = statusDisplay.icon;

    return (
        <>
            <Head title={`User Details - ${user.name}`} />

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

                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-4xl space-y-6">
                            {/* Flash Messages */}
                            {flash?.success && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertDescription>{flash.success}</AlertDescription>
                                </Alert>
                            )}

                            {flash?.error && (
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription>{flash.error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Back Button */}
                            <div className="flex items-center gap-4">
                                <Button onClick={() => router.get('/secretary/users')} variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Users
                                </Button>
                            </div>

                            {/* User Header */}
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="mb-2 flex items-center gap-3">
                                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                                <Badge className={`px-3 py-1 text-sm font-medium ${roleDisplay.color}`}>{roleDisplay.label}</Badge>
                                                <Badge className={`px-3 py-1 text-sm font-medium ${statusDisplay.color}`}>
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {statusDisplay.label}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-600">Registered on {formatDate(user.created_at)}</p>
                                        </div>

                                        {user.status === 'pending' && (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={handleApproveUser}
                                                    disabled={processing}
                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                >
                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                    {processing ? 'Processing...' : 'Approve'}
                                                </Button>
                                                <Button onClick={handleDeclineUser} disabled={processing} variant="destructive">
                                                    <UserX className="mr-2 h-4 w-4" />
                                                    {processing ? 'Processing...' : 'Decline'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* User Details */}
                            {user.role === 'resident' ? (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Personal Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Personal Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Full Name:</span>
                                                    <p className="mt-1">
                                                        {`${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''} ${user.extension || ''}`.trim()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Date of Birth:</span>
                                                    <p className="mt-1">
                                                        {user.date_of_birth ? formatBirthDate(user.date_of_birth) : 'Not provided'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Age:</span>
                                                    <p className="mt-1">{user.age || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Sex:</span>
                                                    <p className="mt-1">{user.sex || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Civil Status:</span>
                                                    <p className="mt-1">{user.civil_status || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Place of Birth:</span>
                                                    <p className="mt-1">{user.place_of_birth || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Citizenship:</span>
                                                    <p className="mt-1">{user.citizenship || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Occupation:</span>
                                                    <p className="mt-1">{user.occupation || 'Not provided'}</p>
                                                </div>
                                                {user.special_notes && (
                                                    <div>
                                                        <span className="font-medium text-gray-600">Special Notes:</span>
                                                        <p className="mt-1">{user.special_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Contact & Location */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Phone className="h-5 w-5" />
                                                Contact & Location
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-600">Email:</span>
                                                        <p className="mt-1">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-600">Contact Number:</span>
                                                        <p className="mt-1">{user.contact_number || user.phone}</p>
                                                    </div>
                                                </div>
                                                {user.purok && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <span className="font-medium text-gray-600">Purok:</span>
                                                            <p className="mt-1">{user.purok.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Uploaded Documents */}
                                    {user.valid_id_path && (
                                        <Card className="lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <IdCard className="h-5 w-5" />
                                                    Uploaded Documents
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="rounded-lg border border-gray-200 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <IdCard className="h-8 w-8 text-blue-600" />
                                                                <div>
                                                                    <h3 className="font-medium">Valid ID</h3>
                                                                    <p className="text-sm text-gray-600">Uploaded identification document</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    onClick={() => window.open(`/storage/${user.valid_id_path}`, '_blank')}
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        const link = document.createElement('a');
                                                                        link.href = `/storage/${user.valid_id_path}`;
                                                                        link.download = `valid_id_${user.name}`;
                                                                        link.click();
                                                                    }}
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Agency Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Building2 className="h-5 w-5" />
                                                Agency Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Agency Name:</span>
                                                    <p className="mt-1">{user.agency_name || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Representative:</span>
                                                    <p className="mt-1">
                                                        {`${user.representative_first_name || ''} ${user.representative_last_name || ''}`.trim() ||
                                                            'Not provided'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Agency Address:</span>
                                                    <p className="mt-1">{user.agency_address || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Contact Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Phone className="h-5 w-5" />
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-600">Email:</span>
                                                        <p className="mt-1">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-600">Agency Contact:</span>
                                                        <p className="mt-1">{user.agency_contact_number || user.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Uploaded Documents */}
                                    {user.agency_valid_id_path && (
                                        <Card className="lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <IdCard className="h-5 w-5" />
                                                    Uploaded Documents
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="rounded-lg border border-gray-200 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <IdCard className="h-8 w-8 text-blue-600" />
                                                                <div>
                                                                    <h3 className="font-medium">Agency Documents</h3>
                                                                    <p className="text-sm text-gray-600">Valid ID or Official Agency Endorsement</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    onClick={() => window.open(`/storage/${user.agency_valid_id_path}`, '_blank')}
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        const link = document.createElement('a');
                                                                        link.href = `/storage/${user.agency_valid_id_path}`;
                                                                        link.download = `agency_documents_${user.agency_name}`;
                                                                        link.click();
                                                                    }}
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
