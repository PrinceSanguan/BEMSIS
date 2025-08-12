import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, usePage } from '@inertiajs/react';
import { Home, LogOut, Menu, User } from 'lucide-react';
import { route } from 'ziggy-js';

interface HeaderProps {
    userName?: string;
    onMobileMenuToggle?: () => void;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
}

interface PageProps {
    [key: string]: any;
    auth?: {
        user: User;
    };
}
export default function Header({ userName, onMobileMenuToggle }: HeaderProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    // Use provided userName or extract from user object
    const displayName = userName || user?.name || 'Resident User';

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = () => {
        window.location.href = route('auth.logout');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'declined':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:px-6">
            {/* Left section */}
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMobileMenuToggle}>
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Title */}
                <div className="flex items-center gap-2">
                    <Home className="h-6 w-6 text-blue-600" />
                    <h1 className="text-xl font-semibold text-gray-800 lg:text-2xl">Community Portal</h1>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
                {/* User dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex h-10 items-center gap-2 px-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" alt={displayName} />
                                <AvatarFallback className="bg-blue-100 text-sm font-medium text-blue-600">{getInitials(displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col text-left sm:flex">
                                <span className="text-sm font-medium text-gray-900">{displayName}</span>
                                <span className="text-xs text-gray-500">Resident</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                        <DropdownMenuLabel className="p-2">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src="" alt={displayName} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                                {user?.status && (
                                    <Badge className={`text-xs ${getStatusColor(user.status)} w-fit`}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </Badge>
                                )}
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link href={route('resident.profile')} className="flex cursor-pointer items-center gap-2 px-2 py-2">
                                <User className="h-4 w-4" />
                                <span>My Profile</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex cursor-pointer items-center gap-2 px-2 py-2 text-red-600 focus:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
