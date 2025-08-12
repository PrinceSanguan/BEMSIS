import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/pages/Secretary/Header';
import Sidebar from '@/pages/Secretary/Sidebar';
import { Head } from '@inertiajs/react';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { useState } from 'react';

// Mock data
const mockUsers = [
    {
        id: 1,
        name: 'Juan Dela Cruz',
        email: 'juan@email.com',
        phone: '09123456789',
        role: 'resident',
        purok: 'Purok 1',
        status: 'pending',
        registeredAt: '2025-08-10',
    },
    {
        id: 2,
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '09987654321',
        role: 'partner_agency',
        purok: null,
        status: 'pending',
        registeredAt: '2025-08-11',
    },
    {
        id: 3,
        name: 'Pedro Garcia',
        email: 'pedro@email.com',
        phone: '09555123456',
        role: 'resident',
        purok: 'Purok 3',
        status: 'approved',
        registeredAt: '2025-08-09',
    },
];

type UserStatus = 'pending' | 'approved' | 'disapproved';

export default function Users() {
    const [users, setUsers] = useState(mockUsers);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleUserAction = (userId: number, action: 'approved' | 'disapproved') => {
        setUsers(users.map((user) => (user.id === userId ? { ...user, status: action as UserStatus } : user)));
    };

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'disapproved':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getRoleDisplay = (role: string) => {
        return role === 'partner_agency' ? 'Partner Agency' : 'Resident';
    };

    return (
        <>
            <Head title="User Management" />
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
                    <Header userName="Secretary" onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                            <p className="text-gray-600">Review and approve user registrations</p>
                        </div>

                        <div className="grid gap-4 md:gap-6">
                            {users.map((user) => (
                                <Card key={user.id} className="shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <User className="h-5 w-5" />
                                                {user.name}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Badge variant="outline">{getRoleDisplay(user.role)}</Badge>
                                                <Badge className={getStatusColor(user.status)}>
                                                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <span>{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span>{user.phone}</span>
                                            </div>
                                            {user.purok && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span>{user.purok}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600">Registered: {user.registeredAt}</p>

                                        {user.status === 'pending' && (
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUserAction(user.id, 'approved')}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleUserAction(user.id, 'disapproved')}>
                                                    Disapprove
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
