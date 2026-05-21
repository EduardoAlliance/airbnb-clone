import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, CalendarDays, Users, Key, MessageCircle, Phone,
    MapPin, Home, AlertTriangle, ChevronLeft, ChevronRight, Star,
} from 'lucide-react';
import { LocationMap } from '@/components/map/location-map';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RefundEstimate {
    refund_percent: number;
    days_until_checkin: number;
    refund_amount: number;
    platform_retained: number;
}

interface CancellationPolicy {
    policy: string;
    policy_name?: string;
    refund_rules?: Record<string, number>;
}

interface AvailabilityDay {
    date: string;
    price: number;
    isAvailable: boolean;
    closed: boolean;
}

interface NightlyBreakdown {
    date: string;
    price: number;
}

interface PricingBreakdown {
    checkIn: string;
    checkOut: string;
    nights: number;
    subtotal: number;
    nightlyBreakdown: NightlyBreakdown[];
    serviceFee: number;
    total: number;
    cleaningFee: number;
}

interface PricePreviewData {
    available: boolean;
    pricing: PricingBreakdown;
    current: {
        subtotal: number;
        cleaning_fee: number;
        total: number;
    };
}

interface BookingShowProps {
    booking: {
        id: number;
        title: string;
        location: string;
        address: string;
        checkIn: string;
        checkOut: string;
        originalCheckIn?: string | null;
        checkInTime?: string | null;
        checkOutTime?: string | null;
        nights: number;
        guests: number;
        maxGuests: number;
        status: string;
        reservationId: string;
        hostName: string;
        hostSince: string;
        hostAvatar?: string | null;
        hostPhone?: string | null;
        imageUrl: string;
        total: number;
        latitude: number | null;
        longitude: number | null;
        cancellationPolicy?: CancellationPolicy | null;
        refundEstimate?: RefundEstimate;
        canCancel?: boolean;
        availability?: AvailabilityDay[];
        paymentMethods?: Array<{
            id: number;
            brand: string;
            card_last4: string;
            expires_at: string;
            is_default: boolean;
        }>;
        modifications?: Array<{
            id: number;
            type: string;
            before: Record<string, unknown>;
            after: Record<string, unknown>;
            amount_change: number;
            payment_method: { brand: string; card_last4: string } | null;
            created_at: string;
        }>;
    };
}

function formatTime(time: string | null | undefined): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = (hours ?? 0) >= 12 ? 'PM' : 'AM';
    const h = (hours ?? 0) % 12 || 12;
    return `${h}:${String(minutes ?? 0).padStart(2, '0')} ${ampm}`;
}

function formatStayDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, (month ?? 1) - 1, day ?? 1);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function dateKey(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseSafeDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export default function BookingShow({ booking }: BookingShowProps) {
    const [cancelling, setCancelling] = useState(false);
    const [datesOpen, setDatesOpen] = useState(false);
    const [guestsOpen, setGuestsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const d = new Date();
        return d.getMonth() + d.getFullYear() * 12;
    });
    const [newCheckIn, setNewCheckIn] = useState(booking.checkIn);
    const [newCheckOut, setNewCheckOut] = useState(booking.checkOut);
    const [newGuests, setNewGuests] = useState(booking.guests);
    const [modifying, setModifying] = useState(false);
    const [pricePreview, setPricePreview] = useState<PricePreviewData | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | 'new' | null>(null);
    const [newCard, setNewCard] = useState({ cardholder_name: '', card_number: '', expiry: '', cvc: '' });
    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!newCheckIn || !newCheckOut) {
            setPricePreview(null);
            return;
        }

        debounceRef.current = setTimeout(() => {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoadingPrice(true);
            const params = new URLSearchParams({ check_in: newCheckIn, check_out: newCheckOut });
            fetch(`/account/bookings/${booking.id}/price-preview?${params}`, {
                signal: controller.signal,
            })
                .then((res) => res.json())
                .then((data) => setPricePreview(data))
                .catch(() => {})
                .finally(() => setLoadingPrice(false));
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [newCheckIn, newCheckOut]);

    const todayStr = new Date().toISOString().split('T')[0];

    const policy = booking.cancellationPolicy;
    const availability = booking.availability ?? [];

    const msUntilCheckin = new Date(booking.checkIn).getTime() - new Date(todayStr).getTime();
    const daysUntilCheckin = msUntilCheckin > 0 ? Math.ceil(msUntilCheckin / (1000 * 60 * 60 * 24)) : 0;
    const canModifyDates = daysUntilCheckin >= 2;

    const availabilityMap = new Map<string, AvailabilityDay>();
    availability.forEach((d) => availabilityMap.set(d.date, d));

    function handleCancel() {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        setCancelling(true);
        router.post(`/account/bookings/${booking.id}/cancel`, {}, {
            preserveScroll: true,
            onFinish: () => setCancelling(false),
        });
    }

    function selectDate(date: string) {
        if (!newCheckIn || (newCheckIn && newCheckOut)) {
            setNewCheckIn(date);
            setNewCheckOut('');
        } else {
            if (date <= newCheckIn) {
                setNewCheckIn(date);
                setNewCheckOut('');
            } else {
                setNewCheckOut(date);
            }
        }
    }

    function isInRange(date: string): boolean {
        if (!newCheckIn || !newCheckOut) return false;
        return date > newCheckIn && date < newCheckOut;
    }

    function handleModifyDates() {
        if (!newCheckIn || !newCheckOut) return;

        const increase = pricePreview && pricePreview.pricing.total > pricePreview.current.total;
        if (increase) {
            setSelectedPaymentMethod(null);
            setNewCard({ cardholder_name: '', card_number: '', expiry: '', cvc: '' });
            setPaymentModalOpen(true);
            return;
        }

        setModifying(true);
        router.post(`/account/bookings/${booking.id}/modify`, {
            check_in: newCheckIn,
            check_out: newCheckOut,
        }, {
            preserveScroll: true,
            onFinish: () => { setModifying(false); setDatesOpen(false); },
        });
    }

    function handleConfirmPayment() {
        if (!newCheckIn || !newCheckOut || !pricePreview) return;

        const body: Record<string, unknown> = {
            check_in: newCheckIn,
            check_out: newCheckOut,
        };

        if (selectedPaymentMethod === 'new') {
            body.cardholder_name = newCard.cardholder_name;
            body.card_number = newCard.card_number;
            body.expiry = newCard.expiry;
            body.cvc = newCard.cvc;
        } else if (selectedPaymentMethod) {
            body.payment_method_id = selectedPaymentMethod;
        }

        if (!selectedPaymentMethod) return;

        setModifying(true);
        setPaymentModalOpen(false);
        router.post(`/account/bookings/${booking.id}/modify`, body, {
            preserveScroll: true,
            onFinish: () => { setModifying(false); setDatesOpen(false); },
        });
    }

    function handleModifyGuests() {
        setModifying(true);
        router.post(`/account/bookings/${booking.id}/modify`, {
            guests: newGuests,
        }, {
            preserveScroll: true,
            onFinish: () => { setModifying(false); setGuestsOpen(false); },
        });
    }

    const year = Math.floor(visibleMonth / 12);
    const month = visibleMonth % 12;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startPad = firstDay.getDay();
    const today = dateKey(new Date());

    const weeks: (number | null)[][] = [];
    let cells: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
        if (cells.length === 7) {
            weeks.push(cells);
            cells = [];
        }
    }
    if (cells.length > 0) {
        while (cells.length < 7) cells.push(null);
        weeks.push(cells);
    }

    return (
        <>
            <Head title="Booking Details" />

            <div className="py-12">
                <Link
                    href="/account"
                    className="inline-flex items-center gap-2 text-label-md text-stitch-secondary hover:underline mb-8"
                >
                    <ArrowLeft className="size-4" />
                    Back to overview
                </Link>

                <header className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-12">
                    <div className="lg:col-span-8 rounded-xl overflow-hidden h-[400px] relative shadow-[0_10px_30px_-10px_rgba(24,36,19,0.15)]">
                        <img
                            className="w-full h-full object-cover"
                            src={booking.imageUrl}
                            alt=""
                        />
                        <div className="absolute bottom-6 left-6 bg-stitch-surface/90 backdrop-blur-md px-6 py-3 rounded-lg border border-stitch-outline-variant/30">
                            <h1 className="font-display text-headline-sm text-stitch-primary">{booking.title}</h1>
                        </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col justify-center bg-stitch-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-10px_rgba(24,36,19,0.15)] border border-stitch-surface-container-high">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="size-3 rounded-full bg-stitch-primary" />
                            <span className="text-label-md text-stitch-primary tracking-widest uppercase">
                            {booking.status === 'cancelled' ? 'Cancelled' : booking.status}
                        </span>
                        </div>
                        <h2 className="font-display text-headline-md text-stitch-primary mb-2">Booking Details</h2>
                        <p className="text-body-md text-stitch-on-surface-variant mb-6">Reservation ID: {booking.reservationId}</p>
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="size-5 text-stitch-secondary" />
                                <div>
                                    <p className="text-label-md text-stitch-on-surface">{formatStayDate(booking.checkIn)} - {formatStayDate(booking.checkOut)}</p>
                                    <p className="text-label-sm text-stitch-on-surface-variant">{booking.nights} nights</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="size-5 text-stitch-secondary" />
                                <p className="text-label-md text-stitch-on-surface">{booking.guests} Guests</p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
                    <div className="md:col-span-2 bg-stitch-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-10px_rgba(24,36,19,0.15)] flex flex-col space-y-6">
                        <div className="flex items-center gap-3 border-b border-stitch-surface-container pb-4">
                            <Key className="size-[32px] text-stitch-primary" />
                            <h3 className="font-display text-headline-sm text-stitch-primary">Arrival &amp; Departure</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <p className="text-label-md text-stitch-secondary mb-2">Check-in</p>
                                <p className="font-display text-headline-sm text-stitch-on-surface mb-4">
                                    {formatTime(booking.checkInTime) || '3:00 PM'}
                                </p>
                                <p className="text-body-md text-stitch-on-surface-variant">
                                    Access the cabin via the smart lock on the side door. Your unique code is <span className="font-bold text-stitch-primary">2988#</span>.
                                </p>
                            </div>
                            <div>
                                <p className="text-label-md text-stitch-secondary mb-2">Check-out</p>
                                <p className="font-display text-headline-sm text-stitch-on-surface mb-4">
                                    {formatTime(booking.checkOutTime) || '11:00 AM'}
                                </p>
                                <p className="text-body-md text-stitch-on-surface-variant">
                                    Please ensure all windows are closed and fireplace is extinguished before departing.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-stitch-primary-container p-8 rounded-xl text-stitch-on-primary-container flex flex-col">
                        <h3 className="font-display text-headline-sm mb-6 text-stitch-on-primary-container">Your Host</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <Avatar className="size-16 border-2 border-stitch-primary-fixed">
                                {booking.hostAvatar ? (
                                    <AvatarImage src={booking.hostAvatar} alt={booking.hostName} />
                                ) : null}
                                <AvatarFallback>
                                    <Home className="size-6 text-stitch-on-primary-container/60" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-label-md text-stitch-primary-fixed">{booking.hostName}</p>
                                <p className="text-label-sm text-stitch-on-primary-container/80">Superhost since {booking.hostSince}</p>
                            </div>
                        </div>
                        <div className="mt-auto space-y-3">
                            {/* Message Host — coming soon */}
                            {booking.hostPhone && (
                                <a
                                    href={`tel:${booking.hostPhone}`}
                                    className="flex w-full py-3 px-4 border border-stitch-outline-variant/30 text-stitch-on-primary-container rounded-lg text-label-md hover:bg-stitch-primary/10 transition-all items-center justify-center gap-2"
                                >
                                    <Phone className="size-[18px]" />
                                    Emergency Call
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <div className="bg-stitch-surface-container-lowest rounded-xl shadow-[0_10px_30px_-10px_rgba(24,36,19,0.15)] overflow-hidden border border-stitch-surface-container-high">
                        <div className="p-6 border-b border-stitch-surface-container flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="size-5 text-stitch-secondary" />
                                <h3 className="font-display text-headline-sm text-stitch-primary">Location</h3>
                            </div>
                            <p className="text-label-md text-stitch-on-surface-variant">{booking.address}</p>
                        </div>
                        <div className="h-[350px] bg-stitch-surface-container-low relative">
                            {booking.latitude && booking.longitude ? (
                                <LocationMap
                                    latitude={booking.latitude}
                                    longitude={booking.longitude}
                                    title={booking.title}
                                    className="h-[350px]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stitch-on-surface-variant gap-2">
                                    <MapPin className="size-5" />
                                    Location not set
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    <div className="bg-stitch-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-10px_rgba(24,36,19,0.15)] border border-stitch-surface-container-high">
                        <h3 className="font-display text-headline-sm text-stitch-primary mb-4">Modify Booking</h3>
                        <p className="text-body-md text-stitch-on-surface-variant mb-6">
                            Need to add more guests or change your stay dates? Subject to availability and cabin capacity.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="default"
                                className="flex-1"
                                disabled={!canModifyDates}
                                onClick={() => { setNewCheckIn(booking.checkIn); setNewCheckOut(booking.checkOut); setDatesOpen(true); }}
                            >
                                Change Dates
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => { setNewGuests(booking.guests); setGuestsOpen(true); }}
                            >
                                Add Guests
                            </Button>
                        </div>
                        {!canModifyDates && (
                            <p className="text-label-sm text-stitch-error mt-3">
                                Modifications are no longer available within 2 days of check-in.
                            </p>
                        )}
                    </div>

                    <div className="bg-stitch-surface-container-lowest p-8 rounded-xl shadow-[0_10px_30px_-10px_rgba(24,36,19,0.15)] border border-stitch-error-container">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="size-6 text-stitch-error" />
                            <h3 className="font-display text-headline-sm text-stitch-error">
                                {booking.status === 'cancelled' ? 'Cancelled' : 'Cancel Reservation'}
                            </h3>
                        </div>
                        <div className="bg-stitch-error-container/20 p-4 rounded-lg mb-6 border border-stitch-error-container/30">
                            <p className="text-label-md text-stitch-on-error-container mb-1">
                                {policy?.policy_name ?? 'Cancellation'} Policy
                            </p>
                            {policy?.refund_rules && (
                                <ul className="text-label-sm text-stitch-on-error-container/80 space-y-0.5">
                                    {policy.refund_rules.before_14_days !== undefined && (
                                        <li>14+ days before check-in: {policy.refund_rules.before_14_days}% refund</li>
                                    )}
                                    {policy.refund_rules.before_7_days !== undefined && (
                                        <li>7–13 days before check-in: {policy.refund_rules.before_7_days}% refund</li>
                                    )}
                                    {policy.refund_rules.after !== undefined && (
                                        <li>Less than 7 days: {policy.refund_rules.after}% refund</li>
                                    )}
                                </ul>
                            )}
                        </div>
                        {booking.refundEstimate && booking.canCancel && (
                            <div className="mb-4 p-3 bg-stitch-surface-variant/30 rounded-lg space-y-1 text-label-sm">
                                <p className="text-stitch-on-surface-variant">
                                    Days until check-in: <span className="font-semibold text-stitch-on-surface">{booking.refundEstimate.days_until_checkin}</span>
                                </p>
                                <p className="text-stitch-on-surface-variant">
                                    Refund: <span className="font-semibold text-stitch-primary">${booking.refundEstimate.refund_amount.toFixed(2)}</span>
                                    ({booking.refundEstimate.refund_percent}%)
                                </p>
                            </div>
                        )}
                        <p className="mb-4 text-label-md text-stitch-on-surface-variant">
                            Paid total: ${booking.total.toFixed(2)}
                        </p>
                        {booking.canCancel && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="w-full py-3 px-4 border border-stitch-error text-stitch-error rounded-lg text-label-md hover:bg-stitch-error/5 transition-all disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
                            </button>
                        )}
                        {booking.status === 'cancelled' && (
                            <p className="text-label-sm text-stitch-on-surface-variant mt-3 text-center">
                                This reservation has been cancelled.
                            </p>
                        )}
                    </div>
                </section>

                {booking.modifications && booking.modifications.length > 0 && (
                    <section className="mb-12">
                        <div className="bg-stitch-surface-container-lowest rounded-xl shadow-[0_10px_30px_-10px_rgba(24,36,19,0.15)] border border-stitch-surface-container-high p-6">
                            <h3 className="font-display text-headline-sm text-stitch-primary mb-6">Modification History</h3>
                            <div className="space-y-3">
                                {booking.modifications.map((mod) => (
                                    <div key={mod.id} className="border border-stitch-surface-container rounded-lg p-4 space-y-2">
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
                                        {mod.amount_change !== 0 && (
                                            <div className="flex justify-between text-label-sm pt-2 border-t border-stitch-surface-container">
                                                <span className="text-stitch-on-surface-variant">Amount change</span>
                                                <span className={mod.amount_change > 0 ? 'text-stitch-error font-semibold' : 'text-green-600 font-semibold'}>
                                                    {mod.amount_change > 0 ? '+' : ''}${Math.abs(mod.amount_change).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        {mod.payment_method && (
                                            <div className="text-label-xs text-stitch-on-surface-variant">
                                                Paid with {mod.payment_method.brand} ending in {mod.payment_method.card_last4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <Dialog open={datesOpen} onOpenChange={setDatesOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Change Dates</DialogTitle>
                        <DialogDescription>
                            Select new check-in and check-out dates for your stay.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setVisibleMonth((m) => m - 1)}
                                className="p-1 hover:bg-stitch-surface-container-high rounded"
                            >
                                <ChevronLeft className="size-5" />
                            </button>
                            <span className="text-label-md font-semibold">
                                {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => setVisibleMonth((m) => m + 1)}
                                className="p-1 hover:bg-stitch-surface-container-high rounded"
                            >
                                <ChevronRight className="size-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-label-xs text-stitch-on-surface-variant">
                            {weekdayLabels.map((label) => (
                                <div key={label} className="py-1">{label}</div>
                            ))}
                        </div>
                        <div className="space-y-1">
                            {weeks.map((week, wi) => (
                                <div key={wi} className="grid grid-cols-7 gap-1">
                                    {week.map((day, di) => {
                                        if (day === null) return <div key={di} />;
                                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const av = availabilityMap.get(dateStr);
                                        const isPast = dateStr < todayStr;
                                        const isSelected = dateStr === newCheckIn || dateStr === newCheckOut;
                                        const inRange = isInRange(dateStr);
                                        const disabled = isPast || !av || !av.isAvailable || av.closed;
                                        return (
                                            <button
                                                key={di}
                                                disabled={disabled}
                                                onClick={() => selectDate(dateStr)}
                                                className={`aspect-square rounded-lg text-label-sm flex items-center justify-center transition-all ${
                                                    isSelected
                                                        ? 'bg-stitch-primary text-stitch-on-primary'
                                                        : inRange
                                                            ? 'bg-stitch-primary-container/40'
                                                            : disabled
                                                                ? 'text-stitch-on-surface-variant/30 line-through cursor-not-allowed'
                                                                : 'hover:bg-stitch-surface-container-high text-stitch-on-surface'
                                                } ${dateStr === today ? 'font-bold ring-2 ring-stitch-primary' : ''}`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        {newCheckIn && newCheckOut && (
                            <div className="text-label-md text-center text-stitch-on-surface-variant">
                                {formatStayDate(newCheckIn)} - {formatStayDate(newCheckOut)}
                            </div>
                        )}

                        {loadingPrice && (
                            <div className="flex items-center justify-center py-4">
                                <div className="size-5 border-2 border-stitch-primary border-t-transparent rounded-full animate-spin" />
                                <span className="ml-2 text-label-sm text-stitch-on-surface-variant">Calculating price...</span>
                            </div>
                        )}

                        {pricePreview && !loadingPrice && (
                            <div className="bg-stitch-surface-container-low rounded-lg p-4 space-y-2">
                                {!pricePreview.available ? (
                                    <div className="flex items-center gap-2 text-label-md text-stitch-error">
                                        <AlertTriangle className="size-4" />
                                        Selected dates are not available
                                    </div>
                                ) : (
                                    <>
                                        <h4 className="text-label-md font-semibold text-stitch-on-surface mb-2">Price Breakdown</h4>
                                        <div className="space-y-1 text-label-sm text-stitch-on-surface-variant">
                                            {pricePreview.pricing.nightlyBreakdown.map((night) => (
                                                <div key={night.date} className="flex justify-between">
                                                    <span>{formatStayDate(night.date)}</span>
                                                    <span>${night.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-stitch-surface-container-high pt-2 space-y-1 text-label-sm">
                                            <div className="flex justify-between text-stitch-on-surface-variant">
                                                <span>Subtotal ({pricePreview.pricing.nights} nights)</span>
                                                <span>${pricePreview.pricing.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-stitch-on-surface-variant">
                                                <span>Cleaning fee</span>
                                                <span>${(pricePreview.pricing.cleaningFee || (pricePreview.pricing.total - pricePreview.pricing.subtotal - pricePreview.pricing.serviceFee)).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-stitch-on-surface-variant">
                                                <span>Service fee</span>
                                                <span>${pricePreview.pricing.serviceFee.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-stitch-surface-container-high pt-2 space-y-1">
                                            <div className="flex justify-between text-label-sm text-stitch-on-surface-variant">
                                                <span>Current total</span>
                                                <span>${pricePreview.current.total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-label-md font-semibold text-stitch-primary">
                                                <span>New total</span>
                                                <span>${pricePreview.pricing.total.toFixed(2)}</span>
                                            </div>
                                            {pricePreview.pricing.total !== pricePreview.current.total && (
                                                <div className={`flex justify-between text-label-sm ${pricePreview.pricing.total < pricePreview.current.total ? 'text-green-600' : 'text-stitch-error'}`}>
                                                    <span>{pricePreview.pricing.total < pricePreview.current.total ? 'You save' : 'Price increase'}</span>
                                                    <span>{pricePreview.pricing.total < pricePreview.current.total ? '-' : '+'}${Math.abs(pricePreview.pricing.total - pricePreview.current.total).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDatesOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleModifyDates}
                            disabled={!newCheckIn || !newCheckOut || modifying}
                        >
                            {modifying ? 'Saving...' : 'Confirm Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={guestsOpen} onOpenChange={setGuestsOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Guests</DialogTitle>
                        <DialogDescription>
                            How many guests will be staying? (max {booking.maxGuests})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="number"
                            min={1}
                            max={booking.maxGuests}
                            value={newGuests}
                            onChange={(e) => setNewGuests(parseInt(e.target.value) || 1)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGuestsOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleModifyGuests}
                            disabled={modifying || newGuests === booking.guests}
                        >
                            {modifying ? 'Saving...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Additional Payment Required</DialogTitle>
                        <DialogDescription>
                            The new dates cost <span className="font-semibold text-stitch-on-surface">
                                ${pricePreview ? (pricePreview.pricing.total - pricePreview.current.total).toFixed(2) : '0.00'}
                            </span> more than your current booking. Select a payment method to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {booking.paymentMethods && booking.paymentMethods.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-label-sm font-semibold text-stitch-on-surface-variant uppercase tracking-wider">Saved cards</p>
                                {booking.paymentMethods.map((pm) => (
                                    <label
                                        key={pm.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                            selectedPaymentMethod === pm.id
                                                ? 'border-stitch-primary bg-stitch-primary-container/20'
                                                : 'border-stitch-outline-variant/30 hover:border-stitch-outline-variant'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            checked={selectedPaymentMethod === pm.id}
                                            onChange={() => setSelectedPaymentMethod(pm.id)}
                                            className="text-stitch-primary focus:ring-stitch-primary"
                                        />
                                        <div className="flex-1">
                                            <p className="text-label-md text-stitch-on-surface">{pm.brand} ending in {pm.card_last4}</p>
                                            <p className="text-label-sm text-stitch-on-surface-variant">Expires {pm.expires_at}</p>
                                        </div>
                                        {pm.is_default && (
                                            <span className="text-label-xs text-stitch-secondary bg-stitch-secondary/10 px-2 py-0.5 rounded-full">Default</span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        )}

                        <label
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedPaymentMethod === 'new'
                                    ? 'border-stitch-primary bg-stitch-primary-container/20'
                                    : 'border-stitch-outline-variant/30 hover:border-stitch-outline-variant'
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                checked={selectedPaymentMethod === 'new'}
                                onChange={() => setSelectedPaymentMethod('new')}
                                className="mt-1 text-stitch-primary focus:ring-stitch-primary"
                            />
                            <div className="flex-1 space-y-3">
                                <p className="text-label-md text-stitch-on-surface">Add new card</p>
                                {selectedPaymentMethod === 'new' && (
                                    <div className="space-y-3">
                                        <Input
                                            className="bg-white"
                                            placeholder="Cardholder Name"
                                            value={newCard.cardholder_name}
                                            onChange={(e) => setNewCard((c) => ({ ...c, cardholder_name: e.target.value }))}
                                        />
                                        <Input
                                            className="bg-white"
                                            placeholder="Card Number"
                                            value={newCard.card_number}
                                            onChange={(e) => setNewCard((c) => ({ ...c, card_number: e.target.value }))}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                className="bg-white"
                                                placeholder="MM/YY"
                                                value={newCard.expiry}
                                                onChange={(e) => setNewCard((c) => ({ ...c, expiry: e.target.value }))}
                                            />
                                            <Input
                                                className="bg-white"
                                                placeholder="CVC"
                                                value={newCard.cvc}
                                                onChange={(e) => setNewCard((c) => ({ ...c, cvc: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmPayment}
                            disabled={!selectedPaymentMethod || modifying || (selectedPaymentMethod === 'new' && (!newCard.cardholder_name || !newCard.card_number))}
                        >
                            {modifying ? 'Processing...' : 'Confirm Payment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
