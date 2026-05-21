<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class UserProfile extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'bio',
        'date_of_birth',
        'notification_booking_confirmations',
        'notification_cancellation_updates',
        'notification_promotional_offers',
        'notification_review_reminders',
        'notification_newsletter',
        'two_factor_email_enabled',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'notification_booking_confirmations' => 'boolean',
            'notification_cancellation_updates' => 'boolean',
            'notification_promotional_offers' => 'boolean',
            'notification_review_reminders' => 'boolean',
            'notification_newsletter' => 'boolean',
            'two_factor_email_enabled' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->useFallbackUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuC4gfp8qZOcaZcRp5I0P03EUEdvbXqMfxV7U3vAHxMpdsMuzHbSR0sveTo_9fVDS_Gla3xJwd4EQztr70M75-k1WbFesY_VRE6oIp8SskeRF9Ioanz2Yp-WJYGZEnIzgY5_aiucWel_nOmaph6XWd-4SymPk1lou4c1vZ3KNikNNGmBh9Goe59j7ZEkrL5Y9TMNSJCq0zhD3ikD7beKqhcqcsAnYyFb--LDbRqsM1cFdCXiqOe9xeoawDabsKeHtr6HQMOo1jQZ9r17');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(200)
            ->height(200)
            ->sharpen(10);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
