import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays, CreditCard, Info, Star,
    CheckCheck, MessageCircle,
} from 'lucide-react';

type Tab = 'All' | 'Bookings' | 'Messages' | 'System';

interface NotificationItem {
    id: string;
    eventName: string;
    title: string;
    createdAt?: string | null;
    description: string;
    action?: { label: string; href: string } | null;
    category: Tab;
    unread: boolean;
}

interface NotificationsCenterProps {
    notifications: NotificationItem[];
    counts: {
        all: number;
        bookings: number;
        messages: number;
        system: number;
        unread: number;
    };
    markAllReadHref: string;
}

function sectionLabel(value?: string | null): string {
    if (! value) {
        return 'Earlier';
    }

    const date = new Date(value);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    if (date >= todayStart) {
        return 'Today';
    }

    if (date >= yesterdayStart) {
        return 'Yesterday';
    }

    return 'Earlier';
}

function displayTime(value?: string | null): string {
    if (! value) {
        return 'NOW';
    }

    const date = new Date(value);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    }).toUpperCase();
}

function iconForNotification(notification: NotificationItem) {
    if (notification.eventName.includes('message')) {
        return {
            icon: MessageCircle,
            iconBg: 'bg-stitch-tertiary-fixed',
            iconColor: 'text-stitch-on-tertiary-fixed-variant',
        };
    }

    if (notification.eventName.includes('payment')) {
        return {
            icon: CreditCard,
            iconBg: 'bg-stitch-primary-fixed',
            iconColor: 'text-stitch-on-primary-fixed-variant',
        };
    }

    if (notification.eventName.includes('review')) {
        return {
            icon: Star,
            iconBg: 'bg-stitch-surface-container-highest',
            iconColor: 'text-stitch-on-surface-variant',
        };
    }

    if (notification.eventName.includes('booking')) {
        return {
            icon: CalendarDays,
            iconBg: 'bg-stitch-secondary-container',
            iconColor: 'text-stitch-on-secondary-container',
        };
    }

    return {
        icon: Info,
        iconBg: 'bg-stitch-secondary-container/40',
        iconColor: 'text-stitch-secondary',
    };
}

export default function NotificationsCenter({ notifications, counts, markAllReadHref }: NotificationsCenterProps) {
    const [activeTab, setActiveTab] = useState<Tab>('All');

    function filterItems(items: NotificationItem[]) {
        if (activeTab === 'All') return items;
        return items.filter((n) => n.category === activeTab);
    }

    const tabs: { label: Tab; count: number }[] = [
        { label: 'All', count: counts.all },
        { label: 'Bookings', count: counts.bookings },
        { label: 'Messages', count: counts.messages },
        { label: 'System', count: counts.system },
    ];

    const groupedNotifications = ['Today', 'Yesterday', 'Earlier']
        .map((section) => ({
            section,
            items: filterItems(notifications).filter((notification) => sectionLabel(notification.createdAt) === section),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <>
            <Head title="Notifications" />

            <div className="py-12 min-h-screen">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-stitch-primary mb-2">
                            Notifications
                        </h1>
                        <p className="text-body-md text-stitch-on-surface-variant max-w-xl">
                            Stay updated with your latest cabin bookings, messages from hosts, and upcoming wilderness adventures.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post(markAllReadHref)}
                        className="flex items-center gap-2 px-6 py-3 bg-stitch-primary text-stitch-on-primary rounded-lg text-label-md hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-stitch-primary/10"
                    >
                        <CheckCheck className="size-[20px]" />
                        Mark all as read ({counts.unread})
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.label}
                            onClick={() => setActiveTab(tab.label)}
                            className={`px-5 py-2 rounded-full text-label-md border transition-colors ${
                                activeTab === tab.label
                                    ? 'bg-stitch-primary-container text-stitch-on-primary-container border-stitch-primary-container'
                                    : 'bg-stitch-surface-container-low text-stitch-on-surface-variant border-stitch-outline-variant hover:bg-stitch-surface-container'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                <div className="space-y-12">
                    {groupedNotifications.length === 0 && (
                        <div className="rounded-xl border border-dashed border-stitch-outline-variant bg-stitch-surface-container-lowest p-8 text-body-md text-stitch-on-surface-variant">
                            There are no notifications in this category yet.
                        </div>
                    )}
                    {groupedNotifications.map(({ section, items }) => (
                        <section key={section}>
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="font-display text-headline-sm text-stitch-secondary">
                                    {section}
                                </h2>
                                <div className="h-[1px] flex-grow bg-stitch-outline-variant opacity-30" />
                            </div>

                            <div className="space-y-4">
                                {items.map((n) => {
                                    const iconMeta = iconForNotification(n);
                                    const Icon = iconMeta.icon;

                                    return (
                                        <div
                                            key={n.id}
                                            className={`group relative rounded-xl p-6 flex items-start gap-5 transition-all duration-300 ${
                                                n.unread
                                                    ? 'bg-stitch-surface-container-lowest border border-stitch-outline-variant/30 shadow-sm hover:shadow-md'
                                                    : 'bg-stitch-surface-container-low/50 border border-transparent hover:bg-stitch-surface-container-lowest hover:border-stitch-outline-variant/30'
                                            }`}
                                        >
                                            {n.unread && (
                                                <div className="absolute top-6 right-6 size-2 rounded-full bg-stitch-error animate-pulse" />
                                            )}

                                            <div className={`shrink-0 size-12 rounded-full ${iconMeta.iconBg} ${iconMeta.iconColor} flex items-center justify-center`}>
                                                <Icon className="size-5" />
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-display text-headline-sm text-stitch-primary text-lg">
                                                        {n.title}
                                                    </h3>
                                                    <span className="text-label-sm text-stitch-outline font-medium uppercase tracking-wider shrink-0 ml-4">
                                                        {displayTime(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-body-md text-stitch-on-surface-variant mb-2">
                                                    {n.description}
                                                </p>
                                                {n.action && (
                                                    <Link
                                                        href={n.action.href}
                                                        className="text-label-md text-stitch-secondary font-bold hover:underline"
                                                    >
                                                        {n.action.label}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
}
