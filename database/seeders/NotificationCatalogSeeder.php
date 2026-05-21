<?php

namespace Database\Seeders;

use App\Models\NotificationEvent;
use Illuminate\Database\Seeder;

class NotificationCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            ['name' => 'booking.created', 'description' => 'Reserva creada por un huésped.'],
            ['name' => 'booking.confirmed', 'description' => 'Reserva confirmada después del pago.'],
            ['name' => 'booking.cancelled', 'description' => 'Reserva cancelada.'],
            ['name' => 'payment.succeeded', 'description' => 'Pago acreditado correctamente.'],
            ['name' => 'payout.processed', 'description' => 'Pago al anfitrión procesado.'],
        ];

        foreach ($events as $event) {
            NotificationEvent::query()->updateOrCreate(
                ['name' => $event['name']],
                [
                    'description' => $event['description'],
                    'is_active' => true,
                ],
            );
        }
    }
}
