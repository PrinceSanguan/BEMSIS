'use client';

// Shared layout for the four role areas. Replaces the per-page Header/Sidebar copies and the
// Captain/Secretary/Partner/Resident middleware of the Laravel app.

import BemsisLogo from '@/components/bemsis-logo';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { FlashAlerts } from '@/components/shared/flash-alerts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { consumeLogout, consumePendingRedirect, logout, ROLE_LABELS, switchRole, touchLastSeen } from '@/lib/demo/actions';
import { flash } from '@/lib/demo/flash';
import { resetDemoData, useCurrentUser, useHydrated } from '@/lib/demo/store';
import { initials } from '@/lib/format';
import { withQuery } from '@/lib/routes';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
    Award,
    BarChart3,
    Bell,
    Calendar,
    FileText,
    FlaskConical,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    MonitorSmartphone,
    QrCode,
    RotateCcw,
    Settings,
    Star,
    User as UserIcon,
    Users,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

interface RoleConfig {
    panelTitle: string;
    headerTitle: string;
    menu: MenuItem[];
    profileHref?: string;
}

const ROLE_CONFIG: Record<Role, RoleConfig> = {
    captain: {
        panelTitle: 'Admin Panel',
        headerTitle: 'Event Management',
        menu: [
            { icon: Home, label: 'Dashboard', href: '/captain/dashboard' },
            { icon: Calendar, label: 'Events', href: '/captain/events' },
            { icon: Users, label: 'Users', href: '/captain/users' },
        ],
    },
    secretary: {
        panelTitle: 'Secretary Panel',
        headerTitle: 'Community Management',
        menu: [
            { icon: BarChart3, label: 'Dashboard', href: '/secretary/dashboard' },
            { icon: Users, label: 'Users', href: '/secretary/users' },
            { icon: Calendar, label: 'Events', href: '/secretary/events' },
            { icon: QrCode, label: 'Attendance', href: '/secretary/attendance' },
            { icon: Star, label: 'Feedback', href: '/secretary/feedback' },
            { icon: FileText, label: 'Content', href: '/secretary/content' },
            { icon: MessageSquare, label: 'Announcements', href: '/secretary/announcements' },
        ],
    },
    partner_agency: {
        panelTitle: 'Partner Panel',
        headerTitle: 'Partner Dashboard',
        profileHref: '/partner/profile',
        menu: [
            { icon: BarChart3, label: 'Dashboard', href: '/partner/dashboard' },
            { icon: Calendar, label: 'Events', href: '/partner/events' },
            { icon: UserIcon, label: 'Profile', href: '/partner/profile' },
        ],
    },
    resident: {
        panelTitle: 'Resident Panel',
        headerTitle: 'Community Portal',
        profileHref: '/resident/profile',
        menu: [
            { icon: BarChart3, label: 'Dashboard', href: '/resident/dashboard' },
            { icon: Calendar, label: 'Events', href: '/resident/events' },
            { icon: QrCode, label: 'Attendance', href: '/resident/attendance' },
            { icon: MessageSquare, label: 'Feedback', href: '/resident/feedback' },
            { icon: Award, label: 'Certificates', href: '/resident/certificates' },
            { icon: Bell, label: 'Announcements', href: '/resident/announcements' },
            { icon: Settings, label: 'Profile', href: '/resident/profile' },
        ],
    },
};

const SWITCH_ROLES: Role[] = ['captain', 'secretary', 'partner_agency', 'resident'];

const STATUS_COLORS: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    declined: 'bg-red-100 text-red-800',
};

function useLogout() {
    const router = useRouter();
    return () => {
        logout();
        router.replace('/');
    };
}

function Sidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
    const pathname = usePathname();
    const config = ROLE_CONFIG[role];
    const handleLogout = useLogout();

    return (
        <div className="flex h-full w-64 flex-col overflow-y-auto border-r bg-[#1E1B4B]">
            <div className="p-6">
                <div className="flex flex-col items-center space-y-3">
                    <BemsisLogo size="md" />
                    <h2 className="text-lg font-semibold text-white">{config.panelTitle}</h2>
                </div>
            </div>

            <nav className="flex-1 space-y-2 p-4" aria-label={config.panelTitle}>
                {config.menu.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Button
                            key={item.href}
                            asChild
                            variant={active ? 'default' : 'ghost'}
                            className={cn(
                                'w-full justify-start gap-3 text-left text-indigo-100 hover:bg-indigo-700 hover:text-white',
                                active && 'bg-indigo-600 text-white',
                            )}
                        >
                            <Link href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined}>
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}

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

function Header({ role, onMobileMenuToggle }: { role: Role; onMobileMenuToggle: () => void }) {
    const user = useCurrentUser();
    const config = ROLE_CONFIG[role];
    const handleLogout = useLogout();
    const [resetOpen, setResetOpen] = useState(false);
    const displayName = user?.name ?? ROLE_LABELS[role];

    // The role guard follows the switch to the new dashboard (see consumePendingRedirect).
    const handleSwitch = (target: Role) => switchRole(target);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-white px-4 shadow-sm lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMobileMenuToggle} aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                </Button>
                {role === 'resident' && <Home className="hidden h-6 w-6 text-indigo-600 sm:block" />}
                <h1 className="truncate text-lg font-semibold text-gray-800 sm:text-xl lg:text-2xl">{config.headerTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
                <span
                    className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 xl:inline-flex"
                    title="This portfolio demo has no backend. Your changes are saved in this browser only."
                >
                    <FlaskConical className="h-3.5 w-3.5" />
                    Demo mode — data saved in this browser
                </span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex h-10 items-center gap-2 px-2 sm:px-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-indigo-100 text-sm font-medium text-indigo-600">{initials(displayName)}</AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col text-left sm:flex">
                                <span className="max-w-40 truncate text-sm font-medium text-gray-900">{displayName}</span>
                                <span className="text-xs text-gray-500">{ROLE_LABELS[role]}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                        <DropdownMenuLabel className="p-2">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600">{initials(displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
                                        <p className="truncate text-xs font-normal text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                                {user?.status && (
                                    <Badge className={cn('w-fit text-xs', STATUS_COLORS[user.status] ?? 'bg-gray-100 text-gray-800')}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </Badge>
                                )}
                            </div>
                        </DropdownMenuLabel>

                        {config.profileHref && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={config.profileHref} className="flex cursor-pointer items-center gap-2 px-2 py-2">
                                        <UserIcon className="h-4 w-4" />
                                        <span>My Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        )}

                        <DropdownMenuItem asChild>
                            <Link href="/devices" className="flex cursor-pointer items-center gap-2 px-2 py-2">
                                <MonitorSmartphone className="h-4 w-4" />
                                <span>Trusted devices</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="px-2 pt-1 pb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                            Demo: switch role
                        </DropdownMenuLabel>
                        {SWITCH_ROLES.filter((r) => r !== role).map((target) => (
                            <DropdownMenuItem
                                key={target}
                                onClick={() => handleSwitch(target)}
                                className="flex cursor-pointer items-center gap-2 px-2 py-2"
                            >
                                <Users className="h-4 w-4" />
                                <span>Login as {ROLE_LABELS[target] === 'Partner agency' ? 'Partner' : ROLE_LABELS[target]}</span>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem onClick={() => setResetOpen(true)} className="flex cursor-pointer items-center gap-2 px-2 py-2">
                            <RotateCcw className="h-4 w-4" />
                            <span>Reset demo data</span>
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

            <ConfirmDialog
                open={resetOpen}
                onOpenChange={setResetOpen}
                title="Reset demo data?"
                description="This throws away every change made in this browser (new events, registrations, uploads, approvals) and restores the original demo data."
                confirmLabel="Reset demo data"
                destructive
                onConfirm={async () => {
                    await resetDemoData();
                    flash('success', 'Demo data has been reset.');
                }}
            />
        </header>
    );
}

const ACCESS_DENIED: Record<Role, string> = {
    captain: 'Access denied. Captain privileges required',
    secretary: 'Access denied. Secretary privileges required',
    partner_agency: 'Access denied. Partner agency privileges required',
    resident: 'Access denied. Resident privileges required',
};

/** Guards a role area and renders its sidebar + header around the page. */
export function RoleShell({ role, children }: { role: Role; children: React.ReactNode }) {
    const hydrated = useHydrated();
    const user = useCurrentUser();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const allowed = user?.role === role;

    useEffect(() => {
        if (!hydrated || allowed) return;
        const pending = consumePendingRedirect();
        if (pending) {
            router.replace(pending);
            return;
        }
        if (!user) {
            if (consumeLogout()) {
                router.replace('/');
                return;
            }
            flash('error', 'Please login to access this page');
            router.replace(withQuery('/login', { redirect: pathname }));
            return;
        }
        flash('error', ACCESS_DENIED[role]);
        router.replace('/');
    }, [hydrated, allowed, user, pathname, role, router]);

    // Keeps the online indicator fresh while someone is using the app.
    useEffect(() => {
        if (!allowed) return;
        touchLastSeen();
        const timer = setInterval(touchLastSeen, 60_000);
        return () => clearInterval(timer);
    }, [allowed]);

    if (!hydrated || !allowed) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50" role="status">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <span className="sr-only">Loading…</span>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="hidden lg:block">
                <Sidebar role={role} />
            </div>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute top-0 left-0 h-full">
                        <Sidebar role={role} onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <Header role={role} onMobileMenuToggle={() => setSidebarOpen((open) => !open)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <FlashAlerts className="mb-4" />
                    {children}
                </main>
            </div>
        </div>
    );
}
