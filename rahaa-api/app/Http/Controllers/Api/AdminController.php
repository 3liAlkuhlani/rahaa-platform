<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Models\DriverProfile;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Dashboard & Financial Statistics
     */
    public function dashboardStats(Request $request)
    {
        $totalDrivers = User::where('role', 'driver')->count();
        $approvedDrivers = DriverProfile::where('status', 'approved')->count();
        $pendingDrivers = DriverProfile::where('status', 'pending')->count();
        $totalPassengers = User::where('role', 'passenger')->count();
        $totalTrips = Trip::count();
        $completedTrips = Trip::where('status', 'completed')->count();
        $activeTrips = Trip::whereIn('status', ['requested', 'accepted', 'arrived', 'in_progress'])->count();
        $cancelledTrips = Trip::where('status', 'cancelled')->count();

        $totalRevenue = (float) Trip::where('status', 'completed')->sum('fare');
        $pendingRevenue = (float) Trip::whereIn('status', ['requested', 'accepted', 'arrived', 'in_progress'])->sum('fare');
        $avgTripFare = $completedTrips > 0 ? round($totalRevenue / $completedTrips, 2) : 0;
        $platformCommission = round($totalRevenue * 0.10, 2);
        $driverNetEarnings = round($totalRevenue * 0.90, 2);

        // Payment distribution across all non-cancelled trips
        $walletAmount = (float) Trip::where('status', '!=', 'cancelled')->where('payment_method', 'wallet')->sum('fare');
        $cashAmount = (float) Trip::where('status', '!=', 'cancelled')->where('payment_method', 'cash')->sum('fare');
        $cardAmount = (float) Trip::where('status', '!=', 'cancelled')->where('payment_method', 'card')->sum('fare');

        $walletCount = Trip::where('status', '!=', 'cancelled')->where('payment_method', 'wallet')->count();
        $cashCount = Trip::where('status', '!=', 'cancelled')->where('payment_method', 'cash')->count();
        $cardCount = Trip::where('status', '!=', 'cancelled')->where('payment_method', 'card')->count();

        $totalNonCancelledFare = max($walletAmount + $cashAmount + $cardAmount, 1);

        $paymentDistribution = [
            [
                'method' => 'wallet',
                'title' => 'محفظة التطبيق (جيب)',
                'amount' => $walletAmount,
                'trips_count' => $walletCount,
                'percentage' => round(($walletAmount / $totalNonCancelledFare) * 100),
            ],
            [
                'method' => 'cash',
                'title' => 'الدفع النقدي (كاش)',
                'amount' => $cashAmount,
                'trips_count' => $cashCount,
                'percentage' => round(($cashAmount / $totalNonCancelledFare) * 100),
            ],
            [
                'method' => 'card',
                'title' => 'بطاقة / تحويل بنكي',
                'amount' => $cardAmount,
                'trips_count' => $cardCount,
                'percentage' => round(($cardAmount / $totalNonCancelledFare) * 100),
            ],
        ];

        $recentTrips = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone'])
            ->latest()
            ->limit(10)
            ->get();

        $recentLogs = AdminLog::with('admin:id,name,username')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_drivers' => $totalDrivers,
                'approved_drivers' => $approvedDrivers,
                'pending_drivers' => $pendingDrivers,
                'total_passengers' => $totalPassengers,
                'total_trips' => $totalTrips,
                'completed_trips' => $completedTrips,
                'active_trips' => $activeTrips,
                'cancelled_trips' => $cancelledTrips,
                'total_revenue' => $totalRevenue,
                'pending_revenue' => $pendingRevenue,
                'avg_trip_fare' => $avgTripFare,
                'platform_commission' => $platformCommission,
                'driver_net_earnings' => $driverNetEarnings,
            ],
            'payment_distribution' => $paymentDistribution,
            'recent_trips' => $recentTrips,
            'recent_logs' => $recentLogs,
        ]);
    }

    /**
     * Drivers List & Management
     */
    public function listDrivers(Request $request)
    {
        $status = $request->query('status'); // 'all', 'approved', 'pending', 'rejected'

        $query = User::with('driverProfile')->where('role', 'driver');

        if ($status && $status !== 'all') {
            $query->whereHas('driverProfile', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        $drivers = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'drivers' => $drivers,
        ]);
    }

    /**
     * Approve Driver
     */
    public function approveDriver(Request $request, $id)
    {
        $admin = $request->user();
        $user = User::with('driverProfile')->where('role', 'driver')->findOrFail($id);

        if (!$user->driverProfile) {
            return response()->json(['success' => false, 'message' => 'ملف السائق غير موجود'], 404);
        }

        $user->status = 'active';
        $user->save();

        $user->driverProfile->status = 'approved';
        $user->driverProfile->rejection_reason = null;
        $user->driverProfile->save();

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => 'driver_approved',
            'target_type' => 'DriverProfile',
            'target_id' => $user->driverProfile->id,
            'details' => "تم اعتماد السائق {$user->name} بنجاح",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم اعتماد حساب السائق ({$user->name}) بنجاح ويمكنه الآن استقبال الرحلات",
            'driver' => $user->fresh(['driverProfile']),
        ]);
    }

    /**
     * Reject Driver
     */
    public function rejectDriver(Request $request, $id)
    {
        $admin = $request->user();
        $user = User::with('driverProfile')->where('role', 'driver')->findOrFail($id);

        if (!$user->driverProfile) {
            return response()->json(['success' => false, 'message' => 'ملف السائق غير موجود'], 404);
        }

        $reason = $request->input('reason', 'البيانات أو الوثائق المرفقة غير واضحة أو غير مستوفية للشروط');

        $user->status = 'rejected';
        $user->save();

        $user->driverProfile->status = 'rejected';
        $user->driverProfile->rejection_reason = $reason;
        $user->driverProfile->save();

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => 'driver_rejected',
            'target_type' => 'DriverProfile',
            'target_id' => $user->driverProfile->id,
            'details' => "تم رفض السائق {$user->name}. السبب: {$reason}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم رفض طلب السائق ({$user->name})",
            'driver' => $user->fresh(['driverProfile']),
        ]);
    }

    /**
     * List Passengers
     */
    public function listPassengers(Request $request)
    {
        $passengers = User::with('passengerProfile')
            ->where('role', 'passenger')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'passengers' => $passengers,
        ]);
    }

    /**
     * List Trips for Admin
     */
    public function listTrips(Request $request)
    {
        $status = $request->query('status');
        $query = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $trips = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'trips' => $trips,
        ]);
    }

    /**
     * Toggle User Ban / Status
     */
    public function toggleUserStatus(Request $request, $id)
    {
        $admin = $request->user();
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['success' => false, 'message' => 'لا يمكن حظر حساب المشرف الإداري'], 403);
        }

        $user->status = ($user->status === 'banned') ? 'active' : 'banned';
        $user->save();

        // Invalidate tokens if banned
        if ($user->status === 'banned') {
            $user->tokens()->delete();
        }

        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => 'user_status_toggled',
            'target_type' => 'User',
            'target_id' => $user->id,
            'details' => "تم تغيير حالة المستخدم {$user->name} إلى {$user->status}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم تغيير حالة المستخدم إلى {$user->status}",
            'user' => $user,
        ]);
    }
}
