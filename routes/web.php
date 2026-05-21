<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\CancellationController as AdminCancellationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Admin\PolicyController as AdminPolicyController;
use App\Http\Controllers\Admin\PropertyController as AdminPropertyController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CabinController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CabinController::class, 'home'])->name('home');

Route::get('cabins', [CabinController::class, 'index'])->name('cabins.index');

Route::get('cabins/{property:slug}', [CabinController::class, 'show'])->name('cabins.show');

Route::inertia('about', 'about')->name('about');
Route::inertia('privacy', 'privacy')->name('privacy');
Route::inertia('terms', 'terms')->name('terms');

Route::middleware(['auth', 'verified'])->group(function () {



    Route::get('account', [AccountController::class, 'dashboard'])->name('account.dashboard');
    Route::get('account/notifications', [AccountController::class, 'notifications'])->name('account.notifications');
    Route::post('account/notifications/read-all', [AccountController::class, 'markNotificationsRead'])
        ->name('account.notifications.read-all');

    Route::get('account/bookings/{booking}', [BookingController::class, 'show'])->name('account.bookings.show');
    Route::post('account/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('account.bookings.cancel');
    Route::get('account/bookings/{booking}/price-preview', [BookingController::class, 'pricePreview'])->name('account.bookings.price-preview');
    Route::post('account/bookings/{booking}/modify', [BookingController::class, 'modify'])->name('account.bookings.modify');

    Route::get('cabins/{property:slug}/book', [CabinController::class, 'book'])->name('cabins.book');
    Route::post('cabins/{property:slug}/book', [BookingController::class, 'store'])->name('account.bookings.store');

    Route::prefix('admin')->name('admin.')->middleware(['role:admin'])->group(function () {
            Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('analytics', [AdminAnalyticsController::class, 'index'])->name('analytics');
        Route::get('properties', [AdminPropertyController::class, 'index'])->name('properties.index');
        Route::get('properties/create', [AdminPropertyController::class, 'create'])->name('properties.create');
        Route::post('properties', [AdminPropertyController::class, 'store'])->name('properties.store');
        Route::get('properties/{property}', [AdminPropertyController::class, 'show'])->name('properties.show');
        Route::get('properties/{property}/edit', [AdminPropertyController::class, 'edit'])->name('properties.edit');
        Route::put('properties/{property}', [AdminPropertyController::class, 'update'])->name('properties.update');
        Route::delete('properties/{property}', [AdminPropertyController::class, 'destroy'])->name('properties.destroy');

        Route::get('properties/{property}/inventory', [AdminInventoryController::class, 'index'])->name('properties.inventory');
        Route::put('properties/{property}/inventory', [AdminInventoryController::class, 'update'])->name('properties.inventory.update');
        Route::post('properties/{property}/inventory/generate', [AdminInventoryController::class, 'generate'])->name('properties.inventory.generate');

        Route::get('reservations', [AdminBookingController::class, 'index'])->name('reservations.index');
        Route::get('reservations/{booking}', [AdminBookingController::class, 'show'])->name('reservations.show');
        Route::post('reservations/{booking}/cancel', [AdminBookingController::class, 'cancel'])->name('reservations.cancel');
        Route::post('reservations/{booking}/confirm', [AdminBookingController::class, 'confirm'])->name('reservations.confirm');

        Route::get('policies', [AdminPolicyController::class, 'index'])->name('policies.index');
        Route::get('policies/create', [AdminPolicyController::class, 'create'])->name('policies.create');
        Route::post('policies', [AdminPolicyController::class, 'store'])->name('policies.store');
        Route::get('policies/{policy}/edit', [AdminPolicyController::class, 'edit'])->name('policies.edit');
        Route::put('policies/{policy}', [AdminPolicyController::class, 'update'])->name('policies.update');
        Route::delete('policies/{policy}', [AdminPolicyController::class, 'destroy'])->name('policies.destroy');

        Route::get('cancellations', [AdminCancellationController::class, 'index'])->name('cancellations.index');
    });
});

require __DIR__ . '/settings.php';
