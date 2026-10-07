'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { setUserActive } from '@/lib/demo/actions';
import { openStoredFile } from '@/lib/demo/files';
import { useDb } from '@/lib/demo/store';
import { formatDateLong } from '@/lib/format';
import { useNow } from '@/lib/hooks';
import { route } from '@/lib/routes';
import { captainUserDetailProps, userStatus } from '@/lib/views/captain';
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
    UserX,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
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

function BackToUsers() {
    return (
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href={route('captain.users')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Link>
            </Button>
        </div>
    );
}

export default function CaptainUserDetailsView({ id }: { id: number }) {
    const db = useDb();
    // Replaces the 30-second fetch of /api/users/{id}/status: the store is live, the clock refreshes the label.
    const now = useNow(30_000);
    const props = useMemo(() => captainUserDetailProps(db, id), [db, id]);
    const status = useMemo(() => userStatus(db, id, now), [db, id, now]);

    if (!props) {
        return (
            <div>
                <BackToUsers />
                <Card className="mx-auto max-w-xl">
                    <CardContent className="py-12 text-center">
                        <UserX className="mx-auto h-12 w-12 text-gray-400" />
                        <h1 className="mt-4 text-lg font-medium text-gray-900">User not found</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            This user doesn&apos;t exist in this browser&apos;s demo data. It may have been removed or the demo was reset.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { user } = props;

    const getOnlineStatus = () => {
        if (status.is_online) {
            return { label: 'Online', color: 'bg-green-100 text-green-800', icon: '🟢' };
        }
        const lastSeen = status.last_seen_at ? new Date(status.last_seen_at) : null;
        if (lastSeen) {
            const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
            if (diffInMinutes < 5) {
                return { label: 'Recently Active', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
            }
        }
        return { label: 'Offline', color: 'bg-gray-100 text-gray-800', icon: '⚫' };
    };

    const roleDisplay = getRoleDisplay(user.role);
    const statusDisplay = getStatusDisplay(user.status);
    const onlineStatus = getOnlineStatus();
    const StatusIcon = statusDisplay.icon;

    return (
        <div>
            {/* Back Button */}
            <BackToUsers />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                                <div className="space-y-2">
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
                                            <span className="mr-1" aria-hidden="true">
                                                {onlineStatus.icon}
                                            </span>
                                            {onlineStatus.label}
                                        </Badge>
                                    </div>
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
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
                                    <p className="text-sm text-gray-600">This account is currently {user.is_active ? 'active' : 'deactivated'}</p>
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                    {user.is_active ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => setUserActive(user.id, false)}
                                            className="border-red-300 text-red-600 hover:border-red-400 hover:text-red-700"
                                        >
                                            <UserX className="mr-2 h-4 w-4" />
                                            Deactivate Account
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => setUserActive(user.id, true)}
                                            className="border-indigo-300 text-indigo-600 hover:border-indigo-400 hover:text-indigo-700"
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
                                        <p className="mt-1">{user.date_of_birth ? formatDateLong(user.date_of_birth) : 'Not provided'}</p>
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
                                        <Button variant="outline" size="sm" onClick={() => openStoredFile(user.valid_id_path)}>
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
                                        <p className="mt-1">{user.phone || 'Not provided'}</p>
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
                                            <Button variant="outline" size="sm" onClick={() => openStoredFile(user.agency_valid_id_path)}>
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
                                            <Button variant="outline" size="sm" onClick={() => openStoredFile(user.agency_endorsement_path)}>
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
        </div>
    );
}
