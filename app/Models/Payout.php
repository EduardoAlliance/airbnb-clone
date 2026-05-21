<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'host_id',
        'host_earnings',
        'platform_commission',
        'status',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'host_earnings' => 'decimal:2',
            'platform_commission' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }
}
