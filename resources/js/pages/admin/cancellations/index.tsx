import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Ban, DollarSign, TrendingDown, Receipt } from 'lucide-react';

interface CancellationItem {
    id: number;
    booking_id: number;
    reservation_id: string;
    property: string;
    guest_name: string;
    cancelled_by: string;
    cancelled_at: string;
    total: number;
    subtotal: number;
    cleaning_fee: number;
    service_fee: number;
    refund_amount: number;
    platform_retained: number;
    reason: string | null;
    policy_snapshot: Record<string, any> | null;
}

interface PaginatedData<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
}

interface Props {
    cancellations: PaginatedData<CancellationItem>;
    totals: {
        total_cancelled: number;
        total_refunded: number;
        total_platform_kept: number;
        total_gross: number;
    };
    filters: { search?: string };
}

export default function CancellationsIndex({ cancellations, totals, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleFilter() {
        router.get('/admin/cancellations', { search: search || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    const stats = [
        {
            label: 'Total Cancelled',
            value: totals.total_cancelled,
            icon: Ban,
            color: 'text-stitch-error bg-stitch-error/10',
        },
        {
            label: 'Gross Revenue Lost',
            value: `$${totals.total_gross.toFixed(2)}`,
            icon: TrendingDown,
            color: 'text-orange-600 bg-orange-50',
        },
        {
            label: 'Total Refunded',
            value: `$${totals.total_refunded.toFixed(2)}`,
            icon: DollarSign,
            color: 'text-green-600 bg-green-50',
        },
        {
            label: 'Platform Retained',
            value: `$${totals.total_platform_kept.toFixed(2)}`,
            icon: Receipt,
            color: 'text-stitch-primary bg-stitch-primary/10',
        },
    ];

    return (
        <>
            <Head title="Cancellations" />

            <header className="mb-8">
                <h2 className="font-display text-display-lg text-stitch-primary mb-2">Cancellations</h2>
                <p className="text-body-lg text-stitch-on-surface-variant">
                    Track all cancelled reservations and refunds
                </p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter flex items-center gap-4">
                        <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                            <stat.icon className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-label-sm text-stitch-on-surface-variant font-medium truncate">{stat.label}</p>
                            <p className="font-display text-headline-md text-stitch-primary font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10">
                <div className="p-gutter border-b border-stitch-outline-variant/10">
                    <div className="flex gap-3 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stitch-on-surface-variant" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Search by guest, property, or reason..."
                                className="w-full pl-10 pr-4 py-2 border border-stitch-outline-variant rounded-lg text-body-md bg-transparent focus:outline-none focus:border-stitch-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-label-sm text-stitch-on-surface-variant border-b border-stitch-outline-variant/10">
                                <th className="text-left px-gutter py-4 font-medium">Reservation</th>
                                <th className="text-left px-gutter py-4 font-medium">Property</th>
                                <th className="text-left px-gutter py-4 font-medium">Guest</th>
                                <th className="text-left px-gutter py-4 font-medium">Cancelled By</th>
                                <th className="text-left px-gutter py-4 font-medium">Date</th>
                                <th className="text-right px-gutter py-4 font-medium">Total</th>
                                <th className="text-right px-gutter py-4 font-medium">Refund</th>
                                <th className="text-right px-gutter py-4 font-medium">Kept</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cancellations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-gutter py-12 text-center text-stitch-on-surface-variant">
                                        <Ban className="size-8 mx-auto mb-3 opacity-40" />
                                        <p className="text-body-md">No cancellations found.</p>
                                    </td>
                                </tr>
                            ) : (
                                cancellations.data.map((c) => (
                                    <tr key={c.id} className="border-b border-stitch-outline-variant/5 hover:bg-stitch-surface-container-low transition-colors">
                                        <td className="px-gutter py-4">
                                            <Link
                                                href={`/admin/reservations/${c.booking_id}`}
                                                className="font-bold text-stitch-primary hover:underline"
                                            >
                                                {c.reservation_id}
                                            </Link>
                                        </td>
                                        <td className="px-gutter py-4 text-body-md text-stitch-on-surface">
                                            {c.property}
                                        </td>
                                        <td className="px-gutter py-4 text-body-md text-stitch-on-surface">
                                            {c.guest_name}
                                        </td>
                                        <td className="px-gutter py-4 text-label-sm text-stitch-on-surface-variant">
                                            {c.cancelled_by}
                                        </td>
                                        <td className="px-gutter py-4 text-label-sm text-stitch-on-surface-variant">
                                            {c.cancelled_at}
                                        </td>
                                        <td className="px-gutter py-4 text-right font-bold text-stitch-on-surface">
                                            ${c.total.toFixed(2)}
                                        </td>
                                        <td className="px-gutter py-4 text-right">
                                            <span className={`font-semibold ${c.refund_amount > 0 ? 'text-green-600' : 'text-stitch-on-surface-variant/60'}`}>
                                                ${c.refund_amount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-gutter py-4 text-right text-stitch-on-surface-variant">
                                            ${c.platform_retained.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {cancellations.meta.total > 15 && (
                    <div className="px-gutter py-4 border-t border-stitch-outline-variant/10 flex justify-between items-center text-label-sm text-stitch-on-surface-variant">
                        <span>
                            Showing {cancellations.meta.from}–{cancellations.meta.to} of {cancellations.meta.total}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}
