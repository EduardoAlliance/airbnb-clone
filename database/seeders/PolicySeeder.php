<?php

namespace Database\Seeders;

use App\Models\Policy;
use Illuminate\Database\Seeder;

class PolicySeeder extends Seeder
{
    public function run(): void
    {
        $policies = [
            [
                'name' => 'Flexible',
                'slug' => 'flexible',
                'type' => 'cancellation',
                'description' => 'Reembolso completo con suficiente anticipación.',
                'rules' => [
                    'before_14_days' => 100,
                    'before_7_days' => 75,
                    'after' => 0,
                ],
            ],
            [
                'name' => 'Moderada',
                'slug' => 'moderada',
                'type' => 'cancellation',
                'description' => 'Reembolso parcial en fechas cercanas.',
                'rules' => [
                    'before_14_days' => 100,
                    'before_7_days' => 50,
                    'after' => 0,
                ],
            ],
            [
                'name' => 'Estricta',
                'slug' => 'estricta',
                'type' => 'cancellation',
                'description' => 'Reembolso limitado si la cancelación es cercana.',
                'rules' => [
                    'before_14_days' => 75,
                    'before_7_days' => 25,
                    'after' => 0,
                ],
            ],
        ];

        foreach ($policies as $policy) {
            Policy::query()->updateOrCreate(
                ['slug' => $policy['slug']],
                [
                    'name' => $policy['name'],
                    'type' => $policy['type'],
                    'description' => $policy['description'],
                    'rules' => $policy['rules'],
                    'is_active' => true,
                ],
            );
        }
    }
}
