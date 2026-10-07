'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { approveUser, declineUser, setUserActive } from '@/lib/demo/actions';
import { downloadStoredFile, openStoredFile } from '@/lib/demo/files';
import { useDb } from '@/lib/demo/store';
import { formatDateLong } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { route } from '@/lib/routes';
import { secretaryUserDetailProps } from '@/lib/views/secretary';
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
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

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
    const statusMap: Record<string, { label: string; color: string; icon: LucideIcon }> = {
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

export default function SecretaryUserDetailView({ id }: { id: number }) {
    const db = useDb();
    const router = useRouter();
    const now = useNow();
    const { user } = useMemo(() => secretaryUserDetailProps(db, id, now), [db, id, now]);

    if (!user) {
        return (
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('secretary.users')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-12 text-center">
                        <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">User not found</h3>
                        <p className="text-gray-600">This user does not exist or has been removed.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getOnlineStatus = () => {
        if (user.is_online) {
            return { label: 'Online', color: 'bg-green-100 text-green-800', icon: '🟢' };
        } else {
            const lastSeen = user.last_seen_at ? new Date(user.last_seen_at) : null;
            if (lastSeen) {
                const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
                if (diffInMinutes < 5) {
                    return { label: 'Recently Active', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
                } else {
                    return { label: 'Offline', color: 'bg-gray-100 text-gray-800', icon: '⚫' };
                }
            }
            return { label: 'Offline', color: 'bg-gray-100 text-gray-800', icon: '⚫' };
        }
    };

    const handleApproveUser = () => {
        if (approveUser(user.id).ok) router.push(route('secretary.users'));
    };

    const handleDeclineUser = () => {
        if (declineUser(user.id).ok) router.push(route('secretary.users'));
    };

    const roleDisplay = getRoleDisplay(user.role);
    const statusDisplay = getStatusDisplay(user.status);
    const StatusIcon = statusDisplay.icon;
    const onlineStatus = getOnlineStatus();

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Back Button */}
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={route('secretary.users')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Users
                    </Link>
                </Button>
            </div>

            {/* User Header */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="mb-2 space-y-2">
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{user.name}</h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={`px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm ${roleDisplay.color}`}>
                                        {roleDisplay.label}
                                    </Badge>
                                    <Badge className={`px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm ${statusDisplay.color}`}>
                                        <StatusIcon className="mr-1 h-3 w-3" />
                                        {statusDisplay.label}
                                    </Badge>
                                    <Badge className={`px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm ${onlineStatus.color}`}>
                                        <span className="mr-1">{onlineStatus.icon}</span>
                                        {onlineStatus.label}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-gray-600">Registered on {formatDate(user.created_at)}</p>
                        </div>

                        {user.status === 'pending' && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                <Button onClick={handleApproveUser} className="bg-indigo-600 text-white hover:bg-indigo-700">
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                                <Button onClick={handleDeclineUser} variant="destructive">
                                    <UserX className="mr-2 h-4 w-4" />
                                    Decline
                                </Button>
                            </div>
                        )}

                        {user.status === 'approved' && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                {user.is_active ? (
                                    <Button
                                        onClick={() => setUserActive(user.id, false)}
                                        variant="outline"
                                        className="border-red-300 text-red-600 hover:border-red-400 hover:text-red-700"
                                    >
                                        <UserX className="mr-2 h-4 w-4" />
                                        Deactivate Account
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setUserActive(user.id, true)}
                                        variant="outline"
                                        className="border-indigo-300 text-indigo-600 hover:border-indigo-400 hover:text-indigo-700"
                                    >
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Activate Account
                                    </Button>
                                )}
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
                                        {`${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''} ${user.extension ? user.extension : ''}`.trim()}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Date of Birth:</span>
                                    <p className="mt-1">{user.date_of_birth ? formatDateLong(user.date_of_birth) : 'Not provided'}</p>
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
                                        <p className="mt-1">{user.phone}</p>
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
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3">
                                                <IdCard className="h-8 w-8 text-blue-600" />
                                                <div>
                                                    <h3 className="font-medium">Valid ID</h3>
                                                    <p className="text-sm text-gray-600">Uploaded identification document</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => openStoredFile(user.valid_id_path)} variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Button>
                                                <Button
                                                    onClick={() => downloadStoredFile(user.valid_id_path, `valid_id_${user.name}`)}
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
                                        {`${user.representative_first_name || ''} ${user.representative_last_name || ''}`.trim() || 'Not provided'}
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
                                        <p className="mt-1">{user.phone}</p>
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
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-3">
                                                <IdCard className="h-8 w-8 text-blue-600" />
                                                <div>
                                                    <h3 className="font-medium">Agency Documents</h3>
                                                    <p className="text-sm text-gray-600">Valid ID or Official Agency Endorsement</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => openStoredFile(user.agency_valid_id_path)} variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        downloadStoredFile(user.agency_valid_id_path, `agency_documents_${user.agency_name}`)
                                                    }
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
    );
}
