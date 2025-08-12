import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart3, Calendar, FileText, LogOut, QrCode, Users } from 'lucide-react';
import { route } from 'ziggy-js';

interface SidebarProps {
    className?: string;
    currentPage?: string;
}

export default function Sidebar({ className, currentPage }: SidebarProps) {
    const menuItems = [
        { icon: BarChart3, label: 'Dashboard', route: 'secretary.dashboard' },
        { icon: Users, label: 'Users', route: 'secretary.users' },
        { icon: Calendar, label: 'Events', route: 'secretary.events' },
        { icon: QrCode, label: 'Attendance', route: 'secretary.attendance' },
        { icon: FileText, label: 'Content', route: 'secretary.content' },
    ];

    const handleLogout = () => {
        window.location.href = route('auth.logout');
    };

    return (
        <div className={cn('flex h-full w-64 flex-col border-r bg-white', className)}>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800">Secretary Panel</h2>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {menuItems.map((item) => (
                    <Button
                        key={item.route}
                        variant={currentPage === item.route ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3 text-left"
                        onClick={() => (window.location.href = route(item.route))}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Button>
                ))}

                <div className="mt-4 border-t pt-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </nav>
        </div>
    );
}
