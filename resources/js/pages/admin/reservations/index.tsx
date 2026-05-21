import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { BookingStatusBadge } from '@/components/admin/booking-status-badge';
import { BookingActions } from '@/components/admin/booking-actions';
import type { AdminBooking } from '@/types/booking';

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
    bookings: PaginatedData<AdminBooking>;
    filters: { search?: string; status?: string };
}

export default function ReservationsIndex({ bookings, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function handleFilter() {
        router.get('/admin/reservations', { search, status: status || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    function handleCancel(id: number) {
        if (confirm('Cancel this booking?')) {
            router.post(`/admin/reservations/${id}/cancel`, {}, { preserveScroll: true });
        }
    }

    function handleConfirm(id: number) {
        router.post(`/admin/reservations/${id}/confirm`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Reservations" />

            <header className="mb-8">
                <h2 className="font-display text-display-lg text-stitch-primary mb-2">
                    Reservations
                </h2>
                <p className="text-body-lg text-stitch-on-surface-variant">
                    Manage all guest bookings
                </p>
            </header>

            <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                <div className="p-gutter border-b border-stitch-outline-variant/10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-stitch-outline size-4" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder="Search by guest or property..."
                                className="w-full pl-10 pr-4 py-2 bg-stitch-surface rounded-full border border-stitch-outline-variant text-body-md focus:ring-stitch-primary focus:border-stitch-primary"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                router.get('/admin/reservations', { status: e.target.value || undefined }, {
                                    preserveState: true,
                                    replace: true,
                                });
                            }}
                            className="bg-stitch-surface border border-stitch-outline-variant rounded-lg px-4 py-2 text-body-md"
                        >
                            <option value="">All Status</option>
                            <option value="reserved">Reserved</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                            onClick={handleFilter}
                            className="bg-stitch-primary text-stitch-on-primary px-6 py-2 rounded-lg font-bold hover:opacity-90"
                        >
                            Search
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-label-sm text-stitch-outline uppercase tracking-widest bg-stitch-surface-container-low">
                                <th className="px-gutter py-4">Guest</th>
                                <th className="px-gutter py-4">Property</th>
                                <th className="px-gutter py-4">Dates</th>
                                <th className="px-gutter py-4">Nights</th>
                                <th className="px-gutter py-4">Total</th>
                                <th className="px-gutter py-4">Status</th>
                                <th className="px-gutter py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stitch-outline-variant/10">
                            {bookings.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-gutter py-8 text-center text-stitch-on-surface-variant">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                            {bookings.data.map((b) => (
                                <tr key={b.id} className="hover:bg-stitch-surface-container-low/50 transition-colors group">
                                    <td className="px-gutter py-4">
                                        <div>
                                            <p className="font-medium text-stitch-primary">{b.guest_name}</p>
                                            <p className="text-label-sm text-stitch-on-surface-variant">{b.guest_email}</p>
                                        </div>
                                    </td>
                                    <td className="px-gutter py-4 text-stitch-on-surface">
                                        {b.property}
                                    </td>
                                    <td className="px-gutter py-4 text-stitch-on-surface-variant">
                                        {b.check_in} - {b.check_out}
                                    </td>
                                    <td className="px-gutter py-4 text-center">{b.nights}</td>
                                    <td className="px-gutter py-4 font-bold">
                                        ${b.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-gutter py-4">
                                        <BookingStatusBadge status={b.status} />
                                    </td>
                                    <td className="px-gutter py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/reservations/${b.id}`}
                                                className="p-2 text-stitch-primary hover:bg-stitch-primary-container/20 rounded-full transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="size-5" />
                                            </Link>
                                            <BookingActions
                                                status={b.status}
                                                onCancel={() => handleCancel(b.id)}
                                                onConfirm={() => handleConfirm(b.id)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {bookings.meta.last_page > 1 && (
                    <div className="px-gutter py-4 border-t border-stitch-outline-variant/10 flex items-center justify-between">
                        <span className="text-label-sm text-stitch-on-surface-variant">
                            Showing {bookings.meta.from}-{bookings.meta.to} of {bookings.meta.total}
                        </span>
                        <div className="flex gap-2">
                            {Array.from({ length: bookings.meta.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() =>
                                        router.get(
                                            '/admin/reservations',
                                            { page, search: filters.search, status: filters.status },
                                            { preserveState: true, replace: true }
                                        )
                                    }
                                    className={`size-8 rounded text-label-sm ${
                                        page === bookings.meta.current_page
                                            ? 'bg-stitch-primary text-stitch-on-primary'
                                            : 'hover:bg-stitch-surface-variant'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
