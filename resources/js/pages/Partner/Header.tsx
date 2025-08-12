import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Menu, User } from 'lucide-react';
import { route } from 'ziggy-js';

interface HeaderProps {
    userName?: string;
    onMobileMenuToggle?: () => void;
}

export default function Header({ userName = 'Partner', onMobileMenuToggle }: HeaderProps) {
    const handleLogout = () => {
        window.location.href = route('auth.logout');
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMobileMenuToggle}>
                <Menu className="h-5 w-5" />
            </Button>

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-800 lg:text-2xl">Partner Dashboard</h1>

            {/* User dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">{userName}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
