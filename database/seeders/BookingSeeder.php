<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $guest = User::query()->where('email', 'guest@airbnb.local')->first();

        if (! $guest) {
            return;
        }

        $bookings = [
            [
                'property_slug' => 'cabana-bosque-azul',
                'check_in' => Carbon::today()->addDays(5)->toDateString(),
                'check_out' => Carbon::today()->addDays(8)->toDateString(),
                'status' => 'confirmed',
                'reserved_until' => null,
                'guests_count' => 4,
            ],
            [
                'property_slug' => 'refugio-lago-escondido',
                'check_in' => Carbon::today()->addDays(12)->toDateString(),
                'check_out' => Carbon::today()->addDays(14)->toDateString(),
                'status' => 'reserved',
                'reserved_until' => Carbon::now()->addMinutes(15),
                'guests_count' => 2,
            ],
        ];

        foreach ($bookings as $data) {
            $property = Property::query()->where('slug', $data['property_slug'])->first();

            if (! $property) {
                continue;
            }

            $nights = Carbon::parse($data['check_in'])->diffInDays(Carbon::parse($data['check_out']));
            $subtotal = $property->base_price * $nights;
            $total = $subtotal + $property->cleaning_fee;

            Booking::query()->updateOrCreate(
                [
                    'guest_id' => $guest->id,
                    'property_id' => $property->id,
                    'check_in' => $data['check_in'],
                    'check_out' => $data['check_out'],
                ],
                [
                    'status' => $data['status'],
                    'cancellation_policy_applied' => [
                        'policy' => $property->policies()->first()?->slug ?? 'flexible',
                        'refund_rules' => $property->policies()->first()?->rules ?? [],
                    ],
                    'reserved_until' => $data['reserved_until'],
                    'guests_count' => $data['guests_count'],
                    'subtotal' => $subtotal,
                    'total' => $total,
                ],
            );
        }
    }
}
