<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            UserProfileSeeder::class,
            UserPaymentMethodSeeder::class,
            AmenitySeeder::class,
            PolicySeeder::class,
            PropertySeeder::class,
            InventorySeeder::class,
            BookingSeeder::class,
            PaymentSeeder::class,
            PayoutSeeder::class,
            ReviewSeeder::class,
            NotificationCatalogSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
