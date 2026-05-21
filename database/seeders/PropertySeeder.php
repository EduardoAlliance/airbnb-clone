<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Policy;
use App\Models\Property;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $host = User::query()->where('email', 'host@airbnb.local')->first();

        if (! $host) {
            return;
        }

        $properties = [
            [
                'title' => 'Cabaña Bosque Azul',
                'slug' => 'cabana-bosque-azul',
                'description' => 'Cabaña rodeada de bosque con terraza, fogata y vistas a la montaña.',
                'address' => 'Camino al Bosque 101',
                'city' => 'Valle de Bravo',
                'state' => 'Estado de Mexico',
                'country' => 'Mexico',
                'postal_code' => '51200',
                'latitude' => 19.1951000,
                'longitude' => -100.1324000,
                'guests' => 6,
                'bedrooms' => 2,
                'beds' => 3,
                'bathrooms' => 1.5,
                'base_price' => 2400,
                'cleaning_fee' => 350,
                'status' => 'published',
                'amenities' => ['Wifi', 'Estacionamiento', 'Chimenea', 'Cocina equipada', 'Pet friendly'],
                'policies' => ['flexible'],
                'media' => [
                    ['path' => 'properties/bosque-azul/front.jpg', 'alt_text' => 'Fachada de la cabaña', 'sort_order' => 1, 'is_cover' => true],
                    ['path' => 'properties/bosque-azul/terrace.jpg', 'alt_text' => 'Terraza con vista al bosque', 'sort_order' => 2, 'is_cover' => false],
                ],
            ],
            [
                'title' => 'Refugio Lago Escondido',
                'slug' => 'refugio-lago-escondido',
                'description' => 'Hospedaje ideal para pareja o familia pequeña con acceso cercano al lago.',
                'address' => 'Sendero del Lago 22',
                'city' => 'Mazamitla',
                'state' => 'Jalisco',
                'country' => 'Mexico',
                'postal_code' => '49500',
                'latitude' => 19.9168000,
                'longitude' => -103.0211000,
                'guests' => 4,
                'bedrooms' => 2,
                'beds' => 2,
                'bathrooms' => 1.0,
                'base_price' => 1850,
                'cleaning_fee' => 280,
                'status' => 'published',
                'amenities' => ['Wifi', 'Jacuzzi', 'Cocina equipada', 'Aire acondicionado'],
                'policies' => ['moderada'],
                'media' => [
                    ['path' => 'properties/lago-escondido/front.jpg', 'alt_text' => 'Vista exterior del refugio', 'sort_order' => 1, 'is_cover' => true],
                ],
            ],
        ];

        foreach ($properties as $data) {
            $property = Property::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'host_id' => $host->id,
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'address' => $data['address'],
                    'city' => $data['city'],
                    'state' => $data['state'],
                    'country' => $data['country'],
                    'postal_code' => $data['postal_code'],
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                    'guests' => $data['guests'],
                    'bedrooms' => $data['bedrooms'],
                    'beds' => $data['beds'],
                    'bathrooms' => $data['bathrooms'],
                    'base_price' => $data['base_price'],
                    'cleaning_fee' => $data['cleaning_fee'],
                    'status' => $data['status'],
                ],
            );

            $amenityIds = Amenity::query()
                ->whereIn('name', $data['amenities'])
                ->pluck('id');

            $policyIds = Policy::query()
                ->whereIn('slug', $data['policies'])
                ->pluck('id', 'slug');

            $property->amenities()->sync($amenityIds);

            $property->policies()->sync(
                $policyIds
                    ->mapWithKeys(fn ($id, $slug) => [$id => ['type' => 'cancellation']])
                    ->all(),
            );

            foreach ($data['media'] as $media) {
                $property->propertyMedia()->updateOrCreate(
                    ['path' => $media['path']],
                    [
                        'disk' => 'public',
                        'type' => 'image',
                        'alt_text' => $media['alt_text'],
                        'sort_order' => $media['sort_order'],
                        'is_cover' => $media['is_cover'],
                    ],
                );
            }
        }
    }
}
