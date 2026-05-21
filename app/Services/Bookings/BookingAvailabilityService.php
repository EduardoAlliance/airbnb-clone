<?php

namespace App\Services\Bookings;

use App\Models\Property;
use Illuminate\Support\Carbon;

class BookingAvailabilityService
{
    public function availabilityWindow(Property $property, int $days = 120): array
    {
        $start = Carbon::today();
        $lastInventoryDate = $property->inventory->max('date');
        $end = $lastInventoryDate
            ? Carbon::parse($lastInventoryDate)
            : Carbon::today()->addDays($days);
        $blockedDates = $this->blockedDates($property);

        $inventory = $property->inventory->keyBy(fn ($item) => $item->date?->toDateString());
        $window = [];

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $dateKey = $date->toDateString();
            $item = $inventory->get($dateKey);
            $booked = isset($blockedDates[$dateKey]);

            $window[] = [
                'date' => $dateKey,
                'price' => (float) ($item?->price ?? $property->base_price),
                'isAvailable' => $item
                    ? (bool) $item->is_available && ! (bool) $item->closed && ! $booked
                    : false,
                'closed' => $item ? (bool) $item->closed : false,
                'booked' => $booked,
            ];
        }

        return $window;
    }

    public function blockedDates(Property $property, array $statuses = ['reserved', 'confirmed']): array
    {
        $blocked = [];

        foreach ($property->bookings->whereIn('status', $statuses) as $booking) {
            $start = Carbon::parse($booking->check_in);
            $end = Carbon::parse($booking->check_out);

            while ($start->lt($end)) {
                $blocked[$start->toDateString()] = true;
                $start->addDay();
            }
        }

        return $blocked;
    }

    public function isRangeAvailable(Property $property, string $checkIn, string $checkOut): bool
    {
        $start = Carbon::parse($checkIn);
        $end = Carbon::parse($checkOut);

        if ($end->lte($start)) {
            return false;
        }

        $blockedDates = $this->blockedDates($property);
        $inventory = $property->inventory->keyBy(fn ($item) => $item->date->toDateString());
        $cursor = $start->copy();

        while ($cursor->lt($end)) {
            $dateKey = $cursor->toDateString();
            $day = $inventory->get($dateKey);

            if (isset($blockedDates[$dateKey]) || ($day && (! $day->is_available || $day->closed))) {
                return false;
            }

            $cursor->addDay();
        }

        return true;
    }
}
