<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use App\Models\Policy;
use App\Models\Property;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Property::with(['propertyMedia', 'amenities', 'host']);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $paginator = $query->latest()->paginate(12);

        $properties = collect($paginator->items())->map(fn (Property $p) => [
            'id' => $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'location' => collect([$p->city, $p->state, $p->country])->filter()->join(', '),
            'status' => $p->status,
            'base_price' => (float) $p->base_price,
            'guests' => $p->guests,
            'bedrooms' => $p->bedrooms,
            'image' => $p->getFirstMediaUrl('images', 'thumb') ?: '',
            'bookings_count' => $p->bookings()->count(),
            'created_at' => $p->created_at->format('Y-m-d'),
        ]);

        return Inertia::render('admin/properties/index', [
            'properties' => [
                'data' => $properties,
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

    public function create(): Response
    {
        return Inertia::render('admin/properties/create', [
            'amenities' => Amenity::where('is_active', true)->get(['id', 'name', 'slug']),
            'policies' => Policy::where('type', 'cancellation')->where('is_active', true)->get(['id', 'name', 'slug', 'description', 'rules']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'guests' => ['required', 'integer', 'min:1'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'beds' => ['required', 'integer', 'min:1'],
            'bathrooms' => ['required', 'numeric', 'min:0'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'cleaning_fee' => ['nullable', 'numeric', 'min:0'],
            'check_in_time' => ['nullable', 'string'],
            'check_out_time' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:draft,published'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['exists:amenities,id'],
            'policies' => ['nullable', 'array'],
            'policies.*' => ['exists:policies,id'],
        ]);

        $property = Property::query()->create([
            'host_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::lower(Str::random(6)),
            'description' => $validated['description'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'country' => $validated['country'],
            'postal_code' => $validated['postal_code'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'guests' => $validated['guests'],
            'bedrooms' => $validated['bedrooms'],
            'beds' => $validated['beds'],
            'bathrooms' => $validated['bathrooms'],
            'base_price' => $validated['base_price'],
            'cleaning_fee' => $validated['cleaning_fee'] ?? 0,
            'check_in_time' => $validated['check_in_time'] ?? null,
            'check_out_time' => $validated['check_out_time'] ?? null,
            'status' => $validated['status'],
        ]);

        if (!empty($validated['amenities'])) {
            $property->amenities()->sync($validated['amenities']);
        }

        if (!empty($validated['policies'])) {
            $property->policies()->sync(
                collect($validated['policies'])->mapWithKeys(fn ($id) => [$id => ['type' => 'cancellation']])
            );
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $property->addMedia($file)->toMediaCollection('images');
            }
        }

        return to_route('admin.properties.index')
            ->with('flash', ['type' => 'success', 'message' => 'Property created successfully.']);
    }

    public function show(Property $property): Response
    {
        $property->load(['propertyMedia', 'amenities', 'host', 'inventory' => fn ($q) => $q->whereDate('date', '>=', now()->subDay())->orderBy('date')]);

        return Inertia::render('admin/properties/show', [
            'property' => [
                'id' => $property->id,
                'title' => $property->title,
                'slug' => $property->slug,
                'description' => $property->description,
                'address' => $property->address,
                'city' => $property->city,
                'state' => $property->state,
                'country' => $property->country,
                'postal_code' => $property->postal_code,
                'latitude' => (float) $property->latitude,
                'longitude' => (float) $property->longitude,
                'guests' => $property->guests,
                'bedrooms' => $property->bedrooms,
                'beds' => $property->beds,
                'bathrooms' => (float) $property->bathrooms,
                'base_price' => (float) $property->base_price,
                'cleaning_fee' => (float) $property->cleaning_fee,
                'check_in_time' => $property->check_in_time,
                'check_out_time' => $property->check_out_time,
                'status' => $property->status,
                'host' => $property->host ? ['id' => $property->host->id, 'name' => $property->host->name, 'email' => $property->host->email] : null,
                'amenities' => $property->amenities->map(fn ($a) => ['id' => $a->id, 'name' => $a->name]),
                'images' => $this->getAllPropertyImages($property),
                'inventory' => $property->inventory->map(fn ($i) => [
                    'id' => $i->id,
                    'date' => $i->date->format('Y-m-d'),
                    'is_available' => $i->is_available,
                    'price' => (float) $i->price,
                    'closed' => $i->closed,
                ]),
                'bookings' => $property->bookings()
                    ->with(['guest', 'payment'])
                    ->latest()
                    ->get()
                    ->map(fn ($b) => [
                        'id' => $b->id,
                        'guest_name' => $b->guest->name,
                        'check_in' => $b->check_in->format('Y-m-d'),
                        'check_out' => $b->check_out->format('Y-m-d'),
                        'total' => (float) $b->total,
                        'status' => $b->status,
                    ]),
            ],
            'amenities' => Amenity::where('is_active', true)->get(['id', 'name', 'slug']),
        ]);
    }

    public function edit(Property $property): Response
    {
        $property->load(['amenities', 'propertyMedia', 'policies']);

        return Inertia::render('admin/properties/edit', [
            'property' => [
                'id' => $property->id,
                'title' => $property->title,
                'slug' => $property->slug,
                'description' => $property->description,
                'address' => $property->address,
                'city' => $property->city,
                'state' => $property->state,
                'country' => $property->country,
                'postal_code' => $property->postal_code,
                'latitude' => (float) $property->latitude,
                'longitude' => (float) $property->longitude,
                'guests' => $property->guests,
                'bedrooms' => $property->bedrooms,
                'beds' => $property->beds,
                'bathrooms' => (float) $property->bathrooms,
                'base_price' => (float) $property->base_price,
                'cleaning_fee' => (float) $property->cleaning_fee,
                'check_in_time' => $property->check_in_time,
                'check_out_time' => $property->check_out_time,
                'status' => $property->status,
                'amenities' => $property->amenities->pluck('id'),
                'policies' => $property->policies->pluck('id'),
                'existing_images' => $this->getAllPropertyImages($property),
            ],
            'amenities' => Amenity::where('is_active', true)->get(['id', 'name', 'slug']),
            'policies' => Policy::where('type', 'cancellation')->where('is_active', true)->get(['id', 'name', 'slug', 'description', 'rules']),
        ]);
    }

    public function update(Request $request, Property $property): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'guests' => ['required', 'integer', 'min:1'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'beds' => ['required', 'integer', 'min:1'],
            'bathrooms' => ['required', 'numeric', 'min:0'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'cleaning_fee' => ['nullable', 'numeric', 'min:0'],
            'check_in_time' => ['nullable', 'string'],
            'check_out_time' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:draft,published'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['exists:amenities,id'],
            'policies' => ['nullable', 'array'],
            'policies.*' => ['exists:policies,id'],
            'remove_images' => ['nullable', 'array'],
            'remove_images.*' => ['integer'],
        ]);

        $property->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'country' => $validated['country'],
            'postal_code' => $validated['postal_code'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'guests' => $validated['guests'],
            'bedrooms' => $validated['bedrooms'],
            'beds' => $validated['beds'],
            'bathrooms' => $validated['bathrooms'],
            'base_price' => $validated['base_price'],
            'cleaning_fee' => $validated['cleaning_fee'] ?? 0,
            'check_in_time' => $validated['check_in_time'] ?? null,
            'check_out_time' => $validated['check_out_time'] ?? null,
            'status' => $validated['status'],
        ]);

        if (isset($validated['amenities'])) {
            $property->amenities()->sync($validated['amenities']);
        }

        if (isset($validated['policies'])) {
            $property->policies()->sync(
                collect($validated['policies'])->mapWithKeys(fn ($id) => [$id => ['type' => 'cancellation']])
            );
        }

        if (!empty($validated['remove_images'])) {
            foreach ($validated['remove_images'] as $mediaId) {
                $deleted = $property->media()->where('id', $mediaId)->delete();
                if (!$deleted) {
                    $property->propertyMedia()->where('id', $mediaId)->delete();
                }
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $property->addMedia($file)->toMediaCollection('images');
            }
        }

        return to_route('admin.properties.index')
            ->with('flash', ['type' => 'success', 'message' => 'Property updated successfully.']);
    }

    public function destroy(Property $property): RedirectResponse
    {
        $property->delete();

        return to_route('admin.properties.index')
            ->with('flash', ['type' => 'info', 'message' => 'Property deleted successfully.']);
    }

    private function getAllPropertyImages(Property $property): array
    {
        $spatieImages = $property->getMedia('images');

        if ($spatieImages->isNotEmpty()) {
            return $spatieImages->values()->map(fn ($m) => [
                'id' => $m->id,
                'url' => $m->getUrl(),
                'thumb' => $m->getUrl('thumb'),
                'name' => $m->name,
            ])->all();
        }

        return $property->propertyMedia
            ->sortBy('sort_order')
            ->values()
            ->map(fn ($m) => [
                'id' => $m->id,
                'url' => $this->mediaUrl($m->path),
                'thumb' => $this->mediaUrl($m->path),
                'name' => $m->alt_text ?: 'image',
            ])
            ->all();
    }

    private function mediaUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return asset('storage/' . $path);
    }
}
