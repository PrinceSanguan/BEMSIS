import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, BarChart3, Calendar, LogOut, MessageSquare, QrCode, Settings } from 'lucide-react';
import { route } from 'ziggy-js';

interface SidebarProps {
    className?: string;
    currentPage?: string;
}

export default function Sidebar({ className, currentPage }: SidebarProps) {
    const menuItems = [
        { icon: BarChart3, label: 'Dashboard', route: 'resident.dashboard' },
        { icon: Calendar, label: 'Events', route: 'resident.events' },
        { icon: QrCode, label: 'Attendance', route: 'resident.attendance' },
        { icon: Award, label: 'Certificates', route: 'resident.certificates' },
        { icon: MessageSquare, label: 'Feedback', route: 'resident.feedback' },
        { icon: Settings, label: 'Profile', route: 'resident.profile' },
    ];

    const handleLogout = () => {
        window.location.href = route('auth.logout');
    };

    return (
        <div className={cn('flex h-full w-64 flex-col border-r bg-white', className)}>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800">Resident Portal</h2>
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
