<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Models\DeliveryAttempt;
use App\Models\Message;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\BookingCreatedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBookingEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Message $message,
        public Booking $booking,
        public string $eventName,
    ) {}

    public function handle(): void
    {
        $notification = match ($this->eventName) {
            'booking.confirmed' => new BookingConfirmedNotification($this->booking, $this->reservationId()),
            'booking.created' => new BookingCreatedNotification($this->booking, $this->reservationId()),
            'booking.cancelled' => new BookingCancelledNotification(
                $this->booking,
                $this->reservationId(),
                $this->message->payload['refund'] ?? [],
            ),
            default => throw new \InvalidArgumentException("Unknown event: {$this->eventName}"),
        };

        $this->message->notification->user->notify($notification);

        $this->message->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        DeliveryAttempt::query()->create([
            'message_id' => $this->message->id,
            'status' => 'success',
            'provider_response' => ['provider' => 'mail', 'message' => 'delivered'],
            'attempted_at' => now(),
        ]);
    }

    public function failed(\Throwable $e): void
    {
        $this->message->update(['status' => 'failed']);

        DeliveryAttempt::query()->create([
            'message_id' => $this->message->id,
            'status' => 'failed',
            'error' => $e->getMessage(),
            'provider_response' => ['provider' => 'mail', 'error' => $e->getMessage()],
            'attempted_at' => now(),
        ]);
    }

    private function reservationId(): string
    {
        return sprintf('#EGR-%06d', $this->booking->id);
    }
}
