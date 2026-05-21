<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingConfirmedNotification extends Notification
{
    public function __construct(
        public Booking $booking,
        public string $reservationId,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('Your reservation is confirmed.')
            ->line('Property: ' . $this->booking->property->title)
            ->line('Check-in: ' . $this->booking->check_in)
            ->line('Check-out: ' . $this->booking->check_out)
            ->line('Guests: ' . $this->booking->guests_count)
            ->line('Reservation: ' . $this->reservationId)
            ->line('Thank you for booking with us!');
    }
}
