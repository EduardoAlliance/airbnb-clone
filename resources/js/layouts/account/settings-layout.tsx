import { Link, usePage } from '@inertiajs/react';
import { Bell, CreditCard, ShieldCheck, User } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';

const navItems = [
    { title: 'Profile Information', href: '/account/settings/profile', icon: User },
    { title: 'Security', href: '/account/settings/security', icon: ShieldCheck },
    { title: 'Payment Methods', href: '/account/settings/payments', icon: CreditCard },
    { title: 'Notifications', href: '/account/settings/notifications', icon: Bell },
];

export default function GuestSettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col md:flex-row gap-gutter py-8">
            <aside className="w-full md:w-64 shrink-0">
                <nav className="flex flex-col gap-2">
                    {navItems.map((item) => {
                        const active = isCurrentOrParentUrl(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    active
                                        ? 'bg-stitch-primary-container text-stitch-on-primary-container font-bold'
                                        : 'text-stitch-on-surface-variant hover:bg-stitch-surface-variant hover:text-stitch-on-surface'
                                }`}
                            >
                                <item.icon className="size-5" />
                                <span className="text-label-md">{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-gutter p-gutter bg-stitch-surface-container-low rounded-xl border border-stitch-outline-variant/30">
                    <p className="text-label-sm text-stitch-on-surface-variant mb-2 uppercase tracking-wider">Member Since</p>
                    <p className="text-body-md text-stitch-primary font-semibold">October 2023</p>
                </div>
            </aside>

            <div className="flex-grow space-y-gutter min-w-0">
                {children}
            </div>
        </div>
    );
}
