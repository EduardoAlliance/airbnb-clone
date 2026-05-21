import { Link, usePage, router } from '@inertiajs/react';
import {
    Ban,
    BarChart3,
    CalendarCheck,
    Home,
    LayoutDashboard,
    LogOut,
    Plus,
    Settings,
    ScrollText,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Properties', href: '/admin/properties', icon: Home },
    { label: 'Reservations', href: '/admin/reservations', icon: CalendarCheck },
    { label: 'Cancellations', href: '/admin/cancellations', icon: Ban },
    { label: 'Policies', href: '/admin/policies', icon: ScrollText },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/settings/profile', icon: Settings },
];

export function AdminSidebar() {
    const { auth } = usePage().props;
    const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';

    function isActive(href: string) {
        if (href === '#') return false;
        if (href === '/dashboard') return currentPath === '/dashboard';
        return currentPath.startsWith(href);
    }

    function handleLogout() {
        router.post('/logout');
    }

    return (
        <>
            <aside className="hidden md:flex flex-col sticky top-0 h-screen p-unit space-y-2 bg-stitch-surface-container-low border-r border-stitch-outline-variant w-64 flex-shrink-0 overflow-x-hidden">
                <div className="px-unit py-gutter mb-unit">
                    <h1 className="font-display text-label-md text-stitch-primary">
                        Evergreen Management
                    </h1>
                    <p className="text-stitch-on-surface-variant text-label-sm">
                        Admin Portal
                    </p>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body-md transition-all duration-200 ${
                                isActive(item.href)
                                    ? 'bg-stitch-primary-container text-stitch-on-primary-container font-bold border-l-[3px] border-stitch-primary rounded-l-none'
                                    : 'text-stitch-on-surface-variant hover:bg-stitch-surface-container-high border-l-[3px] border-transparent'
                            }`}
                        >
                            <item.icon className="size-5 shrink-0" />
                            <span className="text-body-md truncate">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="pt-unit border-t border-stitch-outline-variant">
                    <Link
                        href="/admin/properties/create"
                        className="w-full bg-stitch-primary text-stitch-on-primary py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-label-md"
                    >
                        <Plus className="size-5" />
                        Add New Cabin
                    </Link>
                </div>

                <div className="flex items-center gap-3 p-unit">
                    <div className="size-10 rounded-full bg-stitch-secondary-container overflow-hidden border border-stitch-outline-variant flex items-center justify-center text-label-sm font-bold text-stitch-on-secondary-container shrink-0">
                        {auth?.user?.name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase() ?? 'AD'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-label-md font-bold text-stitch-primary truncate">
                            {auth?.user?.name ?? 'Admin User'}
                        </p>
                        <p className="text-label-sm text-stitch-on-surface-variant truncate">
                            {auth?.user?.email ?? 'admin@example.com'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="shrink-0 p-2 rounded-lg text-stitch-on-surface-variant hover:bg-stitch-surface-container-high hover:text-stitch-error transition-colors"
                        title="Logout"
                    >
                        <LogOut className="size-5" />
                    </button>
                </div>
            </aside>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stitch-surface border-t border-stitch-outline-variant/20 px-gutter py-3 flex justify-around items-center z-50">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 ${
                            isActive(item.href)
                                ? 'text-stitch-primary'
                                : 'text-stitch-on-surface-variant'
                        }`}
                    >
                        <item.icon
                            className={`size-5 ${isActive(item.href) ? 'text-stitch-primary' : ''}`}
                        />
                        <span
                            className={`text-[10px] ${
                                isActive(item.href) ? 'font-bold' : ''
                            }`}
                        >
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>
        </>
    );
}
