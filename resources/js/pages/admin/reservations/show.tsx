import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, DollarSign, Users, History } from 'lucide-react';
import { BookingStatusBadge } from '@/components/admin/booking-status-badge';
import type { AdminBookingDetail } from '@/types/booking';

interface Props {
    booking: AdminBookingDetail;
}

export default function ReservationShow({ booking }: Props) {
    function handleCancel() {
        if (confirm('Cancel this booking?')) {
            router.post(`/admin/reservations/${booking.id}/cancel`, {}, { preserveScroll: true });
        }
    }

    function handleConfirm() {
        router.post(`/admin/reservations/${booking.id}/confirm`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Reservation ${booking.reservation_id}`} />

            <div className="mb-6">
                <Link
                    href="/admin/reservations"
                    className="inline-flex items-center gap-2 text-label-md text-stitch-on-surface-variant hover:text-stitch-primary transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Back to Reservations
                </Link>
            </div>

            <header className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="font-display text-display-lg text-stitch-primary">
                                {booking.reservation_id}
                            </h2>
                            <BookingStatusBadge status={booking.status} />
                        </div>
                        <p className="text-body-lg text-stitch-on-surface-variant">
                            {booking.property.title}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {booking.status === 'reserved' && (
                            <button
                                onClick={handleConfirm}
                                className="bg-stitch-primary text-stitch-on-primary px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all"
                            >
                                Confirm Booking
                            </button>
                        )}
                        {['reserved', 'confirmed'].includes(booking.status) && (
                            <button
                                onClick={handleCancel}
                                className="border border-stitch-error text-stitch-error px-6 py-3 rounded-lg font-bold hover:bg-stitch-error hover:text-stitch-on-error transition-all"
                            >
                                Cancel Booking
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                <div className="lg:col-span-2 space-y-gutter">
                    <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                        <h3 className="font-display text-headline-sm text-stitch-primary mb-6">
                            Booking Details
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-label-sm text-stitch-on-surface-variant mb-1">
                                    <CalendarDays className="size-4" />
                                    Check In
                                </div>
                                <p className="font-bold text-stitch-primary">{booking.check_in}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-label-sm text-stitch-on-surface-variant mb-1">
                                    <CalendarDays className="size-4" />
                                    Check Out
                                </div>
                                <p className="font-bold text-stitch-primary">{booking.check_out}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-label-sm text-stitch-on-surface-variant mb-1">
                                    <Users className="size-4" />
                                    Guests
                                </div>
                                <p className="font-bold">{booking.guests}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-label-sm text-stitch-on-surface-variant mb-1">
                                    <CalendarDays className="size-4" />
                                    Nights
                                </div>
                                <p className="font-bold">{booking.nights}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            <div>
                                <span className="text-label-sm text-stitch-on-surface-variant">Booked on</span>
                                <p className="font-medium">{booking.created_at}</p>
                            </div>
                            {booking.original_check_in && booking.original_check_in !== booking.check_in && (
                                <div>
                                    <span className="text-label-sm text-stitch-on-surface-variant">Originally booked</span>
                                    <p className="font-medium">{booking.original_check_in}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                        <h3 className="font-display text-headline-sm text-stitch-primary mb-6">
                            Payment
                        </h3>
                        {booking.payment ? (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-stitch-on-surface-variant">Subtotal</span>
                                    <span>${booking.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stitch-on-surface-variant">Service Fee</span>
                                    <span>${booking.payment.service_fee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-stitch-on-surface-variant">Cleaning Fee</span>
                                    <span>${booking.payment.cleaning_fee.toFixed(2)}</span>
                                </div>
                                <hr className="border-stitch-outline-variant/20" />
                                <div className="flex justify-between font-bold text-stitch-primary text-headline-sm">
                                    <span>Total</span>
                                    <span>${booking.total.toFixed(2)}</span>
                                </div>
                                {booking.payment.paid_at && (
                                    <div className="text-label-sm text-stitch-on-surface-variant">
                                        Paid on {booking.payment.paid_at}
                                    </div>
                                )}
                                {booking.payout && (
                                    <div className="mt-4 pt-4 border-t border-stitch-outline-variant/10">
                                        <h4 className="font-display text-headline-sm text-stitch-primary mb-3">Payout</h4>
                                        <div className="flex justify-between">
                                            <span className="text-stitch-on-surface-variant">Host Earnings</span>
                                            <span>${booking.payout.host_earnings.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stitch-on-surface-variant">Platform Commission</span>
                                            <span>${booking.payout.platform_commission.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-stitch-on-surface-variant">Status</span>
                                            <BookingStatusBadge status={booking.payout.status} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-stitch-on-surface-variant">No payment information available.</p>
                        )}
                    </div>

                    {booking.modifications.length > 0 && (
                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                            <div className="flex items-center gap-2 mb-6">
                                <History className="size-5 text-stitch-secondary" />
                                <h3 className="font-display text-headline-sm text-stitch-primary">
                                    Modification History
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {booking.modifications.map((mod) => (
                                    <div key={mod.id} className="border border-stitch-outline-variant/10 rounded-lg p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-label-sm font-semibold text-stitch-primary uppercase tracking-wider">
                                                {mod.type === 'dates' ? 'Date Change' : 'Guest Change'}
                                            </span>
                                            <span className="text-label-xs text-stitch-on-surface-variant">{mod.created_at}</span>
                                        </div>

                                        {mod.type === 'dates' && (
                                            <div className="text-label-sm text-stitch-on-surface-variant space-y-1">
                                                <div className="flex justify-between">
                                                    <span>From</span>
                                                    <span className="text-stitch-on-surface line-through">
                                                        {mod.before.check_in as string} - {mod.before.check_out as string}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>To</span>
                                                    <span className="text-stitch-primary font-medium">
                                                        {mod.after.check_in as string} - {mod.after.check_out as string}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {mod.type === 'guests' && (
                                            <div className="text-label-sm text-stitch-on-surface-variant space-y-1">
                                                <div className="flex justify-between">
                                                    <span>From</span>
                                                    <span className="text-stitch-on-surface line-through">{String(mod.before.guests)} guests</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>To</span>
                                                    <span className="text-stitch-primary font-medium">{String(mod.after.guests)} guests</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-label-sm pt-2 border-t border-stitch-outline-variant/10">
                                            <span className="text-stitch-on-surface-variant">Amount change</span>
                                            <span className={mod.amount_change > 0 ? 'text-stitch-error font-semibold' : mod.amount_change < 0 ? 'text-green-600 font-semibold' : 'text-stitch-on-surface-variant'}>
                                                {mod.amount_change > 0 ? '+' : ''}{mod.amount_change.toFixed(2)}
                                            </span>
                                        </div>

                                        {mod.payment_method && (
                                            <div className="text-label-xs text-stitch-on-surface-variant">
                                                Paid with {mod.payment_method.brand} ending in {mod.payment_method.card_last4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-gutter">
                    <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                        <h3 className="font-display text-headline-sm text-stitch-primary mb-4">
                            Guest
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-full bg-stitch-primary-fixed flex items-center justify-center text-label-sm font-bold text-stitch-on-primary-fixed">
                                {booking.guest.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                                <p className="font-bold text-stitch-primary">{booking.guest.name}</p>
                                <p className="text-label-sm text-stitch-on-surface-variant">{booking.guest.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                        <h3 className="font-display text-headline-sm text-stitch-primary mb-4">
                            Property
                        </h3>
                        <Link
                            href={`/admin/properties/${booking.property.id}`}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                        >
                            {booking.property.image ? (
                                <img
                                    src={booking.property.image}
                                    alt={booking.property.title}
                                    className="size-16 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="size-16 rounded-lg bg-stitch-surface-variant flex items-center justify-center">
                                    <DollarSign className="size-6 text-stitch-on-surface-variant" />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-stitch-primary">{booking.property.title}</p>
                                <span className="text-label-sm text-stitch-primary underline">View Property</span>
                            </div>
                        </Link>
                    </div>

                    {['reserved', 'confirmed'].includes(booking.status) && (
                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter space-y-3">
                            <h3 className="font-display text-headline-sm text-stitch-primary">
                                Actions
                            </h3>
                            {booking.status === 'reserved' && (
                                <button
                                    onClick={handleConfirm}
                                    className="w-full bg-stitch-primary text-stitch-on-primary py-3 rounded-lg font-bold hover:opacity-90 transition-all"
                                >
                                    Confirm Booking
                                </button>
                            )}
                            <button
                                onClick={handleCancel}
                                className="w-full border border-stitch-error text-stitch-error py-3 rounded-lg font-bold hover:bg-stitch-error hover:text-stitch-on-error transition-all"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    )}

                    {booking.cancellationPolicy && (
                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-soft border border-stitch-outline-variant/10 p-gutter">
                            <h3 className="font-display text-headline-sm text-stitch-primary mb-3">
                                Cancellation Policy
                            </h3>
                            <p className="font-bold text-stitch-primary mb-1">
                                {booking.cancellationPolicy.policy_name ?? booking.cancellationPolicy.policy}
                            </p>
                            {booking.cancellationPolicy.refund_rules && (
                                <ul className="text-label-sm text-stitch-on-surface-variant space-y-0.5">
                                    {booking.cancellationPolicy.refund_rules.before_14_days !== undefined && (
                                        <li>14+ days: {booking.cancellationPolicy.refund_rules.before_14_days}% refund</li>
                                    )}
                                    {booking.cancellationPolicy.refund_rules.before_7_days !== undefined && (
                                        <li>7–13 days: {booking.cancellationPolicy.refund_rules.before_7_days}% refund</li>
                                    )}
                                    {booking.cancellationPolicy.refund_rules.after !== undefined && (
                                        <li>Less than 7 days: {booking.cancellationPolicy.refund_rules.after}% refund</li>
                                    )}
                                </ul>
                            )}
                            {booking.refundEstimate && (
                                <div className="mt-3 pt-3 border-t border-stitch-outline-variant/10 text-label-sm space-y-1">
                                    <p className="text-stitch-on-surface-variant">
                                        Days until check-in: <span className="font-semibold text-stitch-primary">{booking.refundEstimate.days_until_checkin}</span>
                                    </p>
                                    <p className="text-stitch-on-surface-variant">
                                        Refund: <span className="font-semibold text-stitch-primary">${booking.refundEstimate.refund_amount.toFixed(2)}</span>
                                        ({booking.refundEstimate.refund_percent}%)
                                    </p>
                                </div>
                            )}
                            {booking.payment && (booking.payment.refund_amount > 0 || booking.payment.platform_kept > 0) && (
                                <div className="mt-3 pt-3 border-t border-stitch-outline-variant/10 text-label-sm space-y-1">
                                    <p className="text-stitch-on-surface-variant">
                                        Refunded: <span className="font-semibold text-green-600">${booking.payment.refund_amount.toFixed(2)}</span>
                                    </p>
                                    <p className="text-stitch-on-surface-variant">
                                        Platform kept: <span className="font-semibold text-stitch-on-surface-variant">${booking.payment.platform_kept.toFixed(2)}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
