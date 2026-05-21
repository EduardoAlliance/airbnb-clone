<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\DeliveryAttempt;
use App\Models\Message;
use App\Models\Payment;
use App\Models\UserNotification;
use App\Services\Bookings\CancellationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        private readonly CancellationService $cancellationService,
    ) {
    }
    public function index(Request $request): Response
    {
        $query = Booking::with(['guest', 'property', 'payment']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('guest', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('property', fn ($q) => $q->where('title', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $paginator = $query->latest()->paginate(15);

        $bookings = collect($paginator->items())->map(fn (Booking $b) => [
            'id' => $b->id,
            'guest_name' => $b->guest->name,
            'guest_email' => $b->guest->email,
            'property' => $b->property->title,
            'check_in' => $b->check_in?->format('M d, Y'),
            'check_out' => $b->check_out?->format('M d, Y'),
            'nights' => $b->check_in?->diffInDays($b->check_out),
            'total' => (float) $b->total,
            'status' => $b->status,
            'created_at' => $b->created_at->format('Y-m-d'),
        ]);

        return Inertia::render('admin/reservations/index', [
            'bookings' => [
                'data' => $bookings,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Booking $booking): Response
    {
        $booking->load(['guest', 'property.host', 'property.propertyMedia', 'payment', 'payout', 'modifications.paymentMethod']);

        $refund = $this->cancellationService->calculateRefund($booking);

        return Inertia::render('admin/reservations/show', [
            'booking' => [
                'id' => $booking->id,
                'reservation_id' => sprintf('#EGR-%06d', $booking->id),
                'status' => $booking->status,
                'check_in' => $booking->check_in?->format('M d, Y'),
                'check_out' => $booking->check_out?->format('M d, Y'),
                'original_check_in' => $booking->original_check_in?->format('M d, Y'),
                'nights' => $booking->check_in?->diffInDays($booking->check_out),
                'guests' => $booking->guests_count,
                'subtotal' => (float) $booking->subtotal,
                'total' => (float) $booking->total,
                'created_at' => $booking->created_at->format('M d, Y'),
                'guest' => [
                    'id' => $booking->guest->id,
                    'name' => $booking->guest->name,
                    'email' => $booking->guest->email,
                ],
                'property' => [
                    'id' => $booking->property->id,
                    'title' => $booking->property->title,
                    'image' => $booking->property->getFirstMediaUrl('images', 'thumb') ?: '',
                ],
                'payment' => $booking->payment ? [
                    'amount' => (float) $booking->payment->amount,
                    'service_fee' => (float) $booking->payment->service_fee,
                    'cleaning_fee' => (float) $booking->payment->cleaning_fee,
                    'status' => $booking->payment->status,
                    'paid_at' => $booking->payment->paid_at?->format('M d, Y'),
                    'refund_amount' => (float) $booking->payment->refund_amount,
                    'platform_kept' => (float) $booking->payment->platform_kept,
                ] : null,
                'payout' => $booking->payout ? [
                    'host_earnings' => (float) $booking->payout->host_earnings,
                    'platform_commission' => (float) $booking->payout->platform_commission,
                    'status' => $booking->payout->status,
                ] : null,
                'cancellationPolicy' => $booking->cancellation_policy_applied,
                'refundEstimate' => $refund,
                'modifications' => $booking->modifications->map(fn ($m) => [
                    'id' => $m->id,
                    'type' => $m->type,
                    'before' => $m->before,
                    'after' => $m->after,
                    'amount_change' => (float) $m->amount_change,
                    'payment_method' => $m->paymentMethod ? [
                        'brand' => $m->paymentMethod->brand,
                        'card_last4' => $m->paymentMethod->card_last4,
                    ] : null,
                    'created_at' => $m->created_at->format('M d, Y g:i A'),
                ]),
            ],
        ]);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        try {
            $this->cancellationService->cancel($booking, null, 'Cancelled by admin');
        } catch (\RuntimeException $e) {
            return back()->with('flash', ['type' => 'error', 'message' => $e->getMessage()]);
        }

        return back()->with('flash', ['type' => 'info', 'message' => 'Booking cancelled successfully.']);
    }

    public function confirm(Booking $booking): RedirectResponse
    {
        if ($booking->status !== 'reserved') {
            return back()->with('flash', ['type' => 'error', 'message' => 'Only reserved bookings can be confirmed.']);
        }

        $booking->update(['status' => 'confirmed']);

        return back()->with('flash', ['type' => 'success', 'message' => 'Booking confirmed successfully.']);
    }
}
