<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Airbnb',
                'email' => 'admin@airbnb.local',
                'role' => 'admin',
            ],
            [
                'name' => 'Host Demo',
                'email' => 'host@airbnb.local',
                'role' => 'host',
            ],
            [
                'name' => 'Guest Demo',
                'email' => 'guest@airbnb.local',
                'role' => 'guest',
            ],
        ];

        foreach ($users as $data) {
            $user = User::query()->firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => 'password',
                    'email_verified_at' => now(),
                ],
            );

            $user->syncRoles([$data['role']]);
        }
    }
}
