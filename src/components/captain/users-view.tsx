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
import { captainUsersProps } from '@/lib/views/captain';
import { Building2, Eye, Mail, MapPin, Phone, User, Users as UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

const FILTER_KEYS = ['search', 'purok_id', 'residents_page', 'partners_page'] as const;

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getRoleColor = (role: string) => {
    switch (role) {
        case 'resident':
            return 'bg-blue-100 text-blue-800';
        case 'partner_agency':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

function ActivationButtons({ userId, isActive }: { userId: number; isActive: boolean }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button size="sm" variant="outline" asChild>
                <Link href={route('captain.users.detail', userId)}>
                    <Eye className="mr-1 h-4 w-4" />
                    View Details
                </Link>
            </Button>

            {isActive ? (
                <Button size="sm" variant="outline" onClick={() => setUserActive(userId, false)} className="text-red-600 hover:text-red-700">
                    Deactivate
                </Button>
            ) : (
                <Button size="sm" variant="outline" onClick={() => setUserActive(userId, true)} className="text-indigo-600 hover:text-indigo-700">
                    Activate
                </Button>
            )}
        </div>
    );
}

export default function CaptainUsersView() {
    const db = useDb();
    const { filters: urlFilters, setFilters } = useUrlFilters(FILTER_KEYS);
    const { residents, partners, puroks, filters } = useMemo(() => captainUsersProps(db, urlFilters), [db, urlFilters]);
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedPurok, setSelectedPurok] = useState(filters.purok_id);
    const [activeTab, setActiveTab] = useState<'residents' | 'partners'>('residents');

    const handleSearch = (search: string, purokId: string) => {
        setFilters({
            search: search || null,
            purok_id: purokId !== 'all' ? purokId : null,
        });
    };

    const handleSearchSubmit = (e: FormEvent) => {
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

    const handlePagination = (page: number, type: 'residents' | 'partners') => {
        setFilters(type === 'residents' ? { residents_page: page } : { partners_page: page });
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">User Management</h1>
                <p className="text-sm text-gray-600 sm:text-base">View and manage community members and partner agencies</p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            type="button"
                            onClick={() => setActiveTab('residents')}
                            aria-current={activeTab === 'residents' ? 'page' : undefined}
                            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                                activeTab === 'residents'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Residents ({residents.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('partners')}
                            aria-current={activeTab === 'partners' ? 'page' : undefined}
                            className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                                activeTab === 'partners'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            Partner Agencies ({partners.total})
                        </button>
                    </nav>
                </div>
            </div>

            {/* Residents Section */}
            {activeTab === 'residents' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Approved Residents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search and Filter Controls */}
                        <div className="mb-6 space-y-4">
                            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 md:flex-row">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search by name, email..."
                                        aria-label="Search residents"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={selectedPurok} onValueChange={handlePurokChange}>
                                        <SelectTrigger className="w-40" aria-label="Filter by Purok">
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

                        {residents.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No residents found</h3>
                                <p className="mt-1 text-sm text-gray-500">No approved residents to display.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {residents.data.map((user) => (
                                    <div key={user.id} className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-medium text-gray-900 sm:text-lg">{user.name}</h3>
                                                    <Badge className={`px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>Resident</Badge>
                                                </div>
                                                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
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
                                                        <span>Joined: {formatDate(user.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ActivationButtons userId={user.id} isActive={user.is_active} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <PaginationControls data={residents} onPage={(page) => handlePagination(page, 'residents')} />
                    </CardContent>
                </Card>
            )}

            {/* Partners Section */}
            {activeTab === 'partners' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Approved Partner Agencies
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {partners.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No partner agencies found</h3>
                                <p className="mt-1 text-sm text-gray-500">No approved partner agencies to display.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {partners.data.map((user) => (
                                    <div key={user.id} className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-base font-medium text-gray-900 sm:text-lg">
                                                        {user.agency_name || user.name}
                                                    </h3>
                                                    <Badge className={`px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        Partner Agency
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span>
                                                            {user.representative_first_name && user.representative_last_name
                                                                ? `${user.representative_first_name} ${user.representative_last_name}`
                                                                : user.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{user.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{user.phone}</span>
                                                    </div>
                                                    {user.agency_address && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>{user.agency_address}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <span>Joined: {formatDate(user.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ActivationButtons userId={user.id} isActive={user.is_active} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <PaginationControls data={partners} onPage={(page) => handlePagination(page, 'partners')} />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
