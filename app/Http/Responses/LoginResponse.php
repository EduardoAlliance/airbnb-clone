<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        $path = $user?->hasRole('admin') ? '/admin' : '/account';

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended($path);
    }
}
