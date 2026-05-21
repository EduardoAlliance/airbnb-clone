import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface PageProps {
    user?: {
        profile?: {
            notification_booking_confirmations?: boolean;
            notification_cancellation_updates?: boolean;
            notification_promotional_offers?: boolean;
            notification_review_reminders?: boolean;
            notification_newsletter?: boolean;
        } | null;
    } | null;
}

const idToKey: Record<string, string> = {
    'booking-confirmations': 'notification_booking_confirmations',
    'cancellation-updates': 'notification_cancellation_updates',
    'promotional-offers': 'notification_promotional_offers',
    'review-reminders': 'notification_review_reminders',
    'newsletter': 'notification_newsletter',
};

type ToggleProps = {
    checked: boolean;
    onChange: () => void;
    id: string;
    disabled?: boolean;
};

function Toggle({ checked, onChange, id, disabled }: ToggleProps) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-primary focus-visible:ring-offset-2 ${
                checked ? 'bg-stitch-primary' : 'bg-stitch-outline-variant'
            } disabled:opacity-50`}
        >
            <span
                className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
}

const notificationTypes = [
    {
        id: 'booking-confirmations',
        title: 'Booking confirmations',
        description: 'Receive a confirmation when your booking is completed.',
    },
    {
        id: 'cancellation-updates',
        title: 'Cancellation updates',
        description: 'Get notified when a host cancels your reservation.',
    },
    {
        id: 'promotional-offers',
        title: 'Promotional offers',
        description: 'Be the first to know about special offers and discounts.',
    },
    {
        id: 'review-reminders',
        title: 'Review reminders',
        description: 'Gentle reminders to leave a review after your stay.',
    },
    {
        id: 'newsletter',
        title: 'Newsletter',
        description: 'Monthly updates with travel inspiration and tips.',
    },
];

export default function GuestNotifications() {
    const { user } = usePage<PageProps>().props;
    const profile = user?.profile;

    const [savingId, setSavingId] = useState<string | null>(null);

    const preferences: Record<string, boolean> = {
        'booking-confirmations': profile?.notification_booking_confirmations ?? true,
        'cancellation-updates': profile?.notification_cancellation_updates ?? true,
        'promotional-offers': profile?.notification_promotional_offers ?? false,
        'review-reminders': profile?.notification_review_reminders ?? true,
        'newsletter': profile?.notification_newsletter ?? false,
    };

    function toggle(id: string) {
        const key = idToKey[id];
        if (!key) return;
        setSavingId(id);
        router.patch('/account/settings/notifications', {
            key,
            value: !preferences[id],
        }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setSavingId(null),
        });
    }

    return (
        <>
            <Head title="Notification settings" />

            <section className="bg-stitch-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(24,36,19,0.15)] border border-stitch-outline-variant/10">
                <h2 className="font-display text-headline-sm text-stitch-primary mb-6">Notifications</h2>

                <div className="space-y-4">
                    {notificationTypes.map((nt) => (
                        <div
                            key={nt.id}
                            className="flex items-start justify-between gap-4 p-4 border border-stitch-outline-variant/20 rounded-lg hover:bg-stitch-surface-container-low/50 transition-colors"
                        >
                            <div className="space-y-0.5">
                                <label
                                    htmlFor={nt.id}
                                    className="text-body-md font-medium text-stitch-on-surface cursor-pointer"
                                >
                                    {nt.title}
                                </label>
                                <p className="text-label-sm text-stitch-on-surface-variant">
                                    {nt.description}
                                </p>
                            </div>
                            <Toggle
                                id={nt.id}
                                checked={preferences[nt.id]}
                                onChange={() => toggle(nt.id)}
                                disabled={savingId === nt.id}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
