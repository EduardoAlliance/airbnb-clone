<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::query()
            ->where('status', 'confirmed')
            ->with(['guest', 'property'])
            ->first();

        if (! $booking) {
            return;
        }

        $booking->reviews()->updateOrCreate(
            [
                'booking_id' => $booking->id,
                'author_id' => $booking->guest_id,
            ],
            [
                'property_id' => $booking->property_id,
                'subject_user_id' => $booking->property->host_id,
                'rating' => 5,
                'cleanliness_rating' => 5,
                'communication_rating' => 5,
                'comment' => 'Excelente estancia, muy limpia y con una atención impecable del anfitrión.',
                'published_at' => now()->subHours(6),
            ],
        );
    }
}
