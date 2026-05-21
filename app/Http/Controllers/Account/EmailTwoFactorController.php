<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Mail\TwoFactorCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class EmailTwoFactorController extends Controller
{
    public function showChallengeForm(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('account/two-factor-challenge');
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $userId = $request->session()->get('login.id');

        if (! $userId) {
            return redirect()->route('login');
        }

        $cached = cache()->get('2fa_email_' . $userId);

        if (! $cached || $request->code !== $cached) {
            return back()->withErrors(['code' => __('The verification code is invalid or has expired.')]);
        }

        $user = User::find($userId);

        if (! $user) {
            return redirect()->route('login');
        }

        cache()->forget('2fa_email_' . $userId);
        $request->session()->forget('login.id');

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended('/account');
    }

    public function resend(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('login.id');

        if (! $userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);

        if (! $user) {
            return redirect()->route('login');
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        cache()->put('2fa_email_' . $user->id, $code, now()->addMinutes(10));

        Mail::to($user->email)->queue(new TwoFactorCode($code));

        return back()->with('status', __('A new verification code has been sent to your email.'));
    }
}
