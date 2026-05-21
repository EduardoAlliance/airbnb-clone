<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'status',
        'error',
        'provider_response',
        'attempted_at',
    ];

    protected function casts(): array
    {
        return [
            'provider_response' => 'array',
            'attempted_at' => 'datetime',
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
