import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { CircleUser, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { home, login, register } from '@/routes';
import { logout } from '@/routes';

interface NavLink {
    label: string;
    href: string;
    active?: boolean;
}

interface NavbarProps {
    title?: string;
    links?: NavLink[];
}

const defaultLinks: NavLink[] = [
    { label: 'Explore', href: '/cabins' },
    { label: 'My Bookings', href: '/account' },
    { label: 'Notifications', href: '/account/notifications' },
];

export function Navbar({
    title = 'Evergreen Retreats',
    links = defaultLinks,
}: NavbarProps) {
    const { auth } = usePage().props;
    const user = auth?.user ?? null;
    const isAdmin = auth?.is_admin ?? false;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-stitch-surface/95 shadow-sm backdrop-blur-sm">
            <nav className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop py-unit">
                <Link
                    href={home()}
                    className="font-display text-headline-sm font-semibold text-stitch-primary"
                >
                    {title}
                </Link>

                <div className="hidden items-center gap-gutter md:flex">
                    {links.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={
                                link.active
                                    ? 'border-b-2 border-stitch-primary pb-1 font-bold text-stitch-primary transition-colors duration-200 font-body'
                                    : 'font-medium text-stitch-on-surface-variant transition-colors duration-200 hover:text-stitch-primary font-body'
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 rounded-full border border-stitch-outline-variant px-3 py-1.5 transition-all hover:shadow-sm"
                            >
                                <Menu className="size-4 text-stitch-on-surface-variant" />
                                <div className="flex size-8 items-center justify-center rounded-full bg-stitch-surface-container-high">
                                    <CircleUser className="size-6 text-stitch-on-surface-variant" />
                                </div>
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stitch-outline-variant bg-stitch-surface shadow-lg">
                                    <div className="border-b border-stitch-outline-variant px-4 py-3">
                                        <p className="text-body-md font-medium text-stitch-on-surface truncate">
                                            {user.name ?? 'User'}
                                        </p>
                                        <p className="text-label-sm text-stitch-on-surface-variant truncate">
                                            {user.email ?? ''}
                                        </p>
                                    </div>
                                    <a
                                        href={isAdmin ? '/admin/dashboard' : '/account'}
                                        className="flex items-center gap-3 px-4 py-3 text-body-md text-stitch-on-surface transition-colors hover:bg-stitch-surface-container-low"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="size-4" />
                                        Dashboard
                                    </a>
                                    <Link
                                        href={logout()}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-3 px-4 py-3 text-body-md text-stitch-error transition-colors hover:bg-stitch-surface-container-low"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LogOut className="size-4" />
                                        Log out
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="text-label-md text-stitch-on-surface-variant transition-colors hover:text-stitch-primary font-body"
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-lg bg-stitch-primary px-5 py-2 text-label-md text-stitch-on-primary transition-all hover:opacity-90 font-body"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
