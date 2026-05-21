<?php

namespace App\Services\Bookings;

use App\Models\Property;
use Illuminate\Support\Carbon;

class BookingPricingService
{
    public function __construct(
        private readonly BookingAvailabilityService $availabilityService,
    ) {
    }

    public function calculate(Property $property, ?string $checkIn, ?string $checkOut): array
    {
        if (! $checkIn || ! $checkOut) {
            return $this->emptyPricing((float) $property->cleaning_fee);
        }

        $start = Carbon::parse($checkIn);
        $end = Carbon::parse($checkOut);

        if ($end->lte($start)) {
            return $this->emptyPricing((float) $property->cleaning_fee);
        }

        if (! $this->availabilityService->isRangeAvailable($property, $checkIn, $checkOut)) {
            return $this->emptyPricing((float) $property->cleaning_fee);
        }

        $inventory = $property->inventory->keyBy(fn ($item) => $item->date->toDateString());
        $cursor = $start->copy();
        $subtotal = 0.0;
        $nights = 0;
        $nightlyBreakdown = [];

        while ($cursor->lt($end)) {
            $dateKey = $cursor->toDateString();
            $day = $inventory->get($dateKey);
            $nightPrice = round((float) ($day->price ?? $property->base_price), 2);

            $subtotal += $nightPrice;
            $nightlyBreakdown[] = [
                'date' => $dateKey,
                'price' => $nightPrice,
            ];
            $nights++;
            $cursor->addDay();
        }

        $subtotal = round($subtotal, 2);
        $serviceFee = round($subtotal * 0.12, 2);
        $total = round($subtotal + (float) $property->cleaning_fee + $serviceFee, 2);

        return [
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
            'nights' => $nights,
            'subtotal' => $subtotal,
            'nightlyBreakdown' => $nightlyBreakdown,
            'serviceFee' => $serviceFee,
            'total' => $total,
        ];
    }

    private function emptyPricing(float $cleaningFee): array
    {
        return [
            'checkIn' => null,
            'checkOut' => null,
            'nights' => 0,
            'subtotal' => 0,
            'nightlyBreakdown' => [],
            'serviceFee' => 0,
            'total' => $cleaningFee,
        ];
    }
}
