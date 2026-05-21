<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Property $property): Response
    {
        $property->load('inventory');

        $existingDates = $property->inventory->pluck('date')
            ->map(fn ($d) => $d->format('Y-m-d'))
            ->values();

        $inventory = collect();

        for ($i = 0; $i < 90; $i++) {
            $date = Carbon::today()->addDays($i);
            $dateStr = $date->format('Y-m-d');

            $record = $property->inventory->firstWhere(fn ($inv) => $inv->date->format('Y-m-d') === $dateStr);

            $inventory->push([
                'id' => $record?->id,
                'date' => $dateStr,
                'is_available' => $record?->is_available ?? true,
                'price' => (float) ($record?->price ?? $property->base_price),
                'closed' => $record?->closed ?? false,
            ]);
        }

        return Inertia::render('admin/properties/inventory', [
            'property' => [
                'id' => $property->id,
                'title' => $property->title,
                'base_price' => (float) $property->base_price,
            ],
            'inventory' => $inventory,
            'existingDates' => $existingDates,
        ]);
    }

    public function generate(Request $request, Property $property): RedirectResponse
    {
        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'days' => ['nullable', 'integer', 'min:1', 'max:730'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'weekend_pricing' => ['nullable', 'boolean'],
            'weekend_surcharge' => ['nullable', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $count = 0;
        $start = Carbon::parse($validated['start_date'] ?? Carbon::today());
        $days = (int) ($validated['days'] ?? 180);
        $customPrice = $validated['price'] ?? null;
        $weekendSurcharge = (float) ($validated['weekend_surcharge'] ?? 350);
        $useWeekendPricing = (bool) ($validated['weekend_pricing'] ?? true);
        $isAvailable = (bool) ($validated['is_available'] ?? true);

        for ($i = 0; $i < $days; $i++) {
            $date = $start->copy()->addDays($i);
            $exists = $property->inventory()
                ->whereDate('date', $date)
                ->exists();

            if (! $exists) {
                $isWeekend = $useWeekendPricing && in_array($date->dayOfWeekIso, [5, 6, 7], true);
                $property->inventory()->create([
                    'date' => $date->toDateString(),
                    'is_available' => $isAvailable,
                    'price' => $isWeekend
                        ? ($customPrice ?? $property->base_price) + $weekendSurcharge
                        : ($customPrice ?? $property->base_price),
                    'closed' => false,
                ]);
                $count++;
            }
        }

        return back()->with('flash', [
            'type' => 'success',
            'message' => "{$count} inventory records generated across {$days} days.",
        ]);
    }

    public function update(Request $request, Property $property): RedirectResponse
    {
        $validated = $request->validate([
            'dates' => ['required', 'array'],
            'dates.*.date' => ['required', 'date'],
            'dates.*.is_available' => ['nullable', 'boolean'],
            'dates.*.price' => ['nullable', 'numeric', 'min:0'],
            'dates.*.closed' => ['nullable', 'boolean'],
        ]);

        foreach ($validated['dates'] as $item) {
            Inventory::query()->updateOrCreate(
                [
                    'property_id' => $property->id,
                    'date' => $item['date'],
                ],
                [
                    'is_available' => $item['is_available'] ?? true,
                    'price' => $item['price'] ?? $property->base_price,
                    'closed' => $item['closed'] ?? false,
                ]
            );
        }

        return back()->with('flash', ['type' => 'success', 'message' => 'Inventory updated successfully.']);
    }
}
