import CivicHubLogo from '@/components/civic-hub-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BarChart3, Calendar, LogOut, User } from 'lucide-react';
import { route } from 'ziggy-js';

interface SidebarProps {
    className?: string;
    currentPage?: string;
}

export default function Sidebar({ className, currentPage }: SidebarProps) {
    const menuItems = [
        { icon: BarChart3, label: 'Dashboard', route: 'partner.dashboard' },
        { icon: Calendar, label: 'Events', route: 'partner.events' },
        { icon: User, label: 'Profile', route: 'partner.profile' },
    ];

    const handleLogout = () => {
        window.location.href = route('auth.logout');
    };

    return (
        <div className={cn('flex h-full w-64 flex-col border-r bg-[#1E1B4B]', className)}>
            <div className="p-6">
                <div className="flex flex-col items-center space-y-3">
                    <CivicHubLogo size="md" />
                    <h2 className="text-lg font-semibold text-white">Partner Panel</h2>
                </div>
            </div>

            <nav className="flex-1 space-y-2 p-4">
                {menuItems.map((item) => (
                    <Button
                        key={item.route}
                        variant={currentPage === item.route ? 'default' : 'ghost'}
                        className="w-full justify-start gap-3 text-left text-indigo-100 hover:bg-indigo-700 hover:text-white"
                        onClick={() => (window.location.href = route(item.route))}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Button>
                ))}

                <div className="mt-4 border-t border-white/20 pt-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-left text-red-400 hover:bg-red-950 hover:text-red-300"
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
