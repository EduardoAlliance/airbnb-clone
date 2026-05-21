import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GenerateInventoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (config: GenerateConfig) => void;
    basePrice: number;
    existingDates: string[];
    generating: boolean;
}

export interface GenerateConfig {
    start_date: string;
    days: number;
    price: number;
    weekend_pricing: boolean;
    weekend_surcharge: number;
    is_available: boolean;
}

export function GenerateInventoryModal({
    open,
    onOpenChange,
    onGenerate,
    basePrice,
    existingDates,
    generating,
}: GenerateInventoryModalProps) {
    const today = new Date().toISOString().slice(0, 10);

    const [startDate, setStartDate] = useState(today);
    const [days, setDays] = useState(180);
    const [price, setPrice] = useState(basePrice);
    const [weekendPricing, setWeekendPricing] = useState(true);
    const [weekendSurcharge, setWeekendSurcharge] = useState(350);
    const [markAvailable, setMarkAvailable] = useState(true);

    const estimatedEnd = new Date(startDate);
    estimatedEnd.setDate(estimatedEnd.getDate() + days);

    const existingSet = new Set(existingDates);
    let existingCount = 0;
    const iter = new Date(startDate);
    for (let i = 0; i < days; i++) {
        const key = iter.toISOString().slice(0, 10);
        if (existingSet.has(key)) existingCount++;
        iter.setDate(iter.getDate() + 1);
    }
    const newCount = days - existingCount;

    function handleSubmit() {
        onGenerate({
            start_date: startDate,
            days,
            price,
            weekend_pricing: weekendPricing,
            weekend_surcharge: weekendSurcharge,
            is_available: markAvailable,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Generate Inventory</DialogTitle>
                    <DialogDescription>
                        Create inventory records for a range of dates.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-label-sm text-stitch-on-surface-variant mb-1">
                                Start date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-lowest px-3 py-2 text-body-md text-stitch-on-surface focus:outline-none focus:ring-2 focus:ring-stitch-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-label-sm text-stitch-on-surface-variant mb-1">
                                Days
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={730}
                                value={days}
                                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                                className="w-full rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-lowest px-3 py-2 text-body-md text-stitch-on-surface focus:outline-none focus:ring-2 focus:ring-stitch-primary"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={markAvailable}
                            onChange={(e) => setMarkAvailable(e.target.checked)}
                            className="size-5 rounded border-stitch-outline-variant text-stitch-primary focus:ring-stitch-primary"
                        />
                        <span className="text-body-md text-stitch-on-surface">
                            Mark as available
                        </span>
                    </label>

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
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-lowest px-7 py-2 text-body-md text-stitch-on-surface focus:outline-none focus:ring-2 focus:ring-stitch-primary"
                            />
                        </div>
                    </div>

                    <div className="border-t border-stitch-outline-variant/30 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                checked={weekendPricing}
                                onChange={(e) => setWeekendPricing(e.target.checked)}
                                className="size-5 rounded border-stitch-outline-variant text-stitch-primary focus:ring-stitch-primary"
                            />
                            <span className="text-body-md text-stitch-on-surface">
                                Weekend pricing (Fri–Sun)
                            </span>
                        </label>

                        {weekendPricing && (
                            <div>
                                <label className="block text-label-sm text-stitch-on-surface-variant mb-1">
                                    Weekend surcharge (per night)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-md text-stitch-on-surface-variant">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        step="1"
                                        value={weekendSurcharge}
                                        onChange={(e) =>
                                            setWeekendSurcharge(parseFloat(e.target.value) || 0)
                                        }
                                        className="w-full rounded-lg border border-stitch-outline-variant bg-stitch-surface-container-lowest px-7 py-2 text-body-md text-stitch-on-surface focus:outline-none focus:ring-2 focus:ring-stitch-primary"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-stitch-surface-variant/30 rounded-lg p-3 text-label-sm text-stitch-on-surface-variant space-y-1">
                        <p>
                            <span className="font-semibold text-stitch-on-surface">Range:</span>{' '}
                            {new Date(startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}{' '}
                            –{' '}
                            {estimatedEnd.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                        <p>
                            <span className="font-semibold text-stitch-on-surface">Nights:</span> {days}
                        </p>
                        <p>
                            <span className="font-semibold text-stitch-on-surface">Price:</span> $
                            {price.toFixed(2)} / night
                        </p>
                        {weekendPricing && (
                            <p>
                                <span className="font-semibold text-stitch-on-surface">Weekend:</span> $
                                {weekendSurcharge} surcharge (Fri–Sun)
                            </p>
                        )}
                        <p>
                            <span className="font-semibold text-stitch-on-surface">Available:</span>{' '}
                            {markAvailable ? 'Yes' : 'No'}
                        </p>
                        {existingCount > 0 && (
                            <p className="text-amber-600">
                                <span className="font-semibold">Note:</span> {existingCount} date(s)
                                already have records and will be skipped. {newCount} new record(s) will be
                                created.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={generating}>
                        {generating ? 'Generating...' : 'Generate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
