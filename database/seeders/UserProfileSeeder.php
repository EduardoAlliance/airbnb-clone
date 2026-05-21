<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserProfileSeeder extends Seeder
{
    public function run(): void
    {
        $profiles = [
            'admin@airbnb.local' => [
                'first_name' => 'Admin',
                'last_name' => 'Airbnb',
                'bio' => 'Administrador principal de la plataforma.',
                'avatar' => 'avatars/admin-airbnb.jpg',
                'date_of_birth' => '1988-01-15',
            ],
            'host@airbnb.local' => [
                'first_name' => 'Host',
                'last_name' => 'Demo',
                'bio' => 'Anfitrión especializado en cabañas de montaña y escapadas de fin de semana.',
                'avatar' => 'avatars/host-demo.jpg',
                'date_of_birth' => '1990-06-10',
            ],
            'guest@airbnb.local' => [
                'first_name' => 'Guest',
                'last_name' => 'Demo',
                'bio' => 'Viajero frecuente en busca de hospedajes tranquilos.',
                'avatar' => 'avatars/guest-demo.jpg',
                'date_of_birth' => '1995-09-21',
            ],
        ];

        foreach ($profiles as $email => $data) {
            $user = User::query()->where('email', $email)->first();

            if (! $user) {
                continue;
            }

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $data,
            );
        }
    }
}
