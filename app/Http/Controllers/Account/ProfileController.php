<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('profile');
        $profile = $user->profile;

        return Inertia::render('account/settings/profile', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'language' => $user->language,
                'profile' => $profile ? [
                    'first_name' => $profile->first_name,
                    'last_name' => $profile->last_name,
                    'bio' => $profile->bio,
                    'avatar_url' => $profile->getFirstMediaUrl('avatar', 'thumb'),
                    'date_of_birth' => $profile->date_of_birth?->format('Y-m-d'),
                    'notification_booking_confirmations' => $profile->notification_booking_confirmations,
                    'notification_cancellation_updates' => $profile->notification_cancellation_updates,
                    'notification_promotional_offers' => $profile->notification_promotional_offers,
                    'notification_review_reminders' => $profile->notification_review_reminders,
                    'notification_newsletter' => $profile->notification_newsletter,
                    'two_factor_email_enabled' => $profile->two_factor_email_enabled,
                ] : null,
            ],
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill([
            'phone' => $validated['phone'] ?? null,
            'language' => $validated['language'] ?? null,
        ]);

        $user->save();

        $firstName = $validated['first_name'] ?? '';
        $lastName = $validated['last_name'] ?? '';
        $fullName = trim($firstName . ' ' . $lastName);

        $profile = $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'first_name' => $firstName ?: null,
                'last_name' => $lastName ?: null,
                'bio' => $validated['bio'] ?? null,
            ]
        );

        if ($fullName !== '' && $user->name !== $fullName) {
            $user->update(['name' => $fullName]);
        }

        if ($request->hasFile('avatar')) {
            $profile->addMedia($request->file('avatar'))->toMediaCollection('avatar');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('account.settings.profile');
    }

    public function removeAvatar(Request $request): RedirectResponse
    {
        $profile = $request->user()->profile;

        if ($profile) {
            $profile->clearMediaCollection('avatar');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Avatar removed.')]);

        return back();
    }

    public function notifications(Request $request): Response
    {
        $user = $request->user()->load('profile');

        return Inertia::render('account/settings/notifications', [
            'user' => [
                'profile' => $user->profile ? [
                    'notification_booking_confirmations' => $user->profile->notification_booking_confirmations,
                    'notification_cancellation_updates' => $user->profile->notification_cancellation_updates,
                    'notification_promotional_offers' => $user->profile->notification_promotional_offers,
                    'notification_review_reminders' => $user->profile->notification_review_reminders,
                    'notification_newsletter' => $user->profile->notification_newsletter,
                ] : null,
            ],
        ]);
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'in:notification_booking_confirmations,notification_cancellation_updates,notification_promotional_offers,notification_review_reminders,notification_newsletter'],
            'value' => ['required', 'boolean'],
        ]);

        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [$validated['key'] => $validated['value']],
        );

        return back();
    }
}
