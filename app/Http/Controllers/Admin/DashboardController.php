<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $totalProperties = Property::count();
        $publishedProperties = Property::where('status', 'published')->count();
        $activeBookings = Booking::whereIn('status', ['confirmed', 'reserved'])->count();
        $monthlyRevenue = Payment::where('status', 'succeeded')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $recentBookings = Booking::with(['guest', 'property', 'payment'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Booking $b) => [
                'id' => $b->id,
                'property' => $b->property->title,
                'guest' => $b->guest->name,
                'dates' => $b->check_in?->format('M d') . ' - ' . $b->check_out?->format('M d'),
                'total' => (float) $b->total,
                'status' => $b->status,
            ]);

        $monthlyChart = collect(range(5, 0))->map(function ($i) {
            $date = Carbon::now()->subMonths($i);

            $revenue = Payment::where('status', 'succeeded')
                ->whereMonth('paid_at', $date->month)
                ->whereYear('paid_at', $date->year)
                ->sum('amount');

            return [
                'label' => $date->format('M'),
                'value' => round((float) $revenue),
            ];
        });

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalProperties' => $totalProperties,
                'publishedProperties' => $publishedProperties,
                'activeBookings' => $activeBookings,
                'monthlyRevenue' => round($monthlyRevenue, 2),
            ],
            'recentBookings' => $recentBookings,
            'bookingChart' => $monthlyChart,
        ]);
    }
}
