<?php

namespace Database\Seeders;

use App\Models\Property;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $properties = Property::query()->get();

        foreach ($properties as $property) {
            for ($offset = 0; $offset < 30; $offset++) {
                $date = Carbon::today()->addDays($offset);
                $isWeekend = in_array($date->dayOfWeekIso, [5, 6, 7], true);

                $property->inventory()->updateOrCreate(
                    ['date' => $date->toDateString()],
                    [
                        'is_available' => true,
                        'price' => $isWeekend
                            ? $property->base_price + 350
                            : $property->base_price,
                        'closed' => false,
                    ],
                );
            }
        }
    }
}
