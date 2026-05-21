import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck, MapPin, Users, ChevronRight, CircleUser, ArrowRight, MoreHorizontal } from 'lucide-react';

interface DashboardBooking {
    title: string;
    location?: string;
    checkIn?: string | null;
    nights: number;
    guests: number;
    status: string;
    imageUrl: string;
    showHref: string;
}

interface PastBooking {
    id: number;
    title: string;
    dates: string;
    guests: string;
    status: string;
    imageUrl: string;
    showHref: string;
    cabinHref: string;
}

interface DashboardNotification {
    id: string;
    title: string;
    description: string;
    createdAt?: string | null;
    unread: boolean;
    action?: {
        label: string;
        href: string;
    } | null;
}

interface DashboardProps {
    upcomingBooking: DashboardBooking | null;
    pastBookings: PastBooking[];
    notifications: DashboardNotification[];
    stats: {
        upcomingCount: number;
        pastCount: number;
        unreadNotifications: number;
    };
}

function formatStayDate(value?: string | null): string {
    if (! value) {
        return 'TBD';
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function relativeTime(value?: string | null): string {
    if (! value) {
        return 'Just now';
    }

    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) {
        return 'Just now';
    }

    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days === 1) {
        return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export default function GuestDashboard({ upcomingBooking, pastBookings, notifications, stats }: DashboardProps) {
    const { auth } = usePage().props as { auth: { user?: { name?: string } } };
    const firstName = auth.user?.name?.split(' ')[0] ?? 'traveler';

    return (
        <>
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter py-12">
                <div className="lg:col-span-8 space-y-12">
                    <header className="space-y-2">
                        <h1 className="font-display text-display-lg text-stitch-primary">
                            Welcome back, {firstName}.
                        </h1>
                        <p className="text-body-lg text-stitch-on-surface-variant">
                            Track your next stay, revisit past cabins, and keep an eye on booking updates in one place.
                        </p>
                    </header>

                    <section className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="font-display text-headline-md text-stitch-primary">Upcoming</h2>
                            <span className="text-label-md text-stitch-secondary uppercase tracking-wider">{stats.upcomingCount} Booking Found</span>
                        </div>

                        {upcomingBooking ? (
                            <div className="group bg-stitch-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-stitch-outline-variant/20">
                                <div className="flex flex-col md:flex-row">
                                    <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                                        <img
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            src={upcomingBooking.imageUrl}
                                            alt=""
                                        />
                                        <div className="absolute top-4 left-4 bg-stitch-primary text-stitch-on-primary px-3 py-1 rounded-full text-label-sm font-semibold">
                                            {upcomingBooking.status}
                                        </div>
                                    </div>
                                    <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-display text-headline-sm text-stitch-primary">
                                                        {upcomingBooking.title}
                                                    </h3>
                                                    <p className="text-label-sm text-stitch-on-surface-variant flex items-center mt-1">
                                                        <MapPin className="size-[16px] mr-1" />
                                                        {upcomingBooking.location}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-label-sm text-stitch-on-surface-variant">Check-in</p>
                                                    <p className="text-body-md font-bold text-stitch-primary">{formatStayDate(upcomingBooking.checkIn)}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-gutter py-4 border-y border-stitch-outline-variant/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-stitch-surface-container-low flex items-center justify-center text-stitch-primary">
                                                        <CalendarCheck className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-label-sm text-[10px] text-stitch-on-surface-variant uppercase">Duration</p>
                                                        <p className="text-label-md">{upcomingBooking.nights} Nights</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-stitch-surface-container-low flex items-center justify-center text-stitch-primary">
                                                        <Users className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-label-sm text-[10px] text-stitch-on-surface-variant uppercase">Guests</p>
                                                        <p className="text-label-md">{upcomingBooking.guests} Adults</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex flex-wrap gap-unit">
                                            <Link href={upcomingBooking.showHref} className="bg-stitch-primary text-stitch-on-primary px-6 py-2 rounded-lg text-label-md hover:opacity-90 transition-all flex items-center">
                                                Manage Booking
                                                <ArrowRight className="ml-2 size-[18px]" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-stitch-outline-variant bg-stitch-surface-container-lowest p-8">
                                <h3 className="font-display text-headline-sm text-stitch-primary">No upcoming stays yet</h3>
                                <p className="mt-2 text-body-md text-stitch-on-surface-variant">
                                    When you reserve a cabin, it will appear here with your trip details and quick actions.
                                </p>
                                <Link
                                    href="/cabins"
                                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stitch-primary px-5 py-3 text-label-md text-stitch-on-primary"
                                >
                                    Explore cabins
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        )}
                    </section>

                    <section className="space-y-6">
                        <div className="border-b border-stitch-outline-variant/30 flex gap-8">
                            <button className="pb-4 text-label-md text-stitch-primary border-b-2 border-stitch-primary">Past Bookings</button>
                        </div>

                        <div className="space-y-4">
                            {pastBookings.length === 0 && (
                                <div className="rounded-xl border border-dashed border-stitch-outline-variant bg-stitch-surface-container-lowest p-8 text-body-md text-stitch-on-surface-variant">
                                    Your completed and past reservations will show up here.
                                </div>
                            )}
                            {pastBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between p-6 bg-stitch-surface-container-lowest rounded-lg border border-stitch-outline-variant/10 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="size-20 rounded-lg overflow-hidden bg-stitch-surface-variant shrink-0">
                                            <img className="w-full h-full object-cover" src={booking.imageUrl} alt="" />
                                        </div>
                                        <div>
                                            <h4 className="text-body-lg font-bold text-stitch-primary">{booking.title}</h4>
                                            <p className="text-label-sm text-stitch-on-surface-variant">
                                                {booking.dates} &middot; {booking.guests}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-gutter">
                                        <div className="hidden md:block">
                                            <span className="bg-stitch-surface-container text-stitch-on-surface-variant px-3 py-1 rounded-full text-label-sm">
                                                {booking.status}
                                            </span>
                                        </div>
                                        <Link href={booking.cabinHref} className="text-stitch-secondary text-label-md hover:underline">Rebook Cabin</Link>
                                        <Link href={booking.showHref} className="text-stitch-outline cursor-pointer p-1 hover:bg-stitch-surface-container-low rounded">
                                            <MoreHorizontal className="size-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="lg:col-span-4 space-y-gutter">
                        <div className="bg-stitch-surface-container-low rounded-xl p-gutter border border-stitch-outline-variant/20 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-display text-[20px] text-stitch-primary">Notifications</h3>
                                <span className="bg-stitch-tertiary-container text-stitch-on-tertiary-container size-5 rounded-full text-[10px] flex items-center justify-center font-bold">{stats.unreadNotifications}</span>
                            </div>
                            <div className="space-y-gutter">
                                {notifications.length === 0 && (
                                    <p className="text-label-md text-stitch-on-surface-variant">
                                        You&apos;re all caught up.
                                    </p>
                                )}
                                {notifications.map((n) => (
                                    <div key={n.id} className={`flex gap-4 group ${!n.unread ? 'opacity-60' : ''}`}>
                                        <div className={`mt-1 size-2 rounded-full shrink-0 ${n.unread ? 'bg-stitch-secondary' : 'bg-stitch-outline-variant'}`} />
                                        <div className="space-y-1">
                                            <p className={`text-label-md leading-tight ${n.unread ? 'text-stitch-primary' : 'text-stitch-on-surface-variant'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-label-sm text-stitch-on-surface-variant leading-tight">{n.description}</p>
                                            <p className="text-label-sm text-stitch-on-surface-variant text-[11px]">{relativeTime(n.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href="/account/notifications" className="block w-full mt-8 py-2 text-center text-label-md text-stitch-primary border border-stitch-primary/20 rounded-lg hover:bg-stitch-primary/5 transition-colors">
                                View All Notifications
                            </Link>
                        </div>

                    {/* <div className="relative rounded-xl overflow-hidden group">
                        <img
                            className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnsoJeKEUtPCrRH19ZgQTwPp9Vgh3yrVfSN35-4WbXOgS8svPiwTL-qzTMl2T5-VHKATkJu7B_KPSEp93UQuUWBY-EpxfQsDJ72tXSjMMyepOi24Dup6N0eQGFEftjL0rhsTs-qav9Xuh8n2kLyofQerbysQdeBIzIAgHm6qKCni7rXGLxYbUP0ChXID0t4OlITRnNX748SUEjYAkWgDPHke-0NTZLo8mioM6otOSt2kypaTIeHG-bt5akVa-mNSZt_yoYNYQT_jmA"
                            alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
                            <h4 className="font-display text-headline-sm mb-2">Winter is calling.</h4>
                            <p className="text-body-md text-white/80 mb-4">Book your December retreat today and save 15%.</p>
                            <button className="bg-white text-stitch-primary py-2 px-4 rounded-lg text-label-md w-fit hover:bg-stitch-surface-bright transition-colors">
                                Explore Winter Cabins
                            </button>
                        </div>
                    </div> */}

                    <Link
                        href="/account/settings/profile"
                        className="bg-stitch-surface-container rounded-xl p-gutter border border-stitch-outline-variant/10 flex items-center justify-between cursor-pointer hover:bg-stitch-surface-container-high transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <CircleUser className="size-5 text-stitch-secondary" />
                            <span className="text-label-md text-stitch-primary">Account Settings</span>
                        </div>
                        <ChevronRight className="size-5 text-stitch-outline-variant" />
                    </Link>
                </aside>
            </div>
        </>
    );
}
