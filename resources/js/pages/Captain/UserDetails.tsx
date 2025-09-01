import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Captain/Header';
import Sidebar from '@/pages/Captain/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Building2, Calendar, CheckCircle, Download, Eye, IdCard, Mail, MapPin, Phone, User, UserX, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    is_active: boolean;
    purok?: Purok;
    created_at: string;
    updated_at: string;
    last_seen_at?: string;
    is_online?: boolean;

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
    const [currentUser, setCurrentUser] = useState(user);

    // Update user status every 30 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/api/users/${user.id}/status`);
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser((prev) => ({
                        ...prev,
                        is_online: userData.is_online,
                        last_seen_at: userData.last_seen_at,
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch user status:', error);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [user.id]);

    const getOnlineStatus = () => {
        if (currentUser.is_online) {
            return { label: 'Online', color: 'bg-green-100 text-green-800', icon: '🟢' };
        } else {
            const lastSeen = currentUser.last_seen_at ? new Date(currentUser.last_seen_at) : null;
            if (lastSeen) {
                const diffInMinutes = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60));
                if (diffInMinutes < 5) {
                    return { label: 'Recently Active', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
                } else {
                    return { label: 'Offline', color: 'bg-gray-100 text-gray-800', icon: '⚫' };
                }
            }
            return { label: 'Offline', color: 'bg-gray-100 text-gray-800', icon: '⚫' };
        }
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
                    <Sidebar currentPage="captain.users" />
                </div>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute top-0 left-0 h-full">
                            <Sidebar currentPage="captain.users" />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-1 flex-col">
                    <Header userName="Captain" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto bg-gray-50 p-6">
                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="mb-6">
                                <Alert className="border-green-200 bg-green-50">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mb-6">
                                <Alert className="border-red-200 bg-red-50">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {/* Back Button */}
                        <div className="mb-6">
                            <Button variant="outline" onClick={() => router.get(route('captain.users'))}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </div>

                        <div className="mx-auto max-w-6xl space-y-6">
                            {/* Header Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                                <Badge className={`px-3 py-1 ${roleDisplay.color}`}>{roleDisplay.label}</Badge>
                                                <Badge className={`px-3 py-1 ${statusDisplay.color}`}>
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {statusDisplay.label}
                                                </Badge>
                                                <Badge className={`px-3 py-1 text-sm font-medium ${getOnlineStatus().color}`}>
                                                    <span className="mr-1">{getOnlineStatus().icon}</span>
                                                    {getOnlineStatus().label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>Joined on {formatDate(user.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Activation Controls */}
                            {user.status === 'approved' && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
                                                <p className="text-sm text-gray-600">
                                                    This account is currently {user.is_active ? 'active' : 'deactivated'}
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                {user.is_active ? (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.patch(`/captain/users/${user.id}/deactivate`)}
                                                        className="border-red-300 text-red-600 hover:border-red-400 hover:text-red-700"
                                                    >
                                                        <UserX className="mr-2 h-4 w-4" />
                                                        Deactivate Account
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.patch(`/captain/users/${user.id}/activate`)}
                                                        className="border-green-300 text-green-600 hover:border-green-400 hover:text-green-700"
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Activate Account
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

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
                                                        {`${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''} ${user.extension ? user.extension : ''}`.trim()}
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
                                                    <p className="mt-1">{user.age || 'Not provided'} years old</p>
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

                                    {/* Valid ID */}
                                    {user.valid_id_path && (
                                        <Card className="lg:col-span-2">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <IdCard className="h-5 w-5" />
                                                    Valid ID Document
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Eye className="h-5 w-5 text-gray-400" />
                                                        <span className="text-sm text-gray-600">Valid ID uploaded</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`/storage/${user.valid_id_path}`, '_blank')}
                                                    >
                                                        <Download className="mr-1 h-4 w-4" />
                                                        View Document
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            ) : (
                                /* Partner Agency Details */
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
                                                    <span className="font-medium text-gray-600">Agency Address:</span>
                                                    <p className="mt-1">{user.agency_address || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Agency Contact:</span>
                                                    <p className="mt-1">{user.agency_contact_number || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Representative Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <User className="h-5 w-5" />
                                                Representative Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Representative Name:</span>
                                                    <p className="mt-1">
                                                        {user.representative_first_name && user.representative_last_name
                                                            ? `${user.representative_first_name} ${user.representative_last_name}`
                                                            : 'Not provided'}
                                                    </p>
                                                </div>
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
                                                        <span className="font-medium text-gray-600">Phone:</span>
                                                        <p className="mt-1">{user.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Documents */}
                                    <Card className="lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <IdCard className="h-5 w-5" />
                                                Uploaded Documents
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {user.agency_valid_id_path && (
                                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Eye className="h-5 w-5 text-gray-400" />
                                                            <span className="text-sm text-gray-600">Valid ID Document</span>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`/storage/${user.agency_valid_id_path}`, '_blank')}
                                                        >
                                                            <Download className="mr-1 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </div>
                                                )}
                                                {user.agency_endorsement_path && (
                                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Eye className="h-5 w-5 text-gray-400" />
                                                            <span className="text-sm text-gray-600">Endorsement Letter</span>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => window.open(`/storage/${user.agency_endorsement_path}`, '_blank')}
                                                        >
                                                            <Download className="mr-1 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </div>
                                                )}
                                                {!user.agency_valid_id_path && !user.agency_endorsement_path && (
                                                    <p className="text-sm text-gray-500">No documents uploaded</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
