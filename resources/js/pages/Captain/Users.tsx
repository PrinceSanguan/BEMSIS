import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/pages/Captain/Header';
import Sidebar from '@/pages/Captain/Sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import { Building2, CheckCircle, Eye, Mail, MapPin, Phone, User, Users as UsersIcon, XCircle } from 'lucide-react';
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

    // Partner-specific fields
    agency_name?: string;
    representative_first_name?: string;
    representative_last_name?: string;
    agency_address?: string;
    agency_contact_number?: string;
}

interface PaginatedData {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search: string;
    purok_id: string;
}

interface Props {
    residents: PaginatedData;
    partners: PaginatedData;
    puroks: Purok[];
    filters: Filters;
}

interface PageProps {
    [key: string]: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Users({ residents, partners, puroks, filters }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search);
    const [selectedPurok, setSelectedPurok] = useState(filters.purok_id);
    const [activeTab, setActiveTab] = useState<'residents' | 'partners'>('residents');

    const handleSearch = (search: string, purokId: string) => {
        router.get(
            route('captain.users'),
            {
                search: search || undefined,
                purok_id: purokId !== 'all' ? purokId : undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
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

    const handlePagination = (page: number, type: 'residents' | 'partners') => {
        const pageParam = type === 'residents' ? 'residents_page' : 'partners_page';
        router.get(route('captain.users'), { [pageParam]: page }, { preserveState: true });
    };

    const PaginationControls = ({ data, type }: { data: PaginatedData; type: 'residents' | 'partners' }) => {
        if (data.last_page <= 1) return null;

        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <Button variant="outline" onClick={() => handlePagination(data.current_page - 1, type)} disabled={data.current_page === 1}>
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handlePagination(data.current_page + 1, type)}
                        disabled={data.current_page === data.last_page}
                    >
                        Next
                    </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{data.from}</span> to <span className="font-medium">{data.to}</span> of{' '}
                            <span className="font-medium">{data.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePagination(data.current_page - 1, type)}
                                disabled={data.current_page === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2"
                            >
                                Previous
                            </Button>
                            {Array.from({ length: data.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={page === data.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handlePagination(page, type)}
                                    className="relative inline-flex items-center px-4 py-2"
                                >
                                    {page}
                                </Button>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePagination(data.current_page + 1, type)}
                                disabled={data.current_page === data.last_page}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2"
                            >
                                Next
                            </Button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="User Management - Captain" />
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

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
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

                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600">View and manage community members and partner agencies</p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('residents')}
                                        className={`border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                                            activeTab === 'residents'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    >
                                        Residents ({residents.total})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('partners')}
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

                                    {residents.data.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No residents found</h3>
                                            <p className="mt-1 text-sm text-gray-500">No approved residents to display.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {residents.data.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                                                <Badge className={getRoleColor(user.role)}>Resident</Badge>
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
                                                        <div className="ml-4 flex flex-shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => router.get(route('captain.users.detail', user.id))}
                                                            >
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <PaginationControls data={residents} type="residents" />
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
                                                <div
                                                    key={user.id}
                                                    className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-lg font-medium text-gray-900">{user.agency_name || user.name}</h3>
                                                                <Badge className={getRoleColor(user.role)}>Partner Agency</Badge>
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
                                                                    <span>{user.agency_contact_number || user.phone}</span>
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
                                                        <div className="ml-4 flex flex-shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => router.get(route('captain.users.detail', user.id))}
                                                            >
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <PaginationControls data={partners} type="partners" />
                                </CardContent>
                            </Card>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
