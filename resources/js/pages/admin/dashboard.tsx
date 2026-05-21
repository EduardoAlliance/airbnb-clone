import { Head } from '@inertiajs/react';
import { StatsCards } from '@/components/admin/stats-cards';
import {
    CalendarCheck,
    MoreHorizontal,
    TreePine,
} from 'lucide-react';
import { BookingStatusBadge } from '@/components/admin/booking-status-badge';

interface Booking {
    id: number;
    property: string;
    guest: string;
    dates: string;
    total: number;
    status: string;
}

interface Props {
    stats: {
        totalProperties: number;
        publishedProperties: number;
        activeBookings: number;
        monthlyRevenue: number;
    };
    recentBookings: Booking[];
    bookingChart: { label: string; value: number }[];
}

export default function Dashboard({ stats, recentBookings, bookingChart }: Props) {
    const maxChartValue = Math.max(...bookingChart.map((d) => d.value), 1);

    return (
        <>
            <Head title="Dashboard" />

            <header className="mb-10">
                <h2 className="font-display text-display-lg text-stitch-primary">
                    Dashboard Overview
                </h2>
                <p className="text-body-md text-stitch-on-surface-variant">
                    Welcome back. Here is what is happening today.
                </p>
            </header>

            <section className="mb-12">
                <StatsCards stats={stats} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                <section className="lg:col-span-2 bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                    <div className="p-gutter border-b border-stitch-outline-variant/10">
                        <h4 className="font-display text-headline-sm text-stitch-primary">
                            Revenue Trends
                        </h4>
                        <p className="text-label-sm text-stitch-on-surface-variant">
                            Last 6 months
                        </p>
                    </div>
                    <div className="p-gutter h-64 flex items-end gap-4">
                        {bookingChart.length === 0 && (
                            <div className="w-full flex items-center justify-center h-full text-stitch-on-surface-variant text-body-md">
                                No data available yet.
                            </div>
                        )}
                        {bookingChart.map((d) => (
                            <div key={d.label} className="flex-1 flex flex-col items-center group relative">
                                <div
                                    className={`w-full rounded-t-lg transition-colors ${
                                        d.value === maxChartValue
                                            ? 'bg-stitch-primary'
                                            : 'bg-stitch-primary-fixed/40 group-hover:bg-stitch-primary-fixed'
                                    }`}
                                    style={{ height: `${maxChartValue > 0 ? (d.value / maxChartValue) * 100 : 0}%` }}
                                >
                                    {d.value > 0 && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-stitch-primary text-stitch-on-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            ${d.value.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <span className="mt-2 text-label-sm text-stitch-on-surface-variant">
                                    {d.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                    <h4 className="font-display text-headline-sm text-stitch-primary mb-4">
                        Quick Actions
                    </h4>
                    <div className="space-y-3">
                        <a
                            href="/admin/properties/create"
                            className="block w-full bg-stitch-primary text-stitch-on-primary py-3 rounded-lg font-bold hover:opacity-90 transition-opacity text-center"
                        >
                            Add New Property
                        </a>
                        <a
                            href="/admin/reservations"
                            className="block w-full border border-stitch-primary text-stitch-primary py-3 rounded-lg font-bold hover:bg-stitch-primary hover:text-stitch-on-primary transition-all text-center"
                        >
                            View Reservations
                        </a>
                    </div>
                </section>
            </div>

            <section className="mt-gutter mb-gutter">
                <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                    <div className="p-gutter border-b border-stitch-outline-variant/10">
                        <h4 className="font-display text-headline-sm text-stitch-primary">
                            Recent Reservations
                        </h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stitch-surface-container-low text-stitch-on-surface-variant text-label-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-gutter py-4 font-bold">Property</th>
                                    <th className="px-gutter py-4 font-bold">Guest</th>
                                    <th className="px-gutter py-4 font-bold">Dates</th>
                                    <th className="px-gutter py-4 font-bold">Total</th>
                                    <th className="px-gutter py-4 font-bold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stitch-outline-variant/10 text-body-md">
                                {recentBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-gutter py-8 text-center text-stitch-on-surface-variant">
                                            No bookings yet.
                                        </td>
                                    </tr>
                                )}
                                {recentBookings.map((r) => (
                                    <tr key={r.id} className="hover:bg-stitch-surface-container-low/50 transition-colors">
                                        <td className="px-gutter py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded bg-stitch-surface-variant flex items-center justify-center">
                                                    <TreePine className="size-5 text-stitch-on-surface-variant" />
                                                </div>
                                                <span className="font-semibold text-stitch-primary">
                                                    {r.property}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-gutter py-4 text-stitch-on-surface-variant">
                                            {r.guest}
                                        </td>
                                        <td className="px-gutter py-4 text-stitch-on-surface-variant">
                                            {r.dates}
                                        </td>
                                        <td className="px-gutter py-4 font-bold text-stitch-primary">
                                            ${r.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-gutter py-4">
                                            <BookingStatusBadge status={r.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </>
    );
}
