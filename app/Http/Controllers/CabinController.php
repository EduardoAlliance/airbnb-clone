<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Services\Bookings\BookingAvailabilityService;
use App\Services\Bookings\BookingPricingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class CabinController extends Controller
{
    public function __construct(
        private readonly BookingAvailabilityService $availabilityService,
        private readonly BookingPricingService $pricingService,
    ) {
    }

    public function home(): Response
    {
        $featuredCabins = Property::query()
            ->where('status', 'published')
            ->with(['media', 'propertyMedia', 'amenities', 'reviews'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Property $property) => $this->transformCabinCard($property));

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'featuredCabins' => $featuredCabins,
        ]);
    }

    public function index(): Response
    {
        $cabins = Property::query()
            ->where('status', 'published')
            ->with(['media', 'propertyMedia', 'amenities', 'reviews'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->latest()
            ->get()
            ->map(fn (Property $property) => $this->transformCabinCard($property));

        return Inertia::render('cabins/index', [
            'cabins' => $cabins,
        ]);
    }

    public function show(Property $property): Response
    {
        $property->load(['host.profile', 'media', 'propertyMedia', 'amenities', 'reviews', 'inventory', 'bookings']);

        return Inertia::render('cabins/show', [
            'cabin' => [
                'id' => $property->id,
                'slug' => $property->slug,
                'title' => $property->title,
                'location' => $this->locationLabel($property),
                'price' => (float) $property->base_price,
                'rating' => round((float) ($property->reviews->avg('rating') ?? 0), 2),
                'reviewCount' => $property->reviews->count(),
                'hostName' => $property->host?->name ?? 'Host',
                'hostAvatar' => $property->host?->profile?->avatar
                    ? asset('storage/'.$property->host->profile->avatar)
                    : null,
                'hostPhone' => $property->host?->phone,
                'guestCapacity' => sprintf(
                    '%d guests, %d bedrooms, %d beds, %s baths',
                    $property->guests,
                    $property->bedrooms,
                    $property->beds,
                    number_format((float) $property->bathrooms, 1),
                ),
                'description' => $property->description,
                'address' => $property->address,
                'checkInTime' => $property->check_in_time,
                'checkOutTime' => $property->check_out_time,
                'cleaningFee' => (float) $property->cleaning_fee,
                'maxGuests' => $property->guests,
                'amenities' => $property->amenities->pluck('name')->values(),
                'images' => $this->cabinImages($property),
                'availability' => $this->availabilityService->availabilityWindow($property),
                'bookingHref' => route('cabins.book', $property),
                'latitude' => $property->latitude ? (float) $property->latitude : null,
                'longitude' => $property->longitude ? (float) $property->longitude : null,
            ],
        ]);
    }

    public function book(Request $request, Property $property): Response
    {
        $property->load(['media', 'propertyMedia', 'reviews', 'inventory', 'bookings']);

        $checkIn = $request->string('check_in')->toString();
        $checkOut = $request->string('check_out')->toString();
        $guests = max(1, (int) $request->integer('guests', 2));
        $pricing = $this->pricingService->calculate($property, $checkIn, $checkOut);

        $policy = $property->policies()
            ->wherePivot('type', 'cancellation')
            ->first();

        return Inertia::render('account/bookings/new', [
            'cabin' => [
                'id' => $property->id,
                'slug' => $property->slug,
                'title' => $property->title,
                'location' => $this->locationLabel($property),
                'price' => (float) $property->base_price,
                'rating' => round((float) ($property->reviews->avg('rating') ?? 0), 2),
                'reviewCount' => $property->reviews->count(),
                'imageUrl' => $this->primaryImageUrl($property),
                'imageAlt' => $this->primaryImageAlt($property),
                'showHref' => route('cabins.show', $property),
                'storeHref' => route('account.bookings.store', $property),
                'checkIn' => $pricing['checkIn'],
                'checkOut' => $pricing['checkOut'],
                'guests' => min($guests, $property->guests),
                'nights' => $pricing['nights'],
                'subtotal' => $pricing['subtotal'],
                'nightlyBreakdown' => $pricing['nightlyBreakdown'],
                'cleaningFee' => (float) $property->cleaning_fee,
                'serviceFee' => $pricing['serviceFee'],
                'total' => $pricing['total'],
                'cancellationPolicy' => $policy ? [
                    'name' => $policy->name,
                    'description' => $policy->description,
                    'rules' => $policy->rules,
                ] : null,
            ],
        ]);
    }

    private function transformCabinCard(Property $property): array
    {
        return [
            'id' => $property->id,
            'slug' => $property->slug,
            'title' => $property->title,
            'location' => $this->locationLabel($property),
            'price' => (float) $property->base_price,
            'rating' => round((float) ($property->reviews_avg_rating ?? $property->reviews->avg('rating') ?? 0), 2),
            'imageUrl' => $this->primaryImageUrl($property),
            'imageAlt' => $this->primaryImageAlt($property),
            'badges' => $property->amenities->pluck('name')->take(3)->values(),
            'href' => route('cabins.show', $property),
        ];
    }

    private function locationLabel(Property $property): string
    {
        return collect([$property->city, $property->state, $property->country])
            ->filter()
            ->join(', ');
    }

    private function cabinImages(Property $property): array
    {
        $spatieMedia = $property->getMedia('images');

        if ($spatieMedia->isNotEmpty()) {
            return $spatieMedia
                ->values()
                ->map(fn ($media) => [
                    'url' => $media->getUrl(),
                    'alt' => $media->name ?: $property->title,
                ])
                ->all();
        }

        return $property->propertyMedia
            ->sortBy('sort_order')
            ->values()
            ->map(fn ($media) => [
                'url' => $this->mediaUrl($media->path),
                'alt' => $media->alt_text ?: $property->title,
            ])
            ->all();
    }

    private function primaryImageUrl(Property $property): string
    {
        $spatieMedia = $property->getFirstMediaUrl('images', 'large');

        if ($spatieMedia) {
            return $spatieMedia;
        }

        $media = $property->propertyMedia
            ->sortBy([
                ['is_cover', 'desc'],
                ['sort_order', 'asc'],
            ])
            ->first();

        return $media ? $this->mediaUrl($media->path) : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
    }

    private function primaryImageAlt(Property $property): string
    {
        $spatieMedia = $property->getMedia('images')->first();

        if ($spatieMedia) {
            return $spatieMedia->name ?: $property->title;
        }

        return $property->propertyMedia->sortBy('sort_order')->first()?->alt_text ?: $property->title;
    }

    private function mediaUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return asset('storage/'.$path);
    }
}
