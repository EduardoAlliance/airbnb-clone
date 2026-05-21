<?php

namespace Database\Seeders;

use App\Models\Amenity;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AmenitySeeder extends Seeder
{
    public function run(): void
    {
        $amenities = [
            'Wifi',
            'Estacionamiento',
            'Jacuzzi',
            'Chimenea',
            'Cocina equipada',
            'Alberca',
            'Aire acondicionado',
            'Pet friendly',
        ];

        foreach ($amenities as $name) {
            Amenity::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => $name,
                    'is_active' => true,
                ],
            );
        }
    }
}
