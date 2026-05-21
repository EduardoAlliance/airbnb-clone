<?php

namespace App\Services\Bookings;

use App\Models\Booking;
use App\Models\Cancellation;
use App\Models\Message;
use App\Models\NotificationEvent;
use App\Models\User;
use App\Models\UserNotification;
use App\Jobs\SendBookingEmail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CancellationService
{
    public function calculateRefund(Booking $booking, ?Carbon $cancelDate = null): array
    {
        $cancelDate = $cancelDate ?? Carbon::now();
        $policy = $booking->cancellation_policy_applied;

        if (! $policy || ! isset($policy['refund_rules'])) {
            $booking->loadMissing(['property.policies']);
            $cancellationPolicy = $booking->property->policies()
                ->wherePivot('type', 'cancellation')
                ->first();
            $rules = $cancellationPolicy?->rules ?? [
                'before_14_days' => 100,
                'before_7_days' => 75,
                'after' => 0,
            ];
        } else {
            $rules = $policy['refund_rules'];
        }

        $originalCheckIn = Carbon::parse($booking->original_check_in ?? $booking->check_in);
        $currentCheckIn = Carbon::parse($booking->check_in);
        $earliestCheckIn = $originalCheckIn->min($currentCheckIn);
        $daysUntilCheckin = (int) $cancelDate->startOfDay()->diffInDays($earliestCheckIn->startOfDay(), false);

        $refundPercent = match (true) {
            $daysUntilCheckin >= 14 => (int) ($rules['before_14_days'] ?? 0),
            $daysUntilCheckin >= 7 => (int) ($rules['before_7_days'] ?? 0),
            default => (int) ($rules['after'] ?? 0),
        };

        $total = (float) $booking->total;
        $subtotal = (float) ($booking->subtotal ?? 0);
        $cleaningFee = (float) ($booking->payment?->cleaning_fee ?? 0);
        $serviceFee = (float) ($booking->payment?->service_fee ?? 0);

        $refundAmount = round($total * $refundPercent / 100, 2);
        $platformRetained = round($total - $refundAmount, 2);

        return [
            'refund_percent' => $refundPercent,
            'days_until_checkin' => $daysUntilCheckin,
            'total' => $total,
            'subtotal' => $subtotal,
            'cleaning_fee' => $cleaningFee,
            'service_fee' => $serviceFee,
            'refund_amount' => $refundAmount,
            'platform_retained' => $platformRetained,
        ];
    }

    public function cancel(Booking $booking, ?User $cancelledBy = null, ?string $reason = null): Booking
    {
        $booking->loadMissing(['payment', 'payout', 'property.inventory']);

        return DB::transaction(function () use ($booking, $cancelledBy, $reason) {
            if (! in_array($booking->status, ['reserved', 'confirmed'])) {
                throw new \RuntimeException('Booking cannot be cancelled in its current status.');
            }

            $refund = $this->calculateRefund($booking);
            $now = Carbon::now();

            $booking->update(['status' => 'cancelled']);

            if ($booking->payment) {
                $booking->payment->update([
                    'status' => 'refunded',
                    'refunded_at' => $now,
                    'refund_amount' => $refund['refund_amount'],
                    'platform_kept' => $refund['platform_retained'],
                ]);
            }

            if ($booking->payout) {
                $booking->payout->delete();
            }

            $booking->property->inventory()
                ->whereDate('date', '>=', $booking->check_in)
                ->whereDate('date', '<', $booking->check_out)
                ->update(['is_available' => true]);

            Cancellation::query()->create([
                'booking_id' => $booking->id,
                'cancelled_by' => $cancelledBy?->id,
                'cancelled_at' => $now,
                'policy_snapshot' => $booking->cancellation_policy_applied,
                'total' => $refund['total'],
                'subtotal' => $refund['subtotal'],
                'cleaning_fee' => $refund['cleaning_fee'],
                'service_fee' => $refund['service_fee'],
                'refund_amount' => $refund['refund_amount'],
                'platform_retained' => $refund['platform_retained'],
                'reason' => $reason,
            ]);

            $this->sendCancellationNotifications($booking, $cancelledBy, $refund);

            return $booking->fresh();
        });
    }

    private function sendCancellationNotifications(Booking $booking, ?User $cancelledBy, array $refund): void
    {
        $booking->loadMissing(['guest', 'property.host']);

        $refundText = $refund['refund_amount'] > 0
            ? sprintf('Refund of $%s will be processed. Please allow up to 30 business days to appear in your account.', number_format($refund['refund_amount'], 2))
            : 'No refund will be issued under the applicable cancellation policy.';

        foreach ([$booking->guest, $booking->property->host] as $recipient) {
            if (! $recipient) {
                continue;
            }

            $isGuest = $recipient->id === $booking->guest_id;
            $subject = $isGuest
                ? 'Your reservation has been cancelled - ' . $this->reservationId($booking)
                : 'A reservation has been cancelled - ' . $this->reservationId($booking);

            $body = sprintf(
                "Reservation %s at %s has been cancelled.\n\n%s\n\nProperty: %s\nCheck-in: %s\nCheck-out: %s\nTotal paid: $%s",
                $this->reservationId($booking),
                $booking->property->title,
                $refundText,
                $booking->property->title,
                $booking->check_in?->format('M d, Y'),
                $booking->check_out?->format('M d, Y'),
                number_format($refund['total'], 2),
            );

            $data = [
                'booking_id' => $booking->id,
                'reservation_id' => $this->reservationId($booking),
                'property' => $booking->property->title,
                'refund_amount' => $refund['refund_amount'],
                'cancelled_by' => $cancelledBy?->name ?? 'System',
                'refund' => $refund,
            ];

            $notification = UserNotification::query()->create([
                'user_id' => $recipient->id,
                'event_id' => null,
                'event_name' => 'booking.cancelled',
                'data' => $data,
            ]);

            $message = Message::query()->create([
                'notification_id' => $notification->id,
                'channel' => 'email',
                'recipient' => $recipient->email,
                'subject' => $subject,
                'body' => $body,
                'payload' => $data,
                'status' => 'queued',
                'queued_at' => now(),
            ]);

            SendBookingEmail::dispatch($message, $booking, 'booking.cancelled');
        }
    }

    private function reservationId(Booking $booking): string
    {
        return '#EGR-'.str_pad((string) $booking->id, 6, '0', STR_PAD_LEFT);
    }
}
