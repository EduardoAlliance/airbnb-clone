<?php

namespace App\Services\Bookings;

use App\Models\Booking;
use App\Models\Message;
use App\Models\NotificationEvent;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Property;
use App\Models\User;
use App\Models\UserNotification;
use App\Jobs\SendBookingEmail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingCheckoutService
{
    public function confirm(User $guest, Property $property, array $validated, array $pricing): Booking
    {
        $property->loadMissing(['inventory', 'host']);

        $cancellationPolicy = $property->policies()
            ->wherePivot('type', 'cancellation')
            ->first();

        return DB::transaction(function () use ($guest, $property, $validated, $pricing, $cancellationPolicy) {
            $booking = Booking::query()->create([
                'guest_id' => $guest->id,
                'property_id' => $property->id,
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'original_check_in' => $validated['check_in'],
                'status' => 'confirmed',
                'cancellation_policy_applied' => [
                    'policy' => $cancellationPolicy?->slug ?? 'flexible',
                    'policy_name' => $cancellationPolicy?->name ?? 'Flexible',
                    'refund_rules' => $cancellationPolicy?->rules ?? [
                        'before_14_days' => 100,
                        'before_7_days' => 75,
                        'after' => 0,
                    ],
                    'payment_mode' => 'simulated',
                ],
                'reserved_until' => null,
                'guests_count' => $validated['guests'],
                'subtotal' => $pricing['subtotal'],
                'total' => $pricing['total'],
            ]);

            Payment::query()->create([
                'booking_id' => $booking->id,
                'amount' => $pricing['total'],
                'service_fee' => $pricing['serviceFee'],
                'cleaning_fee' => (float) $property->cleaning_fee,
                'taxes' => 0,
                'status' => 'succeeded',
                'provider' => 'simulation',
                'provider_reference' => 'sim_'.$booking->id.'_'.Str::upper(Str::random(6)),
                'idempotency_key' => (string) Str::uuid(),
                'paid_at' => now(),
            ]);

            Payout::query()->create([
                'booking_id' => $booking->id,
                'host_id' => $property->host_id,
                'host_earnings' => round($pricing['subtotal'] + (float) $property->cleaning_fee, 2),
                'platform_commission' => $pricing['serviceFee'],
                'status' => 'pending',
            ]);

            $this->markInventoryUnavailable($property, $validated['check_in'], $validated['check_out']);
            $this->createNotifications($booking);

            return $booking;
        });
    }

    private function markInventoryUnavailable(Property $property, string $checkIn, string $checkOut): void
    {
        $property->inventory()
            ->whereDate('date', '>=', $checkIn)
            ->whereDate('date', '<', $checkOut)
            ->update(['is_available' => false]);
    }

    private function createNotifications(Booking $booking): void
    {
        $booking->loadMissing(['guest', 'property.host']);

        $guestEvent = NotificationEvent::query()->where('name', 'booking.confirmed')->first();
        $hostEvent = NotificationEvent::query()->where('name', 'booking.created')->first();
        $propertyTitle = $booking->property->title;
        $reservationId = $this->reservationId($booking);

        $this->createNotificationRecord(
            booking: $booking,
            user: $booking->guest,
            event: $guestEvent,
            eventName: 'booking.confirmed',
            subject: 'Your reservation is confirmed',
            body: "Your stay at {$propertyTitle} is confirmed. Reservation {$reservationId}.",
            data: [
                'booking_id' => $booking->id,
                'reservation_id' => $reservationId,
                'property' => $propertyTitle,
            ],
        );

        if ($booking->property->host) {
            $this->createNotificationRecord(
                booking: $booking,
                user: $booking->property->host,
                event: $hostEvent,
                eventName: 'booking.created',
                subject: 'You received a new reservation',
                body: "{$booking->guest->name} booked {$propertyTitle}. Reservation {$reservationId}.",
                data: [
                    'booking_id' => $booking->id,
                    'reservation_id' => $reservationId,
                    'property' => $propertyTitle,
                    'guest' => $booking->guest->name,
                ],
            );
        }
    }

    private function createNotificationRecord(
        Booking $booking,
        User $user,
        ?NotificationEvent $event,
        string $eventName,
        string $subject,
        string $body,
        array $data,
    ): void {
        $notification = UserNotification::query()->create([
            'user_id' => $user->id,
            'event_id' => $event?->id,
            'event_name' => $eventName,
            'data' => $data,
        ]);

        $message = Message::query()->create([
            'notification_id' => $notification->id,
            'channel' => 'email',
            'recipient' => $user->email,
            'subject' => $subject,
            'body' => $body,
            'payload' => $data,
            'status' => 'queued',
            'queued_at' => now(),
        ]);

        SendBookingEmail::dispatch($message, $booking, $eventName);
    }

    private function reservationId(Booking $booking): string
    {
        return sprintf('#EGR-%06d', $booking->id);
    }
}
