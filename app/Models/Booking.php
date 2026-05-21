<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_id',
        'property_id',
        'check_in',
        'check_out',
        'original_check_in',
        'status',
        'cancellation_policy_applied',
        'reserved_until',
        'guests_count',
        'subtotal',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'original_check_in' => 'date',
            'reserved_until' => 'datetime',
            'cancellation_policy_applied' => 'array',
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function payout(): HasOne
    {
        return $this->hasOne(Payout::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function modifications(): HasMany
    {
        return $this->hasMany(BookingModification::class);
    }
}
