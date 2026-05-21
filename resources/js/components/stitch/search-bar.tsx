import { Calendar, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import cabins from '@/routes/cabins';

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

function displayCompactDate(value: string): string {
    return parseDateKey(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function SearchBar() {
    const today = new Date();
    const todayKey = dateKey(today);
    const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [checkIn, setCheckIn] = useState<string | null>(null);
    const [checkOut, setCheckOut] = useState<string | null>(null);
    const [guests, setGuests] = useState(2);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentMonth = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }, []);

    const canViewPreviousMonth = visibleMonth.getTime() > currentMonth.getTime();

    const calendarDays = useMemo(() => {
        const start = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
        const end = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
        const leading = start.getDay();
        const days: Array<{ key: string; day: number; state: 'empty' | 'open' | 'before-today' }> = [];

        for (let i = 0; i < leading; i++) {
            days.push({ key: `empty-${i}`, day: 0, state: 'empty' });
        }

        for (let day = 1; day <= end.getDate(); day++) {
            const current = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
            const currentKey = dateKey(current);
            days.push({
                key: currentKey,
                day,
                state: currentKey < todayKey ? 'before-today' : 'open',
            });
        }

        return days;
    }, [visibleMonth, todayKey]);

    function handleDaySelection(dayKey: string) {
        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(dayKey);
            setCheckOut(null);
            return;
        }
        if (dayKey <= checkIn) {
            setCheckIn(dayKey);
            setCheckOut(null);
            return;
        }
        setCheckOut(dayKey);
    }

    function isSelected(dayKey: string): 'start' | 'end' | 'between' | false {
        if (!checkIn) return false;
        if (checkIn === dayKey) return 'start';
        if (checkOut === dayKey) return 'end';
        if (checkOut && dayKey > checkIn && dayKey < checkOut) return 'between';
        return false;
    }

    function handleSearch() {
        const params: Record<string, string> = {};
        if (checkIn) params.check_in = checkIn;
        if (checkOut) params.check_out = checkOut;
        if (guests > 1) params.guests = String(guests);
        const routeUrl = Object.keys(params).length > 0
            ? cabins.index({ query: params }).url
            : cabins.index().url;
        router.get(routeUrl);
    }

    const dateDisplay = checkIn && checkOut
        ? `${displayCompactDate(checkIn)} - ${displayCompactDate(checkOut)}`
        : checkIn
        ? `${displayCompactDate(checkIn)} - Add dates`
        : 'Add dates';

    return (
        <div className="relative flex flex-col items-center gap-2 rounded-xl border border-stitch-outline-variant/30 bg-white p-2 shadow-lg md:flex-row md:p-3">
            <div
                className="w-full cursor-pointer border-b border-stitch-outline-variant px-4 py-2 md:w-auto md:flex-1 md:border-b-0 md:border-r"
                onClick={() => setShowCalendar(true)}
            >
                <label className="mb-1 block text-label-sm uppercase tracking-wider text-stitch-secondary">
                    Check-in / Check-out
                </label>
                <div className="flex items-center gap-2">
                    <Calendar className="size-4 shrink-0 text-stitch-outline" />
                    <span className={`text-body-md ${dateDisplay === 'Add dates' ? 'text-stitch-outline-variant' : 'text-stitch-on-surface'}`}>
                        {dateDisplay}
                    </span>
                </div>
            </div>
            <div className="w-full px-4 py-2 md:w-48">
                <label className="mb-1 block text-label-sm uppercase tracking-wider text-stitch-secondary">
                    Guests
                </label>
                <div className="flex items-center gap-2">
                    <Users className="size-4 shrink-0 text-stitch-outline" />
                    <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full border-none bg-transparent p-0 text-body-md text-stitch-on-surface focus:ring-0"
                    >
                        {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                                {n} {n === 1 ? 'guest' : 'guests'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <button
                onClick={handleSearch}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-stitch-primary px-8 py-4 text-label-md text-stitch-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 md:w-auto"
            >
                <Search className="size-4" />
                <span>Search Cabins</span>
            </button>

            {showCalendar && (
                <div
                    ref={calendarRef}
                    className="absolute left-0 right-auto top-full z-50 mt-2 w-[320px] rounded-xl border border-stitch-outline-variant bg-white p-4 shadow-lg md:left-0"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={!canViewPreviousMonth}
                            onClick={() =>
                                setVisibleMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))
                            }
                            className={`rounded-full p-1 transition-colors ${
                                canViewPreviousMonth
                                    ? 'text-stitch-outline hover:text-stitch-primary'
                                    : 'cursor-not-allowed text-stitch-outline/40'
                            }`}
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <span className="font-bold text-stitch-primary">
                            {visibleMonth.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setVisibleMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))
                            }
                            className="rounded-full p-1 text-stitch-outline transition-colors hover:text-stitch-primary"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                    <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-stitch-outline">
                        {weekdayLabels.map((label) => (
                            <span key={label}>{label}</span>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-label-sm">
                        {calendarDays.map((item) => {
                            const selected = isSelected(item.key);
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    disabled={item.state !== 'open'}
                                    onClick={() => item.state === 'open' && handleDaySelection(item.key)}
                                    className={`min-h-10 rounded-2xl px-1 py-1.5 transition-all ${
                                        item.state === 'before-today'
                                            ? 'cursor-not-allowed text-stitch-outline/20'
                                            : selected === 'start' || selected === 'end'
                                            ? 'rounded-full bg-stitch-primary font-bold text-stitch-on-primary'
                                            : selected === 'between'
                                            ? 'bg-stitch-primary-fixed text-stitch-primary'
                                            : 'text-stitch-on-surface hover:bg-stitch-surface hover:text-stitch-primary'
                                    }`}
                                >
                                    {item.day || ''}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
