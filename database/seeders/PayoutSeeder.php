<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class PayoutSeeder extends Seeder
{
    public function run(): void
    {
        $confirmedBookings = Booking::query()
            ->where('status', 'confirmed')
            ->with('property')
            ->get();

        foreach ($confirmedBookings as $booking) {
            $platformCommission = round($booking->subtotal * 0.12, 2);
            $hostEarnings = round($booking->subtotal - $platformCommission, 2);

            $booking->payout()->updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'host_id' => $booking->property->host_id,
                    'host_earnings' => $hostEarnings,
                    'platform_commission' => $platformCommission,
                    'status' => 'pending',
                    'processed_at' => null,
                ],
            );
        }
    }
}
