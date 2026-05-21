<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cancellation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CancellationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Cancellation::with(['booking.property', 'cancelledBy']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('booking.property', fn ($q) => $q->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('booking.guest', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        $paginator = $query->latest('cancelled_at')->paginate(15);

        $cancellations = collect($paginator->items())->map(fn (Cancellation $c) => [
            'id' => $c->id,
            'booking_id' => $c->booking_id,
            'reservation_id' => sprintf('#EGR-%06d', $c->booking_id),
            'property' => $c->booking->property->title,
            'guest_name' => $c->booking->guest?->name ?? 'N/A',
            'cancelled_by' => $c->cancelledBy?->name ?? 'System',
            'cancelled_at' => $c->cancelled_at->format('M d, Y H:i'),
            'total' => (float) $c->total,
            'subtotal' => (float) $c->subtotal,
            'cleaning_fee' => (float) $c->cleaning_fee,
            'service_fee' => (float) $c->service_fee,
            'refund_amount' => (float) $c->refund_amount,
            'platform_retained' => (float) $c->platform_retained,
            'reason' => $c->reason,
            'policy_snapshot' => $c->policy_snapshot,
        ]);

        $totals = [
            'total_cancelled' => $query->count(),
            'total_refunded' => (float) $query->sum('refund_amount'),
            'total_platform_kept' => (float) $query->sum('platform_retained'),
            'total_gross' => (float) $query->sum('total'),
        ];

        return Inertia::render('admin/cancellations/index', [
            'cancellations' => [
                'data' => $cancellations,
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
            'totals' => $totals,
            'filters' => $request->only(['search']),
        ]);
    }
}
