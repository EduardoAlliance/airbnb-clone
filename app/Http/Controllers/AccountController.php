<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $user = $request->user();

        $upcomingBooking = Booking::query()
            ->where('guest_id', $user->id)
            ->whereIn('status', ['reserved', 'confirmed'])
            ->whereDate('check_out', '>=', today())
            ->with(['property.host.profile', 'property.propertyMedia', 'property.media'])
            ->orderBy('check_in')
            ->first();

        $pastBookings = Booking::query()
            ->where('guest_id', $user->id)
            ->where(function ($query) {
                $query
                    ->whereDate('check_out', '<', today())
                    ->orWhereIn('status', ['completed', 'cancelled']);
            })
            ->with(['property.propertyMedia', 'property.media'])
            ->latest('check_in')
            ->limit(6)
            ->get();

        $latestNotifications = UserNotification::query()
            ->where('user_id', $user->id)
            ->with(['messages' => fn ($query) => $query->latest('sent_at')])
            ->latest()
            ->limit(4)
            ->get();

        return Inertia::render('account/dashboard', [
            'upcomingBooking' => $upcomingBooking ? $this->transformUpcomingBooking($upcomingBooking) : null,
            'pastBookings' => $pastBookings->map(fn (Booking $booking) => $this->transformPastBooking($booking))->values(),
            'notifications' => $latestNotifications->map(
                fn (UserNotification $notification) => $this->transformNotification($notification, $user)
            )->values(),
            'stats' => [
                'upcomingCount' => $upcomingBooking ? 1 : 0,
                'pastCount' => $pastBookings->count(),
                'unreadNotifications' => $user->notifications()->whereNull('read_at')->count(),
            ],
        ]);
    }

    public function notifications(Request $request): Response
    {
        $user = $request->user();

        $notifications = UserNotification::query()
            ->where('user_id', $user->id)
            ->with(['messages' => fn ($query) => $query->latest('sent_at')])
            ->latest()
            ->limit(50)
            ->get();

        return Inertia::render('account/notifications', [
            'notifications' => $notifications->map(
                fn (UserNotification $notification) => $this->transformNotification($notification, $user)
            )->values(),
            'counts' => [
                'all' => $notifications->count(),
                'bookings' => $notifications->filter(
                    fn (UserNotification $notification) => $this->notificationCategory($notification) === 'Bookings'
                )->count(),
                'messages' => $notifications->filter(
                    fn (UserNotification $notification) => $this->notificationCategory($notification) === 'Messages'
                )->count(),
                'system' => $notifications->filter(
                    fn (UserNotification $notification) => $this->notificationCategory($notification) === 'System'
                )->count(),
                'unread' => $notifications->whereNull('read_at')->count(),
            ],
            'markAllReadHref' => route('account.notifications.read-all'),
        ]);
    }

    public function markNotificationsRead(Request $request): RedirectResponse
    {
        $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }

    private function transformUpcomingBooking(Booking $booking): array
    {
        $property = $booking->property;

        return [
            'title' => $property->title,
            'location' => $this->locationLabel($property),
            'checkIn' => $booking->check_in?->toDateString(),
            'nights' => $booking->check_in && $booking->check_out
                ? $booking->check_in->diffInDays($booking->check_out)
                : 0,
            'guests' => $booking->guests_count,
            'status' => Str::upper($booking->status),
            'imageUrl' => $this->primaryImageUrl($property),
            'showHref' => route('account.bookings.show', $booking),
        ];
    }

    private function transformPastBooking(Booking $booking): array
    {
        $property = $booking->property;

        return [
            'id' => $booking->id,
            'title' => $property->title,
            'dates' => sprintf(
                '%s - %s',
                $booking->check_in?->format('M d, Y'),
                $booking->check_out?->format('M d, Y'),
            ),
            'guests' => sprintf('%d Guests', $booking->guests_count),
            'status' => Str::upper($booking->status),
            'imageUrl' => $this->primaryImageUrl($property),
            'showHref' => route('account.bookings.show', $booking),
            'cabinHref' => route('cabins.show', $property),
        ];
    }

    private function transformNotification(UserNotification $notification, User $user): array
    {
        $message = $notification->messages->sortByDesc(fn ($item) => $item->sent_at ?? $item->created_at)->first();
        $category = $this->notificationCategory($notification);
        $actionHref = $this->notificationActionHref($notification, $user);

        return [
            'id' => (string) $notification->id,
            'eventName' => $notification->event_name,
            'title' => $message?->subject ?: Str::headline(str_replace('.', ' ', $notification->event_name)),
            'description' => $message?->body ?: 'New activity is available in your account.',
            'createdAt' => optional($message?->sent_at ?? $notification->created_at)?->toIso8601String(),
            'category' => $category,
            'unread' => $notification->read_at === null,
            'action' => $actionHref
                ? [
                    'label' => $category === 'Bookings' ? 'View details' : 'Open',
                    'href' => $actionHref,
                ]
                : null,
        ];
    }

    private function notificationCategory(UserNotification $notification): string
    {
        if (str_contains($notification->event_name, 'message')) {
            return 'Messages';
        }

        if (str_contains($notification->event_name, 'booking')) {
            return 'Bookings';
        }

        return 'System';
    }

    private function notificationActionHref(UserNotification $notification, User $user): ?string
    {
        $bookingId = data_get($notification->data, 'booking_id');

        if (! $bookingId) {
            return null;
        }

        $isGuestBooking = Booking::query()
            ->whereKey($bookingId)
            ->where('guest_id', $user->id)
            ->exists();

        if ($isGuestBooking) {
            return route('account.bookings.show', $bookingId);
        }

        return route('account.dashboard');
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
}
