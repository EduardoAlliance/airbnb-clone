import { CalendarCheck, DollarSign, Home, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
    stats: {
        totalProperties: number;
        publishedProperties: number;
        activeBookings: number;
        monthlyRevenue: number;
    };
}

const cards = [
    {
        key: 'totalProperties',
        label: 'Total Properties',
        icon: Home,
        iconBg: 'bg-stitch-primary-fixed',
        iconColor: 'text-stitch-on-primary-fixed',
        format: (v: number) => v.toString(),
    },
    {
        key: 'publishedProperties',
        label: 'Published',
        icon: TrendingUp,
        iconBg: 'bg-stitch-secondary-fixed',
        iconColor: 'text-stitch-on-secondary-fixed',
        format: (v: number) => v.toString(),
    },
    {
        key: 'activeBookings',
        label: 'Active Bookings',
        icon: CalendarCheck,
        iconBg: 'bg-stitch-tertiary-fixed',
        iconColor: 'text-stitch-on-tertiary-fixed',
        format: (v: number) => v.toString(),
    },
    {
        key: 'monthlyRevenue',
        label: 'Revenue This Month',
        icon: DollarSign,
        iconBg: 'bg-stitch-primary-fixed',
        iconColor: 'text-stitch-on-primary-fixed',
        format: (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
];

export function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {cards.map((card) => (
                <div
                    key={card.key}
                    className="bg-stitch-surface-container-lowest p-gutter rounded-xl shadow-soft border border-stitch-outline-variant/10 flex items-center gap-4"
                >
                    <div className={`p-3 ${card.iconBg} rounded-lg shrink-0`}>
                        <card.icon className={`size-6 ${card.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-label-sm text-stitch-on-surface-variant font-medium truncate">
                            {card.label}
                        </p>
                        <h3 className="font-display text-headline-md text-stitch-primary mt-1">
                            {card.format(stats[card.key as keyof typeof stats])}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}
