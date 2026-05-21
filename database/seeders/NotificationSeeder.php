<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\NotificationEvent;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $host = User::query()->where('email', 'host@airbnb.local')->first();
        $guest = User::query()->where('email', 'guest@airbnb.local')->first();
        $booking = Booking::query()->with('property')->first();

        if (! $host || ! $guest || ! $booking) {
            return;
        }

        $hostEvent = NotificationEvent::query()->where('name', 'booking.created')->first();
        $guestEvent = NotificationEvent::query()->where('name', 'booking.confirmed')->first();

        $notifications = [
            [
                'user' => $host,
                'event' => $hostEvent,
                'event_name' => 'booking.created',
                'data' => [
                    'booking_id' => $booking->id,
                    'property' => $booking->property->title,
                    'guest' => $guest->name,
                ],
                'message' => [
                    'channel' => 'email',
                    'recipient' => $host->email,
                    'subject' => 'Nueva reserva recibida',
                    'body' => 'Tienes una nueva solicitud de reserva en '.$booking->property->title.'.',
                    'status' => 'sent',
                ],
            ],
            [
                'user' => $guest,
                'event' => $guestEvent,
                'event_name' => 'booking.confirmed',
                'data' => [
                    'booking_id' => $booking->id,
                    'property' => $booking->property->title,
                    'check_in' => $booking->check_in?->toDateString(),
                    'check_out' => $booking->check_out?->toDateString(),
                ],
                'message' => [
                    'channel' => 'email',
                    'recipient' => $guest->email,
                    'subject' => 'Tu reserva fue confirmada',
                    'body' => 'Tu reserva en '.$booking->property->title.' está confirmada.',
                    'status' => 'sent',
                ],
            ],
        ];

        foreach ($notifications as $data) {
            $notification = $data['user']->notifications()->updateOrCreate(
                [
                    'user_id' => $data['user']->id,
                    'event_name' => $data['event_name'],
                ],
                [
                    'event_id' => $data['event']?->id,
                    'data' => $data['data'],
                    'read_at' => null,
                ],
            );

            $message = $notification->messages()->updateOrCreate(
                [
                    'notification_id' => $notification->id,
                    'channel' => $data['message']['channel'],
                    'recipient' => $data['message']['recipient'],
                ],
                [
                    'subject' => $data['message']['subject'],
                    'body' => $data['message']['body'],
                    'payload' => $data['data'],
                    'status' => $data['message']['status'],
                    'queued_at' => now()->subMinutes(10),
                    'sent_at' => now()->subMinutes(8),
                ],
            );

            $message->deliveryAttempts()->updateOrCreate(
                [
                    'message_id' => $message->id,
                    'status' => 'success',
                ],
                [
                    'error' => null,
                    'provider_response' => ['provider' => 'sendgrid', 'message' => 'accepted'],
                    'attempted_at' => now()->subMinutes(8),
                ],
            );
        }
    }
}
