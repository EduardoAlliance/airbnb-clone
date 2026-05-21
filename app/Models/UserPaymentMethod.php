<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'stripe_customer_id',
        'payment_method_token',
        'brand',
        'card_last4',
        'expires_at',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'date',
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
