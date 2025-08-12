import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, LogOut } from 'lucide-react';
import { route } from 'ziggy-js';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const handleLogout = () => {
        // Frontend only - replace with actual logout logic
        window.location.href = route('auth.login');
    };

    return (
        <div className={cn('flex h-full w-64 flex-col border-r bg-white', className)}>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                <Button variant="ghost" className="w-full justify-start gap-3 text-left" onClick={() => (window.location.href = route('dashboard'))}>
                    <Home className="h-4 w-4" />
                    Dashboard
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </nav>
        </div>
    );
}
