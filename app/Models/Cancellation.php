<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cancellation extends Model
{
    protected $fillable = [
        'booking_id',
        'cancelled_by',
        'cancelled_at',
        'policy_snapshot',
        'total',
        'subtotal',
        'cleaning_fee',
        'service_fee',
        'refund_amount',
        'platform_retained',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'cancelled_at' => 'datetime',
            'policy_snapshot' => 'array',
            'total' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'cleaning_fee' => 'decimal:2',
            'service_fee' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'platform_retained' => 'decimal:2',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}
