<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Cancellation;
use App\Models\Payment;
use App\Models\Property;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start')
            ? Carbon::parse($request->input('start'))
            : Carbon::now()->subMonths(11)->startOfMonth();
        $endDate = $request->input('end')
            ? Carbon::parse($request->input('end'))->endOfMonth()
            : Carbon::now()->endOfMonth();

        $totalRevenue = Payment::where('status', 'succeeded')
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->sum('amount');
        $totalRefunds = Cancellation::whereBetween('created_at', [$startDate, $endDate])
            ->sum('refund_amount');
        $totalBookings = Booking::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedBookings = Booking::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $cancelledBookings = Booking::where('status', 'cancelled')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $avgBookingValue = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;
        $occupancyRate = Property::count() > 0
            ? round((Booking::whereIn('status', ['confirmed', 'reserved'])
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count() / max(Property::count() * 30, 1)) * 100)
            : 0;

        $monthlyRevenue = collect();

        $cursor = $startDate->copy()->startOfMonth();
        while ($cursor->lte($endDate)) {
            $revenue = Payment::where('status', 'succeeded')
                ->whereMonth('paid_at', $cursor->month)
                ->whereYear('paid_at', $cursor->year)
                ->sum('amount');

            $monthlyRevenue->push([
                'label' => $cursor->format('M Y'),
                'revenue' => round((float) $revenue, 2),
                'refunds' => round((float) Cancellation::whereMonth('created_at', $cursor->month)
                    ->whereYear('created_at', $cursor->year)
                    ->sum('refund_amount'), 2),
                'bookings' => Booking::whereMonth('created_at', $cursor->month)
                    ->whereYear('created_at', $cursor->year)
                    ->count(),
            ]);

            $cursor->addMonth();
        }

        $bookingStatuses = [
            'completed' => Booking::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'confirmed' => Booking::where('status', 'confirmed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'reserved' => Booking::where('status', 'reserved')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'cancelled' => Booking::where('status', 'cancelled')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
        ];

        return Inertia::render('admin/analytics', [
            'metrics' => [
                'totalRevenue' => round($totalRevenue, 2),
                'totalRefunds' => round($totalRefunds, 2),
                'netRevenue' => round($totalRevenue - $totalRefunds, 2),
                'totalBookings' => $totalBookings,
                'completedBookings' => $completedBookings,
                'cancelledBookings' => $cancelledBookings,
                'avgBookingValue' => round($avgBookingValue, 2),
                'occupancyRate' => $occupancyRate,
            ],
            'monthlyData' => $monthlyRevenue,
            'bookingStatuses' => $bookingStatuses,
            'filters' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
            ],
        ]);
    }
}
