<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('profile');

        return Inertia::render('account/settings/security', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'profile' => $user->profile ? [
                    'two_factor_email_enabled' => $user->profile->two_factor_email_enabled,
                ] : null,
            ],
        ]);
    }

    public function toggleTwoFactorEmail(Request $request): RedirectResponse
    {
        $profile = $request->user()->profile()->firstOrCreate(
            ['user_id' => $request->user()->id],
        );

        $profile->update([
            'two_factor_email_enabled' => ! $profile->two_factor_email_enabled,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $profile->two_factor_email_enabled
                ? __('Two-factor authentication enabled.')
                : __('Two-factor authentication disabled.'),
        ]);

        return back();
    }
}
