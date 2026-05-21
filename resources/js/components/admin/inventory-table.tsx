import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { InventoryDay, InventoryUpdate } from '@/types/inventory';

interface InventoryTableProps {
    inventory: InventoryDay[];
    basePrice: number;
    existingDates: string[];
    pendingUpdates: InventoryUpdate[];
    onUpdate: (date: string, updates: Partial<InventoryDay>) => void;
}

function getMonthData(inventory: InventoryDay[], year: number, month: number) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const data: (InventoryDay | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
        data.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = inventory.find((e) => e.date === dateStr);
        data.push(
            entry ?? {
                id: null,
                date: dateStr,
                is_available: true,
                price: 0,
                closed: false,
            }
        );
    }

    return { data, daysInMonth };
}

export function InventoryTable({
    inventory,
    basePrice,
    existingDates,
    pendingUpdates,
    onUpdate,
}: InventoryTableProps) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<InventoryDay | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editAvailable, setEditAvailable] = useState(true);
    const [editClosed, setEditClosed] = useState(false);

    const existingSet = new Set(existingDates);
    const pendingSet = new Set(pendingUpdates.map((u) => u.date));

    const { data } = getMonthData(inventory, year, month);

    const hasAnyRecords = existingDates.length > 0;
    const lastDate = hasAnyRecords
        ? new Date(Math.max(...existingDates.map((d) => new Date(d).getTime())))
        : null;

    const monthLabel = new Date(year, month).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });

    const prevMonth = () => {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    };

    function goToday() {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
    }

    function openModal(day: InventoryDay) {
        setSelectedDay(day);
        setEditPrice(day.price > 0 ? day.price : basePrice);
        setEditAvailable(day.is_available);
        setEditClosed(day.closed);
    }

    function applyModal() {
        if (!selectedDay) return;
        onUpdate(selectedDay.date, {
            price: editPrice,
            is_available: editAvailable,
            closed: editClosed,
        });
        setSelectedDay(null);
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-2 hover:bg-stitch-surface-variant rounded-lg transition-colors"
                    >
                        <ChevronLeft className="size-5" />
                    </button>
                    <h4 className="font-display text-headline-sm text-stitch-primary min-w-40 text-center">
                        {monthLabel}
                    </h4>
                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-2 hover:bg-stitch-surface-variant rounded-lg transition-colors"
                    >
                        <ChevronRight className="size-5" />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={goToday}
                    className="flex items-center gap-1.5 text-label-sm font-bold text-white bg-stitch-primary hover:bg-stitch-primary-fixed px-3 py-1.5 rounded-lg transition-colors"
                >
                    <CalendarDays className="size-4" />
                    Today
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div
                        key={d}
                        className="text-label-sm text-stitch-outline uppercase font-bold py-2 text-xs lg:text-sm"
                    >
                        {d}
                    </div>
                ))}
                {data.map((day, i) =>
                    day ? (
                        <DateCell
                            key={day.date}
                            day={day}
                            basePrice={basePrice}
                            hasRecord={existingSet.has(day.date)}
                            hasPending={pendingSet.has(day.date)}
                            isToday={day.date === today.toISOString().slice(0, 10)}
                            onClick={() => openModal(day)}
                        />
                    ) : (
                        <div key={`empty-${i}`} />
                    )
                )}
            </div>

            <Dialog open={!!selectedDay} onOpenChange={(open) => !open && setSelectedDay(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Inventory — {selectedDay?.date}</DialogTitle>
                        <DialogDescription>
                            Adjust price, availability, or close this date.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <label className="block text-label-sm text-stitch-on-surface-variant mb-1">
                                Price per night
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-md text-stitch-on-surface-variant">
                                    $
                                </span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-lowest px-7 py-2.5 text-body-md text-stitch-on-surface focus:outline-none focus:ring-2 focus:ring-stitch-primary"
                                />
            </div>

            {lastDate && (
                <p className="text-label-sm text-stitch-on-surface-variant mb-4">
                    Inventory records up to{' '}
                    <span className="font-semibold text-stitch-primary">
                        {lastDate.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                </p>
            )}

            {!hasAnyRecords && (
                <div className="text-center py-12">
                    <p className="text-body-lg text-stitch-on-surface-variant mb-2">
                        No inventory records yet.
                    </p>
                    <p className="text-label-md text-stitch-outline">
                        Click Generate Inventory to create records for the next 6 months, or click a date to
                        add one manually.
                    </p>
                </div>
            )}

            
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editAvailable}
                                onChange={(e) => {
                                    setEditAvailable(e.target.checked);
                                    if (e.target.checked) setEditClosed(false);
                                }}
                                className="size-5 rounded border-stitch-outline-variant text-stitch-primary focus:ring-stitch-primary"
                            />
                            <span className="text-body-md text-stitch-on-surface">Available for booking</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editClosed}
                                onChange={(e) => {
                                    setEditClosed(e.target.checked);
                                    if (e.target.checked) setEditAvailable(false);
                                }}
                                className="size-5 rounded border-stitch-outline-variant text-stitch-error focus:ring-stitch-error"
                            />
                            <span className="text-body-md text-stitch-on-surface">Closed (no bookings)</span>
                        </label>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedDay(null)}>
                            Cancel
                        </Button>
                        <Button onClick={applyModal}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DateCell({
    day,
    basePrice,
    hasRecord,
    hasPending,
    isToday,
    onClick,
}: {
    day: InventoryDay;
    basePrice: number;
    hasRecord: boolean;
    hasPending: boolean;
    isToday: boolean;
    onClick: () => void;
}) {
    const dayNum = new Date(day.date).getDate();

    const bgColor = day.closed
        ? 'bg-stitch-surface-variant opacity-40'
        : !hasRecord && !hasPending
          ? 'bg-amber-100/60'
          : day.is_available
            ? 'bg-stitch-primary-fixed/20'
            : 'bg-stitch-error-container/20';

    const borderColor = hasPending
        ? 'border-amber-400'
        : isToday
          ? 'border-stitch-primary'
          : day.closed
            ? 'border-stitch-surface-variant'
            : !hasRecord && !hasPending
              ? 'border-amber-300'
              : day.is_available
                ? 'border-stitch-primary-fixed'
                : 'border-stitch-error-container';

    const borderStyle = !hasRecord && !hasPending ? 'border-dashed' : 'border-solid';

    return (
        <div
            className={`aspect-square rounded-lg ${bgColor} border-2 ${borderStyle} ${borderColor} p-1 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-soft transition-all relative group`}
            onClick={onClick}
        >
            <span className="text-label-sm font-bold text-stitch-on-surface text-xs lg:text-sm">
                {dayNum}
            </span>
            <span className="text-label-xs lg:text-label-sm text-stitch-on-surface-variant leading-tight">
                ${day.price > 0 ? day.price : basePrice}
            </span>
            {day.closed && (
                <span className="text-label-xs text-stitch-error leading-none">CLOSED</span>
            )}
            {hasPending && (
                <span className="absolute -top-1 -right-1 size-2.5 bg-amber-400 rounded-full border-2 border-white" />
            )}
            {!hasRecord && !hasPending && (
                <span className="text-label-xs text-amber-600/60 leading-none">no record</span>
            )}
        </div>
    );
}
