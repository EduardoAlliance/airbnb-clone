<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingCancelledNotification extends Notification
{
    public function __construct(
        public Booking $booking,
        public string $reservationId,
        public array $refundDetails,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->greeting('Hi ' . $notifiable->name . ',')
            ->subject('Reservation Cancelled - ' . $this->reservationId)
            ->line('Your reservation has been cancelled.')
            ->line('Property: ' . $this->booking->property->title)
            ->line('Reservation: ' . $this->reservationId);

        if ($this->refundDetails['refund_amount'] > 0) {
            $mail->line('Refund amount: $' . number_format($this->refundDetails['refund_amount'], 2))
                ->line('The refund will be processed to your original payment method.')
                ->line('Please allow up to 30 business days for the refund to appear in your account, depending on your bank or payment provider.');
        } else {
            $mail->line('No refund will be issued under the applicable cancellation policy.');
        }

        $mail->line('If you have any questions, please contact our support team.');

        return $mail;
    }
}
