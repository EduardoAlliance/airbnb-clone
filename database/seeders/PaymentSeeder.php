<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = Booking::query()->with('property')->get();

        foreach ($bookings as $booking) {
            $paymentStatus = $booking->status === 'confirmed' ? 'succeeded' : 'pending';
            $paidAt = $booking->status === 'confirmed' ? now()->subDay() : null;

            $booking->payment()->updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'amount' => $booking->total,
                    'service_fee' => 180,
                    'cleaning_fee' => $booking->property->cleaning_fee,
                    'taxes' => round($booking->subtotal * 0.16, 2),
                    'status' => $paymentStatus,
                    'provider' => 'stripe',
                    'provider_reference' => 'pi_booking_'.$booking->id,
                    'idempotency_key' => 'booking-'.$booking->id.'-payment',
                    'paid_at' => $paidAt,
                    'refunded_at' => null,
                ],
            );
        }
    }
}
