<?php

use App\Http\Controllers\Account\EmailTwoFactorController;
use App\Http\Controllers\Account\ProfileController as AccountProfileController;
use App\Http\Controllers\Account\SecurityController as AccountSecurityController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

// Admin settings
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('settings', '/admin/settings/profile');

    Route::inertia('settings/profile', 'admin/settings/profile')->name('settings.profile');
    Route::inertia('settings/security', 'admin/settings/security')->name('settings.security');
    Route::inertia('settings/appearance', 'admin/settings/appearance')->name('settings.appearance');
});

// Guest-facing settings (account section)
Route::middleware(['auth'])->prefix('account')->name('account.')->group(function () {
    Route::redirect('settings', '/account/settings/profile');

    Route::get('settings/profile', [AccountProfileController::class, 'edit'])->name('settings.profile');
    Route::patch('settings/profile', [AccountProfileController::class, 'update'])->name('settings.profile.update');
    Route::delete('settings/profile/avatar', [AccountProfileController::class, 'removeAvatar'])->name('settings.profile.avatar.destroy');
    Route::get('settings/security', [AccountSecurityController::class, 'edit'])->name('settings.security');
    Route::post('settings/security/two-factor-email', [AccountSecurityController::class, 'toggleTwoFactorEmail'])->name('settings.security.two-factor-email');
    Route::get('settings/notifications', [AccountProfileController::class, 'notifications'])->name('settings.notifications');
    Route::patch('settings/notifications', [AccountProfileController::class, 'updateNotifications'])->name('settings.notifications.update');
    Route::inertia('settings/payments', 'account/settings/payments')->name('settings.payments');
});

// Email 2FA challenge (guest routes, before auth)
Route::middleware('web')->group(function () {
    Route::get('account/two-factor-challenge', [EmailTwoFactorController::class, 'showChallengeForm'])
        ->name('account.two-factor-challenge');
    Route::post('account/two-factor-challenge', [EmailTwoFactorController::class, 'verify']);
    Route::post('account/two-factor-challenge/resend', [EmailTwoFactorController::class, 'resend']);
});
