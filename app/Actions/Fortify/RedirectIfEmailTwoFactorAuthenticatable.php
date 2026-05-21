<?php

namespace App\Actions\Fortify;

use App\Mail\TwoFactorCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class RedirectIfEmailTwoFactorAuthenticatable
{
    public function __invoke(Request $request, $next): mixed
    {
        $user = User::where('email', $request->email)->first();

        if ($user && Hash::check($request->password, $user->password)) {
            $profile = $user->profile;

            if ($profile && $profile->two_factor_email_enabled) {
                $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

                cache()->put('2fa_email_' . $user->id, $code, now()->addMinutes(10));

                Mail::to($user->email)->queue(new TwoFactorCode($code));

                $request->session()->put('login.id', $user->id);

                return redirect()->route('account.two-factor-challenge');
            }
        }

        return $next($request);
    }
}
