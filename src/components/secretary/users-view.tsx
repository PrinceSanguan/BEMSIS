'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setUserActive } from '@/lib/demo/actions';
import { useDb } from '@/lib/demo/store';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { useUrlFilters } from '@/lib/hooks';
import { route } from '@/lib/routes';
import { secretaryUsersProps } from '@/lib/views/secretary';
import { Clock, Eye, Mail, MapPin, Phone, UserCheck, Users as UsersIcon, UserX } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const FILTER_KEYS = ['search', 'purok_id', 'users_page', 'partners_page'] as const;

const getRoleDisplay = (role: string) => {
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

export default function SecretaryUsersView() {
    const db = useDb();
    const { filters: query, setFilters } = useUrlFilters(FILTER_KEYS);
    const { pendingUsers, approvedUsers, approvedPartners, puroks, filters } = useMemo(() => secretaryUsersProps(db, query), [db, query]);

    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedPurok, setSelectedPurok] = useState(filters.purok_id);

    const handleSearch = (search: string, purokId: string) => {
        setFilters({
            search: search || null,
            purok_id: purokId !== 'all' ? purokId : null,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(searchTerm, selectedPurok);
    };

    const handlePurokChange = (purokId: string) => {
        setSelectedPurok(purokId);
        handleSearch(searchTerm, purokId);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedPurok('all');
        handleSearch('', 'all');
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">User Management</h1>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">Review and approve pending user registrations</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Residents</p>
                                <p className="text-2xl font-bold text-gray-900">{approvedUsers.total}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                                <p className="text-2xl font-bold text-gray-900">{approvedPartners.total}</p>
                            </div>
                            <UserX className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

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

                                return (
                                    <div key={user.id} className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{user.name}</h3>
                                                    <Badge className={`px-2 py-1 text-xs font-medium ${roleDisplay.color}`}>
                                                        {roleDisplay.label}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
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

                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700" size="sm">
                                                    <Link href={route('secretary.users.detail', user.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
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

            {/* Approved Users List */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Approved Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Search and Filter Controls */}
                    <div className="mb-6 space-y-4">
                        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search by name, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={selectedPurok} onValueChange={handlePurokChange}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by Purok" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Puroks</SelectItem>
                                        {puroks.map((purok) => (
                                            <SelectItem key={purok.id} value={purok.id.toString()}>
                                                {purok.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit" variant="outline">
                                    Search
                                </Button>
                                {(filters.search || filters.purok_id !== 'all') && (
                                    <Button type="button" variant="outline" onClick={clearFilters}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {approvedUsers.data.length === 0 ? (
                        <div className="py-8 text-center">
                            <UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No approved users</h3>
                            <p className="text-gray-600">No users have been approved yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approvedUsers.data.map((user) => {
                                const roleDisplay = getRoleDisplay(user.role);
                                return (
                                    <div key={user.id} className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{user.name}</h3>
                                                    <Badge className={`px-2 py-1 text-xs font-medium ${roleDisplay.color}`}>
                                                        {roleDisplay.label}
                                                    </Badge>
                                                    <Badge className="bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Approved</Badge>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
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
                                                        <span>Approved: {formatDate(user.updated_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700" size="sm">
                                                    <Link href={route('secretary.users.detail', user.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
                <PaginationControls data={approvedUsers} onPage={(page) => setFilters({ users_page: page })} />
            </Card>

            {/* Approved Partners List */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Approved Partners
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {approvedPartners.data.length === 0 ? (
                        <div className="py-8 text-center">
                            <UsersIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">No approved partners</h3>
                            <p className="text-gray-600">No partner agencies have been approved yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approvedPartners.data.map((user) => {
                                const roleDisplay = getRoleDisplay(user.role);
                                return (
                                    <div key={user.id} className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{user.name}</h3>
                                                    <Badge className={`px-2 py-1 text-xs font-medium ${roleDisplay.color}`}>
                                                        {roleDisplay.label}
                                                    </Badge>
                                                    <Badge className="bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Approved</Badge>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{user.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>Approved: {formatDate(user.updated_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <Button asChild className="bg-indigo-600 text-white hover:bg-indigo-700" size="sm">
                                                    <Link href={route('secretary.users.detail', user.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </Button>

                                                {user.is_active ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setUserActive(user.id, false)}
                                                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                                    >
                                                        <UserX className="h-4 w-4" />
                                                        Deactivate
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setUserActive(user.id, true)}
                                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                        Activate
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
                <PaginationControls data={approvedPartners} onPage={(page) => setFilters({ partners_page: page })} />
            </Card>
        </div>
    );
}
