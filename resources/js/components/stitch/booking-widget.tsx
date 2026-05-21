import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

interface BookingWidgetProps {
    price: number;
    rating: number;
    reviewCount: number;
    bookingHref: string;
    cleaningFee?: number;
    maxGuests?: number;
    availability?: Array<{
        date: string;
        price: number;
        isAvailable: boolean;
        closed: boolean;
        booked?: boolean;
    }>;
}

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function parseDateKey(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function displayDate(value: string | null): string {
    if (! value) {
        return 'Add date';
    }

    return parseDateKey(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function displayCompactDate(value: string): string {
    return parseDateKey(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function displayCompactPrice(value: number): string {
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    }

    return `$${Math.round(value)}`;
}

function nightsBetween(start: string | null, end: string | null): number {
    if (! start || ! end) {
        return 0;
    }

    const startDate = parseDateKey(start);
    const endDate = parseDateKey(end);
    const diff = endDate.getTime() - startDate.getTime();

    return diff > 0 ? Math.round(diff / 86400000) : 0;
}

export function BookingWidget({
    price,
    rating,
    reviewCount,
    bookingHref,
    cleaningFee = 0,
    maxGuests = 6,
    availability = [],
}: BookingWidgetProps) {
    const availabilityByDate = useMemo(
        () => new Map(availability.map((item) => [item.date, item])),
        [availability],
    );
    const firstAvailableDate = availability.find((item) => item.isAvailable)?.date ?? null;
    const initialMonth = firstAvailableDate ? parseDateKey(firstAvailableDate) : new Date();
    const [visibleMonth, setVisibleMonth] = useState(
        new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
    );
    const [checkIn, setCheckIn] = useState<string | null>(null);
    const [checkOut, setCheckOut] = useState<string | null>(null);
    const [guests, setGuests] = useState(2);
    const [availabilityHint, setAvailabilityHint] = useState<string | null>(null);
    const currentMonth = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }, []);
    const maxMonth = useMemo(() => {
        const dates = availability.map((item) => parseDateKey(item.date));
        if (dates.length === 0) {
            return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 1);
        }
        const max = new Date(Math.max(...dates.map((d) => d.getTime())));
        return new Date(max.getFullYear(), max.getMonth(), 1);
    }, [availability, currentMonth]);
    const canViewPreviousMonth = visibleMonth.getTime() > currentMonth.getTime();
    const canViewNextMonth = visibleMonth.getTime() < maxMonth.getTime();

    const calendarDays = useMemo(() => {
        const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
        const end = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
        const leading = start.getDay();
        const days: Array<{
            key: string;
            day: number;
            state: 'empty' | 'open' | 'blocked';
            price?: number;
            booked?: boolean;
            closed?: boolean;
        }> = [];

        for (let index = 0; index < leading; index++) {
            days.push({ key: `empty-${index}`, day: 0, state: 'empty' });
        }

        for (let day = 1; day <= end.getDate(); day++) {
            const current = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
            const currentKey = dateKey(current);
            const item = availabilityByDate.get(currentKey);

            days.push({
                key: currentKey,
                day,
                state: item?.isAvailable ? 'open' : 'blocked',
                price: item?.price,
                booked: item?.booked,
                closed: item?.closed,
            });
        }

        return days;
    }, [availabilityByDate, visibleMonth]);

    const nights = nightsBetween(checkIn, checkOut);
    const selectedNightKeys = useMemo(() => {
        if (! checkIn || ! checkOut) {
            return [] as string[];
        }

        const keys: string[] = [];
        const cursor = parseDateKey(checkIn);
        const end = parseDateKey(checkOut);

        while (cursor < end) {
            keys.push(dateKey(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }

        return keys;
    }, [checkIn, checkOut]);
    const subtotal = selectedNightKeys.reduce(
        (sum, item) => sum + (availabilityByDate.get(item)?.price ?? price),
        0,
    );
    const selectedNightlyRates = selectedNightKeys.map((item) => ({
        date: item,
        price: availabilityByDate.get(item)?.price ?? price,
    }));
    const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;
    const total = subtotal + cleaningFee + serviceFee;
    const canReserve = Boolean(checkIn && checkOut && nights > 0);
    const bookingUrl = useMemo(() => {
        if (! canReserve || ! checkIn || ! checkOut) {
            return bookingHref;
        }

        const params = new URLSearchParams({
            check_in: checkIn,
            check_out: checkOut,
            guests: String(guests),
        });

        return `${bookingHref}?${params.toString()}`;
    }, [bookingHref, canReserve, checkIn, checkOut, guests]);

    function isRangeBlocked(start: string, end: string): boolean {
        const cursor = parseDateKey(start);
        const final = parseDateKey(end);

        while (cursor < final) {
            const current = availabilityByDate.get(dateKey(cursor));

            if (! current || ! current.isAvailable) {
                return true;
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        return false;
    }

    function handleDaySelection(dayKey: string): void {
        const item = availabilityByDate.get(dayKey);

        if (! item?.isAvailable) {
            if (item?.booked) {
                setAvailabilityHint('That date is already booked for another stay.');
            } else if (item?.closed) {
                setAvailabilityHint('That date is blocked by the host and cannot be reserved.');
            } else {
                setAvailabilityHint('That date is unavailable right now.');
            }

            return;
        }

        if (! checkIn || (checkIn && checkOut)) {
            setAvailabilityHint(null);
            setCheckIn(dayKey);
            setCheckOut(null);

            return;
        }

        if (dayKey <= checkIn) {
            setAvailabilityHint(null);
            setCheckIn(dayKey);
            setCheckOut(null);

            return;
        }

        if (isRangeBlocked(checkIn, dayKey)) {
            setAvailabilityHint('There is at least one unavailable night inside that date range.');
            setCheckIn(dayKey);
            setCheckOut(null);

            return;
        }

        setAvailabilityHint(null);
        setCheckOut(dayKey);
    }

    function dayClasses(dayKey: string, state: 'empty' | 'open' | 'blocked', booked = false): string {
        if (state === 'empty') {
            return 'invisible';
        }

        const inSelectedRange = checkIn && checkOut && dayKey >= checkIn && dayKey <= checkOut;
        const isStart = checkIn === dayKey;
        const isEnd = checkOut === dayKey;

        if (state === 'blocked') {
            return booked
                ? 'cursor-not-allowed border border-stitch-error/20 bg-stitch-error-container/20 text-stitch-error line-through opacity-70'
                : 'cursor-not-allowed border border-stitch-outline-variant/30 bg-white text-stitch-outline line-through opacity-45';
        }

        if (isStart || isEnd) {
            return 'rounded-full bg-stitch-primary font-bold text-stitch-on-primary';
        }

        if (inSelectedRange) {
            return 'bg-stitch-primary-fixed text-stitch-primary';
        }

        return 'text-stitch-on-surface hover:bg-stitch-surface hover:text-stitch-primary';
    }

    return (
        <div className="sticky top-[112px] rounded-2xl border border-stitch-outline-variant bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-baseline justify-between">
                <div>
                    <span className="text-headline-sm font-bold text-stitch-primary">
                        ${price}
                    </span>
                    <span className="text-body-md text-stitch-on-surface-variant">
                        {' '}
                        / night
                    </span>
                </div>
                <div className="flex items-center gap-1 text-label-sm">
                    <Star className="size-3.5 fill-stitch-secondary text-stitch-secondary" />
                    <span className="font-bold">{rating}</span>
                    <span className="text-stitch-outline">&middot; {reviewCount} reviews</span>
                </div>
            </div>
            <div className="mb-6 overflow-hidden rounded-xl border border-stitch-outline-variant">
                <div className="grid grid-cols-2 border-b border-stitch-outline-variant">
                    <div className="border-r border-stitch-outline-variant p-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stitch-primary">
                            Check-in
                        </label>
                        <span className="text-body-md text-stitch-on-surface">{displayDate(checkIn)}</span>
                    </div>
                    <div className="bg-stitch-primary-container/10 p-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stitch-primary">
                            Check-out
                        </label>
                        <span className="text-body-md font-semibold text-stitch-on-surface">
                            {displayDate(checkOut)}
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 p-3">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stitch-primary">
                            Guests
                        </label>
                        <span className="text-body-md text-stitch-on-surface">{guests} guests</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setGuests((value) => Math.max(1, value - 1))}
                        className="flex size-8 items-center justify-center rounded-full border border-stitch-outline-variant text-stitch-primary transition-colors hover:bg-stitch-surface-container-low"
                    >
                        -
                    </button>
                    <button
                        type="button"
                        onClick={() => setGuests((value) => Math.min(maxGuests, value + 1))}
                        className="flex size-8 items-center justify-center rounded-full border border-stitch-outline-variant text-stitch-primary transition-colors hover:bg-stitch-surface-container-low"
                    >
                        +
                    </button>
                </div>
            </div>
            <div className="mb-6 rounded-xl bg-stitch-surface-container-low p-4">
                <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-stitch-primary">
                        {visibleMonth.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!canViewPreviousMonth}
                            onClick={() =>
                                setVisibleMonth(
                                    (value) => new Date(value.getFullYear(), value.getMonth() - 1, 1),
                                )
                            }
                            className={`rounded-full p-1 transition-colors ${
                                canViewPreviousMonth
                                    ? 'text-stitch-outline hover:bg-white hover:text-stitch-primary'
                                    : 'cursor-not-allowed text-stitch-outline/40'
                            }`}
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            disabled={!canViewNextMonth}
                            onClick={() =>
                                setVisibleMonth(
                                    (value) => new Date(value.getFullYear(), value.getMonth() + 1, 1),
                                )
                            }
                            className={`rounded-full p-1 transition-colors ${
                                canViewNextMonth
                                    ? 'text-stitch-outline hover:bg-white hover:text-stitch-primary'
                                    : 'cursor-not-allowed text-stitch-outline/40'
                            }`}
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-stitch-outline">
                    {weekdayLabels.map((label) => (
                        <span key={label}>{label}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-label-sm">
                    {calendarDays.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            aria-disabled={item.state !== 'open'}
                            onClick={() => item.day && handleDaySelection(item.key)}
                            className={`min-h-12 rounded-2xl px-1 py-1.5 transition-all ${dayClasses(item.key, item.state, item.booked)}`}
                        >
                            {item.day ? (
                                <span className="flex flex-col items-center leading-none">
                                    <span>{item.day}</span>
                                    {item.price ? (
                                        <span className="mt-1 text-[9px] opacity-80">
                                            {displayCompactPrice(item.price)}
                                        </span>
                                    ) : null}
                                </span>
                            ) : ''}
                        </button>
                    ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-stitch-on-surface-variant">
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-stitch-error" />
                        Booked
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-full bg-stitch-outline" />
                        Host blocked
                    </span>
                </div>
                {availabilityHint && (
                    <p className="mt-3 text-label-sm text-stitch-error">{availabilityHint}</p>
                )}
            </div>
            <Link
                href={bookingUrl}
                className={`block w-full rounded-xl py-4 text-center text-label-md shadow-soft transition-all active:scale-95 ${
                    canReserve
                        ? 'bg-stitch-primary text-stitch-on-primary hover:opacity-90'
                        : 'pointer-events-none bg-stitch-outline-variant text-stitch-on-surface-variant'
                }`}
            >
                {canReserve ? 'Reserve Now' : 'Select your dates'}
            </Link>
            <p className="mb-6 mt-2 text-center text-label-sm text-stitch-on-surface-variant">
                You won&apos;t be charged yet
            </p>
            <div className="mb-6 space-y-3">
                <div className="flex justify-between text-body-md">
                    <span className="underline">
                        {nights > 0 ? `${nights} selected nights` : 'Selected nights'}
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                {selectedNightlyRates.length > 0 && (
                    <div className="rounded-xl bg-stitch-surface-container-low p-3">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stitch-primary">
                            Nightly rates
                        </p>
                        <div className="space-y-1.5 text-label-sm text-stitch-on-surface-variant">
                            {selectedNightlyRates.map((item) => (
                                <div key={item.date} className="flex justify-between gap-3">
                                    <span>{displayCompactDate(item.date)}</span>
                                    <span>${item.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-between text-body-md">
                    <span className="underline">Cleaning fee</span>
                    <span>${cleaningFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body-md">
                    <span className="underline">Evergreen service fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex justify-between border-t border-stitch-outline-variant pt-6 text-body-lg font-bold text-stitch-primary">
                <span>Total before taxes</span>
                <span>${total.toFixed(2)}</span>
            </div>
        </div>
    );
}
