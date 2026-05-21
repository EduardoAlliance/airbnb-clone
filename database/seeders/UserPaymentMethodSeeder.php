<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserPaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            'host@airbnb.local' => [
                [
                    'provider' => 'stripe',
                    'stripe_customer_id' => 'cus_host_demo',
                    'payment_method_token' => 'pm_host_default',
                    'brand' => 'visa',
                    'card_last4' => '4242',
                    'expires_at' => '2028-12-31',
                    'is_default' => true,
                ],
            ],
            'guest@airbnb.local' => [
                [
                    'provider' => 'stripe',
                    'stripe_customer_id' => 'cus_guest_demo',
                    'payment_method_token' => 'pm_guest_default',
                    'brand' => 'mastercard',
                    'card_last4' => '4444',
                    'expires_at' => '2029-08-31',
                    'is_default' => true,
                ],
            ],
        ];

        foreach ($methods as $email => $items) {
            $user = User::query()->where('email', $email)->first();

            if (! $user) {
                continue;
            }

            foreach ($items as $item) {
                $user->paymentMethods()->updateOrCreate(
                    ['payment_method_token' => $item['payment_method_token']],
                    $item,
                );
            }
        }
    }
}
