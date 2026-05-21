<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingModification;
use App\Models\Payment;
use App\Models\Property;
use App\Models\User;
use App\Models\UserPaymentMethod;
use App\Services\Bookings\BookingAvailabilityService;
use App\Services\Bookings\BookingCheckoutService;
use App\Services\Bookings\BookingPricingService;
use App\Services\Bookings\CancellationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingPricingService $pricingService,
        private readonly BookingCheckoutService $checkoutService,
        private readonly CancellationService $cancellationService,
        private readonly BookingAvailabilityService $availabilityService,
    ) {
    }

    public function show(Request $request, Booking $booking): Response
    {
        abort_unless($request->user()->id === $booking->guest_id, 403);

        $booking->load(['property.host.profile', 'property.propertyMedia', 'payment', 'property.media', 'modifications.paymentMethod']);

        $refund = $this->cancellationService->calculateRefund($booking);
        $availability = $this->availabilityService->availabilityWindow($booking->property);

        return Inertia::render('account/bookings/show', [
            'booking' => [
                'id' => $booking->id,
                'title' => $booking->property->title,
                'location' => $this->locationLabel($booking->property),
                'address' => $booking->property->address,
                'checkIn' => $booking->check_in?->toDateString(),
                'checkOut' => $booking->check_out?->toDateString(),
                'originalCheckIn' => $booking->original_check_in?->toDateString(),
                'checkInTime' => $booking->property->check_in_time,
                'checkOutTime' => $booking->property->check_out_time,
                'nights' => $booking->check_in && $booking->check_out
                    ? $booking->check_in->diffInDays($booking->check_out)
                    : 0,
                'guests' => $booking->guests_count,
                'maxGuests' => $booking->property->guests,
                'status' => $booking->status,
                'reservationId' => $this->reservationId($booking),
                'hostName' => $booking->property->host?->name ?? 'Host',
                'hostSince' => $booking->property->host?->created_at?->format('Y') ?? now()->format('Y'),
                'hostAvatar' => $booking->property->host?->profile?->avatar
                    ? asset('storage/'.$booking->property->host->profile->avatar)
                    : null,
                'hostPhone' => $booking->property->host?->phone,
                'imageUrl' => $this->primaryImageUrl($booking->property),
                'total' => (float) $booking->total,
                'latitude' => $booking->property->latitude ? (float) $booking->property->latitude : null,
                'longitude' => $booking->property->longitude ? (float) $booking->property->longitude : null,
                'cancellationPolicy' => $booking->cancellation_policy_applied,
                'refundEstimate' => $refund,
                'canCancel' => in_array($booking->status, ['reserved', 'confirmed']),
                'availability' => $availability,
                'paymentMethods' => $request->user()->paymentMethods()->get()->map(fn ($pm) => [
                    'id' => $pm->id,
                    'brand' => $pm->brand,
                    'card_last4' => $pm->card_last4,
                    'expires_at' => $pm->expires_at?->format('m/y'),
                    'is_default' => $pm->is_default,
                ]),
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

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($request->user()->id === $booking->guest_id, 403);

        try {
            $this->cancellationService->cancel($booking, $request->user(), 'Cancelled by guest');
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);
            return back();
        } catch (\Throwable $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Something went wrong. Please try again.']);
            return back();
        }

        Inertia::flash('toast', ['type' => 'info', 'message' => 'Booking cancelled successfully.']);

        return to_route('account.bookings.show', $booking);
    }

    public function modify(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($request->user()->id === $booking->guest_id, 403);

        if (in_array($booking->status, ['completed', 'cancelled'])) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Cannot modify a completed or cancelled booking.']);
            return back();
        }

        if ($booking->check_in && $booking->check_in->isFuture() && now()->diffInDays($booking->check_in) < 2) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Modifications are no longer available within 2 days of check-in.']);
            return back();
        }

        $validated = $request->validate([
            'check_in' => ['nullable', 'date', 'after_or_equal:today'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:' . $booking->property->guests],
            'payment_method_id' => ['nullable', 'integer', 'exists:user_payment_methods,id'],
            'cardholder_name' => ['nullable', 'string', 'max:255', 'required_with:card_number'],
            'card_number' => ['nullable', 'string', 'min:12', 'max:32', 'required_with:cardholder_name'],
            'expiry' => ['nullable', 'string', 'max:10', 'required_with:card_number'],
            'cvc' => ['nullable', 'string', 'min:3', 'max:5', 'required_with:expiry'],
        ]);

        $user = $request->user();

        try {
            DB::transaction(function () use ($booking, $validated, $user) {
                if (isset($validated['guests'])) {
                    $oldGuests = $booking->guests_count;
                    $booking->guests_count = $validated['guests'];

                    BookingModification::create([
                        'booking_id' => $booking->id,
                        'type' => 'guests',
                        'before' => ['guests' => $oldGuests],
                        'after' => ['guests' => $validated['guests']],
                        'amount_change' => 0,
                    ]);
                }

                if (isset($validated['check_in']) && isset($validated['check_out'])) {
                    $property = $booking->property->load(['inventory', 'bookings']);
                    $pricing = $this->pricingService->calculate($property, $validated['check_in'], $validated['check_out']);

                    if ($pricing['nights'] === 0) {
                        throw new \RuntimeException('Selected dates are no longer available.');
                    }

                    $oldTotal = (float) $booking->total;
                    $amountChange = round($pricing['total'] - $oldTotal, 2);

                    if ($amountChange > 0) {
                        $paymentMethod = null;

                        if (! empty($validated['payment_method_id'])) {
                            $paymentMethod = UserPaymentMethod::findOrFail($validated['payment_method_id']);
                        } elseif (! empty($validated['card_number'])) {
                            $paymentMethod = UserPaymentMethod::create([
                                'user_id' => $user->id,
                                'provider' => 'simulation',
                                'brand' => $this->detectCardBrand($validated['card_number']),
                                'card_last4' => substr($validated['card_number'], -4),
                                'expires_at' => $this->parseExpiry($validated['expiry']),
                                'is_default' => ! $user->paymentMethods()->exists(),
                            ]);
                        }

                        $newServiceFee = round($pricing['subtotal'] * 0.12, 2);

                        $booking->payment()->update([
                            'amount' => $pricing['total'],
                            'service_fee' => $newServiceFee,
                            'provider_reference' => 'sim_mod_'.$booking->id.'_'.Str::upper(Str::random(6)),
                        ]);
                    }

                    BookingModification::create([
                        'booking_id' => $booking->id,
                        'type' => 'dates',
                        'before' => [
                            'check_in' => $booking->check_in?->toDateString(),
                            'check_out' => $booking->check_out?->toDateString(),
                            'total' => $oldTotal ?? (float) $booking->total,
                        ],
                        'after' => [
                            'check_in' => $validated['check_in'],
                            'check_out' => $validated['check_out'],
                            'total' => $pricing['total'],
                        ],
                        'amount_change' => $amountChange ?? 0,
                        'payment_method_id' => isset($paymentMethod) ? $paymentMethod->id : null,
                    ]);

                    $booking->check_in = $validated['check_in'];
                    $booking->check_out = $validated['check_out'];
                    $booking->subtotal = $pricing['subtotal'];
                    $booking->total = $pricing['total'];
                }

                $booking->save();
            });
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);
            return back();
        } catch (\Throwable $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Something went wrong. Please try again.']);
            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Booking updated successfully.']);

        return to_route('account.bookings.show', $booking);
    }

    private function detectCardBrand(string $cardNumber): string
    {
        $number = preg_replace('/\D/', '', $cardNumber);

        if (preg_match('/^4/', $number)) return 'Visa';
        if (preg_match('/^5[1-5]/', $number)) return 'Mastercard';
        if (preg_match('/^3[47]/', $number)) return 'Amex';
        if (preg_match('/^6(?:011|5)/', $number)) return 'Discover';

        return 'Unknown';
    }

    private function parseExpiry(string $expiry): ?string
    {
        $parts = explode('/', $expiry);
        if (count($parts) !== 2) return null;

        $month = trim($parts[0]);
        $year = trim($parts[1]);

        if (strlen($year) === 2) {
            $year = '20'.$year;
        }

        return "{$year}-{$month}-01";
    }

    public function pricePreview(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($request->user()->id === $booking->guest_id, 403);

        $validated = $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $property = $booking->property->load(['inventory']);
        $pricing = $this->pricingService->calculate(
            $property, $validated['check_in'], $validated['check_out']
        );

        return response()->json([
            'available' => $pricing['nights'] > 0,
            'pricing' => $pricing + ['cleaningFee' => (float) $property->cleaning_fee],
            'current' => [
                'subtotal' => (float) $booking->subtotal,
                'cleaning_fee' => (float) ($booking->property->cleaning_fee ?? 0),
                'total' => (float) $booking->total,
            ],
        ]);
    }

    public function store(Request $request, Property $property): RedirectResponse
    {
        $validated = $request->validate([
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1', 'max:'.$property->guests],
            'cardholder_name' => ['required', 'string', 'max:255'],
            'card_number' => ['required', 'string', 'min:12', 'max:32'],
            'expiry' => ['required', 'string', 'max:10'],
            'cvc' => ['required', 'string', 'min:3', 'max:5'],
        ]);

        $property->load(['inventory', 'bookings', 'host']);
        $pricing = $this->pricingService->calculate($property, $validated['check_in'], $validated['check_out']);

        if ($pricing['nights'] === 0) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Selected dates are no longer available.']);
            return back()
                ->withErrors(['check_in' => 'Selected dates are no longer available.'])
                ->withInput();
        }

        try {
            $booking = $this->checkoutService->confirm($request->user(), $property, $validated, $pricing);
        } catch (\RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);
            return back()->withInput();
        } catch (\Throwable $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Something went wrong. Please try again.']);
            return back()->withInput();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Reservation confirmed. Notifications sent to guest and host.'),
        ]);

        return to_route('account.bookings.show', $booking);
    }
    private function locationLabel(Property $property): string
    {
        return collect([$property->city, $property->state, $property->country])
            ->filter()
            ->join(', ');
    }

    private function primaryImageUrl(Property $property): string
    {
        $spatieUrl = $property->getFirstMediaUrl('images', 'large');
        if ($spatieUrl) {
            return $spatieUrl;
        }

        $media = $property->propertyMedia
            ->sortBy([
                ['is_cover', 'desc'],
                ['sort_order', 'asc'],
            ])
            ->first();

        if ($media) {
            if (str_starts_with($media->path, 'http://') || str_starts_with($media->path, 'https://')) {
                return $media->path;
            }

            return asset('storage/'.$media->path);
        }

        return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
    }

    private function reservationId(Booking $booking): string
    {
        return sprintf('#EGR-%06d', $booking->id);
    }
}
