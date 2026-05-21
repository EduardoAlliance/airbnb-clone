import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Calendar, Edit, Home, ImageIcon, List, Users } from 'lucide-react';
import { BookingStatusBadge } from '@/components/admin/booking-status-badge';
import { BookingActions } from '@/components/admin/booking-actions';
import type { AdminPropertyDetail } from '@/types/property';
import type { InventoryDay } from '@/types/inventory';

interface Props {
    property: AdminPropertyDetail & { bookings: any[] };
}

type Tab = 'overview' | 'inventory' | 'bookings';

export default function PropertyShow({ property }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    function handleInventoryUpdate(date: string, updates: Partial<InventoryDay>) {
        router.put(
            `/admin/properties/${property.id}/inventory`,
            { dates: [{ date, ...updates }] },
            { preserveScroll: true }
        );
    }

    function handleCancelBooking(id: number) {
        if (confirm('Cancel this booking?')) {
            router.post(`/admin/reservations/${id}/cancel`, {}, { preserveScroll: true });
        }
    }

    function handleConfirmBooking(id: number) {
        router.post(`/admin/reservations/${id}/confirm`, {}, { preserveScroll: true });
    }

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: 'overview', label: 'Overview', icon: Home },
        { key: 'inventory', label: 'Inventory', icon: Calendar },
        { key: 'bookings', label: 'Bookings', icon: List },
    ];

    return (
        <>
            <Head title={property.title} />

            <div className="mb-6">
                <Link
                    href="/admin/properties"
                    className="inline-flex items-center gap-2 text-label-md text-stitch-on-surface-variant hover:text-stitch-primary transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Back to Properties
                </Link>
            </div>

            <header className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-display text-display-lg text-stitch-primary mb-2">
                            {property.title}
                        </h2>
                        <p className="text-body-lg text-stitch-on-surface-variant">
                            {property.city}, {property.state}, {property.country}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={`/admin/properties/${property.id}/edit`}
                            className="flex items-center gap-2 border border-stitch-primary text-stitch-primary px-4 py-2 rounded-lg font-bold hover:bg-stitch-primary hover:text-stitch-on-primary transition-all"
                        >
                            <Edit className="size-4" />
                            Edit
                        </Link>
                        <Link
                            href={`/admin/properties/${property.id}/inventory`}
                            className="flex items-center gap-2 bg-stitch-primary text-stitch-on-primary px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-all"
                        >
                            <Calendar className="size-4" />
                            Manage Inventory
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex gap-1 mb-8 bg-stitch-surface-container-low rounded-xl p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                            activeTab === tab.key
                                ? 'bg-stitch-primary text-stitch-on-primary shadow-soft'
                                : 'text-stitch-on-surface-variant hover:text-stitch-primary'
                        }`}
                    >
                        <tab.icon className="size-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                    <div className="lg:col-span-2 space-y-gutter">
                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                            <h3 className="font-display text-headline-sm text-stitch-primary mb-4">
                                Description
                            </h3>
                            <p className="text-body-md text-stitch-on-surface-variant whitespace-pre-line">
                                {property.description}
                            </p>
                        </div>

                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                            <h3 className="font-display text-headline-sm text-stitch-primary mb-4">
                                Images
                            </h3>
                            {property.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {property.images.map((img) => (
                                        <div key={img.id} className="aspect-[4/3] rounded-lg overflow-hidden bg-stitch-surface-variant">
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-stitch-on-surface-variant">
                                    <ImageIcon className="size-5" />
                                    <span>No images uploaded.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-gutter">
                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                            <h3 className="font-display text-headline-sm text-stitch-primary mb-4">
                                Details
                            </h3>
                            <dl className="space-y-3">
                                <div className="flex justify-between">
                                    <dt className="text-label-sm text-stitch-on-surface-variant">Status</dt>
                                    <dd>
                                        <span className={`px-3 py-1 rounded-full text-label-sm font-bold ${
                                            property.status === 'published'
                                                ? 'bg-stitch-primary-fixed text-stitch-on-primary-fixed'
                                                : 'bg-stitch-surface-container-high text-stitch-on-surface-variant'
                                        }`}>
                                            {property.status}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-label-sm text-stitch-on-surface-variant">Base Price</dt>
                                    <dd className="font-bold text-stitch-primary">${property.base_price.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-label-sm text-stitch-on-surface-variant">Cleaning Fee</dt>
                                    <dd>${property.cleaning_fee.toFixed(2)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-label-sm text-stitch-on-surface-variant">Guests</dt>
                                    <dd>{property.guests}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-label-sm text-stitch-on-surface-variant">Bedrooms</dt>
                                    <dd>{property.bedrooms}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-label-sm text-stitch-on-surface-variant">Beds</dt>
                                    <dd>{property.beds}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-label-sm text-stitch-on-surface-variant">Bathrooms</dt>
                                    <dd>{property.bathrooms}</dd>
                                </div>
                            </dl>
                        </div>

                        {property.amenities.length > 0 && (
                            <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                                <h3 className="font-display text-headline-sm text-stitch-primary mb-4">
                                    Amenities
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {property.amenities.map((a) => (
                                        <span key={a.id} className="px-3 py-1 bg-stitch-primary-fixed/20 text-stitch-on-primary-fixed-variant rounded-full text-label-sm">
                                            {a.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                            <h3 className="font-display text-headline-sm text-stitch-primary mb-4">
                                Address
                            </h3>
                            <p className="text-body-md text-stitch-on-surface-variant">
                                {property.address}<br />
                                {property.city}, {property.state} {property.postal_code}<br />
                                {property.country}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                    <p className="text-body-md text-stitch-on-surface-variant mb-4">
                        Manage inventory dates from the dedicated inventory page:
                    </p>
                    <Link
                        href={`/admin/properties/${property.id}/inventory`}
                        className="bg-stitch-primary text-stitch-on-primary px-6 py-3 rounded-lg font-bold inline-flex items-center gap-2 hover:opacity-90"
                    >
                        <Calendar className="size-5" />
                        Open Inventory Calendar
                    </Link>

                    {property.inventory.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-display text-headline-sm text-stitch-primary mb-4">
                                Upcoming Dates
                            </h4>
                            <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
                                {property.inventory.slice(0, 28).map((day) => (
                                    <div
                                        key={day.date}
                                        className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center text-center ${
                                            day.closed
                                                ? 'bg-stitch-surface-variant opacity-40'
                                                : day.is_available
                                                  ? 'bg-stitch-primary-fixed/20 border border-stitch-primary-fixed'
                                                  : 'bg-stitch-error-container/20 border border-stitch-error-container'
                                        }`}
                                    >
                                        <span className="text-[10px] font-bold">{new Date(day.date).getDate()}</span>
                                        <span className="text-[8px] text-stitch-on-surface-variant">
                                            ${day.price > 0 ? day.price : property.base_price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 overflow-hidden">
                    {property.bookings.length === 0 ? (
                        <div className="p-gutter text-center text-stitch-on-surface-variant">
                            No bookings for this property yet.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-label-sm text-stitch-outline uppercase tracking-widest bg-stitch-surface-container-low">
                                    <th className="px-gutter py-4">Guest</th>
                                    <th className="px-gutter py-4">Check In</th>
                                    <th className="px-gutter py-4">Check Out</th>
                                    <th className="px-gutter py-4">Total</th>
                                    <th className="px-gutter py-4">Status</th>
                                    <th className="px-gutter py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stitch-outline-variant/10">
                                {property.bookings.map((b: any) => (
                                    <tr key={b.id} className="hover:bg-stitch-surface-container-low/50">
                                        <td className="px-gutter py-4 font-medium">{b.guest_name}</td>
                                        <td className="px-gutter py-4 text-stitch-on-surface-variant">{b.check_in}</td>
                                        <td className="px-gutter py-4 text-stitch-on-surface-variant">{b.check_out}</td>
                                        <td className="px-gutter py-4 font-bold">${b.total.toFixed(2)}</td>
                                        <td className="px-gutter py-4">
                                            <BookingStatusBadge status={b.status} />
                                        </td>
                                        <td className="px-gutter py-4 text-right">
                                            <BookingActions
                                                status={b.status}
                                                onCancel={() => handleCancelBooking(b.id)}
                                                onConfirm={() => handleConfirmBooking(b.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </>
    );
}
