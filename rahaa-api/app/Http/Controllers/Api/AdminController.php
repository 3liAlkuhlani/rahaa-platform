<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Models\CargoRequest;
use App\Models\Complaint;
use App\Models\DriverProfile;
use App\Models\RentalBooking;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Dashboard & Financial Statistics + Real DB Charts
     */
    public function dashboardStats(Request $request)
    {
        $period = $request->query('period', '30d'); // '7d', '30d', '12m'
        $now = Carbon::now();
        $startDate = match ($period) {
            '7d' => $now->copy()->subDays(6)->startOfDay(),
            '12m' => $now->copy()->subMonths(11)->startOfMonth(),
            default => $now->copy()->subDays(29)->startOfDay(),
        };

        $totalDrivers = User::where('role', 'driver')->count();
        $approvedDrivers = DriverProfile::where('status', 'approved')->count();
        $pendingDrivers = DriverProfile::where('status', 'pending')->count();
        $onlineDrivers = DriverProfile::where('is_online', true)->count();
        $totalPassengers = User::where('role', 'passenger')->count();
        $totalUsers = $totalPassengers + $totalDrivers;

        $totalTrips = Trip::count();
        $completedTrips = Trip::where('status', 'completed')->count();
        $activeTrips = Trip::whereIn('status', ['requested', 'accepted', 'arrived', 'in_progress'])->count();
        $cancelledTrips = Trip::where('status', 'cancelled')->count();

        $totalRentalBookings = RentalBooking::count();
        $totalCargoRequests = CargoRequest::count();
        $totalBookings = $totalTrips + $totalRentalBookings + $totalCargoRequests;
        $totalVehicles = Vehicle::count();
        $pendingComplaints = Complaint::whereIn('status', ['open', 'in_review'])->count();

        $tripsRevenue = (float) Trip::where('status', 'completed')->sum('fare');
        $rentalRevenue = (float) RentalBooking::whereIn('status', ['confirmed', 'active', 'completed'])->sum('total_price');
        $cargoRevenue = (float) CargoRequest::where('status', 'delivered')->sum('estimated_fare');
        $totalRevenue = round($tripsRevenue + $rentalRevenue + $cargoRevenue, 2);

        $pendingRevenue = (float) Trip::whereIn('status', ['requested', 'accepted', 'arrived', 'in_progress'])->sum('fare');
        $avgTripFare = $completedTrips > 0 ? round($tripsRevenue / $completedTrips, 2) : 0;
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

        // Real DB time-series: trips & revenue + users growth
        $bucketFormat = $period === '12m' ? 'Y-m' : 'Y-m-d';
        $buckets = [];
        $cursor = $startDate->copy();
        while ($cursor <= $now) {
            $key = $cursor->format($bucketFormat);
            $buckets[$key] = [
                'date' => $key,
                'label' => $period === '12m' ? $cursor->format('Y/m') : $cursor->format('m/d'),
                'total_trips' => 0,
                'completed_trips' => 0,
                'cancelled_trips' => 0,
                'revenue' => 0.0,
                'new_passengers' => 0,
                'new_drivers' => 0,
            ];
            if ($period === '12m') {
                $cursor->addMonth();
            } else {
                $cursor->addDay();
            }
        }

        $periodTrips = Trip::where('created_at', '>=', $startDate)->get(['status', 'fare', 'created_at']);
        foreach ($periodTrips as $t) {
            $key = $t->created_at?->format($bucketFormat);
            if ($key && isset($buckets[$key])) {
                $buckets[$key]['total_trips']++;
                if ($t->status === 'completed') {
                    $buckets[$key]['completed_trips']++;
                    $buckets[$key]['revenue'] += (float) $t->fare;
                } elseif ($t->status === 'cancelled') {
                    $buckets[$key]['cancelled_trips']++;
                }
            }
        }

        $periodUsers = User::whereIn('role', ['passenger', 'driver'])
            ->where('created_at', '>=', $startDate)
            ->get(['role', 'created_at']);
        foreach ($periodUsers as $u) {
            $key = $u->created_at?->format($bucketFormat);
            if ($key && isset($buckets[$key])) {
                if ($u->role === 'passenger') {
                    $buckets[$key]['new_passengers']++;
                } elseif ($u->role === 'driver') {
                    $buckets[$key]['new_drivers']++;
                }
            }
        }

        // Distribution by transport mode (real counts)
        $taxiCount = Trip::whereIn('vehicle_type', ['economy', 'comfort', 'vip', 'taxi'])->count();
        $motoTripsCount = Trip::where('vehicle_type', 'motorcycle')->count();
        $motoCargoCount = CargoRequest::where('vehicle_type', 'motorcycle')->count();
        $truckCargoCount = CargoRequest::where('vehicle_type', '!=', 'motorcycle')->count();

        $transportDistribution = [
            ['type' => 'taxi', 'label' => 'سيارات الأجرة (تاكسي)', 'count' => $taxiCount, 'color' => '#0B58A8'],
            ['type' => 'rental', 'label' => 'تأجير السيارات الخاصة', 'count' => $totalRentalBookings, 'color' => '#EE9224'],
            ['type' => 'truck', 'label' => 'شاحنات النقل', 'count' => $truckCargoCount, 'color' => '#0D2D56'],
            ['type' => 'motorcycle', 'label' => 'الدراجات النارية', 'count' => $motoTripsCount + $motoCargoCount, 'color' => '#10B981'],
        ];

        $recentTrips = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone'])
            ->latest()
            ->limit(10)
            ->get();

        $recentLogs = AdminLog::with('admin:id,name,username,role')
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_users' => $totalUsers,
                'total_passengers' => $totalPassengers,
                'total_drivers' => $totalDrivers,
                'online_drivers' => $onlineDrivers,
                'approved_drivers' => $approvedDrivers,
                'pending_drivers' => $pendingDrivers,
                'total_trips' => $totalTrips,
                'completed_trips' => $completedTrips,
                'active_trips' => $activeTrips,
                'cancelled_trips' => $cancelledTrips,
                'total_bookings' => $totalBookings,
                'total_rental_bookings' => $totalRentalBookings,
                'total_cargo_requests' => $totalCargoRequests,
                'total_vehicles' => $totalVehicles,
                'pending_complaints' => $pendingComplaints,
                'total_revenue' => $totalRevenue,
                'trips_revenue' => $tripsRevenue,
                'rental_revenue' => $rentalRevenue,
                'cargo_revenue' => $cargoRevenue,
                'pending_revenue' => $pendingRevenue,
                'avg_trip_fare' => $avgTripFare,
                'platform_commission' => $platformCommission,
                'driver_net_earnings' => $driverNetEarnings,
            ],
            'charts' => [
                'period' => $period,
                'timeline' => array_values($buckets),
                'transport_distribution' => $transportDistribution,
            ],
            'payment_distribution' => $paymentDistribution,
            'recent_trips' => $recentTrips,
            'recent_logs' => $recentLogs,
        ]);
    }

    /**
     * Unified Users Management (Passengers & Drivers) with Search, Filter & Pagination
     */
    public function listUsers(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $role = $request->query('role', 'all'); // 'all', 'passenger', 'driver'
        $status = $request->query('status', 'all'); // 'all', 'active', 'pending', 'rejected', 'banned'
        $perPage = min(max((int) $request->query('per_page', 20), 5), 100);

        $query = User::with(['passengerProfile', 'driverProfile'])
            ->withCount(['tripsAsPassenger', 'tripsAsDriver'])
            ->whereIn('role', ['passenger', 'driver']);

        if (in_array($role, ['passenger', 'driver'], true)) {
            $query->where('role', $role);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Show Full User Details + Trip History
     */
    public function showUser($id)
    {
        $user = User::with([
            'passengerProfile',
            'driverProfile',
            'vehicles',
            'tripsAsPassenger' => fn ($q) => $q->with('driver:id,name,phone')->latest()->limit(20),
            'tripsAsDriver' => fn ($q) => $q->with('passenger:id,name,phone')->latest()->limit(20),
            'rentalBookingsAsRenter' => fn ($q) => $q->with('vehicle:id,make,model,plate_number')->latest()->limit(10),
            'cargoRequestsAsSender' => fn ($q) => $q->latest()->limit(10),
            'complaints' => fn ($q) => $q->latest()->limit(10),
        ])->withCount(['tripsAsPassenger', 'tripsAsDriver'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    /**
     * Update User Details (Admin / Permitted Supervisor)
     * Strictly disallows changing role or editing admin/supervisor accounts here.
     */
    public function updateUser(Request $request, $id)
    {
        $actor = $request->user();
        $user = User::whereIn('role', ['passenger', 'driver'])->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'phone' => 'required|string|min:7|max:20|unique:users,phone,' . $user->id,
            'email' => 'nullable|email|max:120|unique:users,email,' . $user->id,
            'status' => 'required|in:active,pending,rejected,banned',
        ], [
            'name.required' => 'الاسم الكامل مطلوب',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.unique' => 'رقم الهاتف مسجل لحساب آخر',
            'email.unique' => 'البريد الإلكتروني مسجل لحساب آخر',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldStatus = $user->status;
        $user->name = trim($request->name);
        $user->phone = trim($request->phone);
        $user->email = $request->email ? trim($request->email) : null;
        $user->status = $request->status;
        $user->save();

        if ($user->status === 'banned' && $oldStatus !== 'banned') {
            $user->tokens()->delete();
        }

        AdminLog::create([
            'admin_id' => $actor->id,
            'action' => 'user_updated',
            'target_type' => 'User',
            'target_id' => $user->id,
            'details' => "تم تعديل بيانات المستخدم {$user->name} (الحالة: {$user->status})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات المستخدم بنجاح',
            'user' => $user->fresh(['passengerProfile', 'driverProfile']),
        ]);
    }

    /**
     * Drivers List & Management (Search, Status, Online, Vehicles, Docs, Ratings)
     */
    public function listDrivers(Request $request)
    {
        $status = $request->query('status', 'all'); // 'all', 'approved', 'pending', 'rejected', 'banned'
        $online = $request->query('online', 'all'); // 'all', 'online', 'offline'
        $search = trim((string) $request->query('search', ''));
        $perPage = min(max((int) $request->query('per_page', 20), 5), 100);

        $query = User::with(['driverProfile', 'vehicles', 'driverServices', 'verificationDocuments'])
            ->withCount('tripsAsDriver')
            ->withAvg('tripsAsDriver as trips_as_driver_avg_rating', 'driver_rating')
            ->where('role', 'driver');

        if ($status === 'banned') {
            $query->where('status', 'banned');
        } elseif ($status && $status !== 'all') {
            $query->whereHas('driverProfile', function ($q) use ($status) {
                $q->where('status', $status);
            });
        }

        if ($online === 'online') {
            $query->whereHas('driverProfile', fn ($q) => $q->where('is_online', true));
        } elseif ($online === 'offline') {
            $query->whereHas('driverProfile', fn ($q) => $q->where('is_online', false));
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('driverProfile', function ($dq) use ($search) {
                        $dq->where('vehicle_model', 'like', "%{$search}%")
                            ->orWhere('vehicle_plate', 'like', "%{$search}%")
                            ->orWhere('license_number', 'like', "%{$search}%");
                    });
            });
        }

        $drivers = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'drivers' => $drivers,
        ]);
    }

    /**
     * Show Full Driver Details
     */
    public function showDriver($id)
    {
        $driver = User::with([
            'driverProfile',
            'vehicles',
            'driverServices',
            'verificationDocuments',
            'tripsAsDriver' => fn ($q) => $q->with('passenger:id,name,phone')->latest()->limit(20),
        ])
            ->withCount('tripsAsDriver')
            ->withAvg('tripsAsDriver as trips_as_driver_avg_rating', 'driver_rating')
            ->where('role', 'driver')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'driver' => $driver,
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
     * List Passengers (kept for backward compatibility)
     */
    public function listPassengers(Request $request)
    {
        $passengers = User::with('passengerProfile')
            ->withCount('tripsAsPassenger')
            ->where('role', 'passenger')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'passengers' => $passengers,
        ]);
    }

    /**
     * List Trips for Admin with Search & Multi-Filters
     */
    public function listTrips(Request $request)
    {
        $status = $request->query('status');
        $vehicleType = $request->query('vehicle_type');
        $paymentMethod = $request->query('payment_method');
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        $search = trim((string) $request->query('search', ''));
        $perPage = min(max((int) $request->query('per_page', 20), 5), 100);

        $query = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($vehicleType && $vehicleType !== 'all') {
            $query->where('vehicle_type', $vehicleType);
        }

        if ($paymentMethod && $paymentMethod !== 'all') {
            $query->where('payment_method', $paymentMethod);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                if (is_numeric($search)) {
                    $q->where('id', (int) $search);
                }
                $q->orWhere('pickup_address', 'like', "%{$search}%")
                    ->orWhere('dropoff_address', 'like', "%{$search}%")
                    ->orWhereHas('passenger', fn ($pq) => $pq->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"))
                    ->orWhereHas('driver', fn ($dq) => $dq->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        $trips = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'trips' => $trips,
        ]);
    }

    /**
     * Show Single Trip Details
     */
    public function showTrip($id)
    {
        $trip = Trip::with([
            'passenger:id,name,phone,email',
            'driver:id,name,phone,email',
            'driver.driverProfile',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'trip' => $trip,
        ]);
    }

    /**
     * Toggle User Ban / Status (Passenger or Driver only; Admin/Supervisor managed via Supervisors endpoint)
     */
    public function toggleUserStatus(Request $request, $id)
    {
        $admin = $request->user();
        $user = User::findOrFail($id);

        if ($user->isAdminOrSupervisor()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعديل حالة حسابات الإدارة أو المشرفين من هذا المسار',
            ], 403);
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

    /**
     * Detailed Reports Endpoint (Trips, Users, Drivers, Revenue, Vehicles, Complaints)
     */
    public function reports(Request $request)
    {
        $type = $request->query('type', 'trips');
        $dateFrom = $request->query('date_from')
            ? Carbon::parse($request->query('date_from'))->startOfDay()
            : Carbon::now()->subDays(30)->startOfDay();
        $dateTo = $request->query('date_to')
            ? Carbon::parse($request->query('date_to'))->endOfDay()
            : Carbon::now()->endOfDay();

        $summary = [];
        $rows = [];

        switch ($type) {
            case 'users':
                $users = User::whereIn('role', ['passenger', 'driver'])
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->withCount(['tripsAsPassenger', 'tripsAsDriver'])
                    ->latest()
                    ->get();
                $summary = [
                    'total' => $users->count(),
                    'passengers' => $users->where('role', 'passenger')->count(),
                    'drivers' => $users->where('role', 'driver')->count(),
                    'active' => $users->where('status', 'active')->count(),
                    'banned' => $users->where('status', 'banned')->count(),
                ];
                $rows = $users->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'phone' => $u->phone,
                    'role' => $u->role,
                    'status' => $u->status,
                    'trips_count' => $u->role === 'driver' ? $u->trips_as_driver_count : $u->trips_as_passenger_count,
                    'created_at' => $u->created_at?->toDateTimeString(),
                ]);
                break;

            case 'revenue':
                $trips = Trip::where('status', 'completed')
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->with(['passenger:id,name', 'driver:id,name'])
                    ->latest()
                    ->get();
                $totalRev = (float) $trips->sum('fare');
                $summary = [
                    'total_revenue' => $totalRev,
                    'platform_commission' => round($totalRev * 0.10, 2),
                    'driver_earnings' => round($totalRev * 0.90, 2),
                    'completed_trips' => $trips->count(),
                ];
                $rows = $trips->map(fn ($t) => [
                    'id' => $t->id,
                    'passenger' => $t->passenger?->name ?? 'غير محدد',
                    'driver' => $t->driver?->name ?? 'غير محدد',
                    'payment_method' => $t->payment_method,
                    'fare' => (float) $t->fare,
                    'commission' => round((float) $t->fare * 0.10, 2),
                    'created_at' => $t->created_at?->toDateTimeString(),
                ]);
                break;

            case 'vehicles':
                $vehicles = Vehicle::with('owner:id,name,phone')
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->latest()
                    ->get();
                $summary = [
                    'total' => $vehicles->count(),
                    'approved' => $vehicles->where('status', 'approved')->count(),
                    'pending' => $vehicles->where('status', 'pending')->count(),
                    'rejected' => $vehicles->where('status', 'rejected')->count(),
                ];
                $rows = $vehicles->map(fn ($v) => [
                    'id' => $v->id,
                    'vehicle' => trim("{$v->make} {$v->model} {$v->year}"),
                    'service_type' => $v->service_type,
                    'plate_number' => $v->plate_number,
                    'owner' => $v->owner?->name ?? 'غير محدد',
                    'status' => $v->status,
                    'created_at' => $v->created_at?->toDateTimeString(),
                ]);
                break;

            case 'complaints':
                $complaints = Complaint::with(['user:id,name,phone', 'handler:id,name'])
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->latest()
                    ->get();
                $summary = [
                    'total' => $complaints->count(),
                    'open' => $complaints->where('status', 'open')->count(),
                    'in_review' => $complaints->where('status', 'in_review')->count(),
                    'resolved' => $complaints->where('status', 'resolved')->count(),
                    'dismissed' => $complaints->where('status', 'dismissed')->count(),
                ];
                $rows = $complaints->map(fn ($c) => [
                    'id' => $c->id,
                    'subject' => $c->subject,
                    'category' => $c->category,
                    'user' => $c->user?->name ?? 'غير محدد',
                    'status' => $c->status,
                    'handler' => $c->handler?->name ?? '—',
                    'created_at' => $c->created_at?->toDateTimeString(),
                ]);
                break;

            case 'trips':
            default:
                $trips = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone'])
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->latest()
                    ->get();
                $summary = [
                    'total' => $trips->count(),
                    'completed' => $trips->where('status', 'completed')->count(),
                    'cancelled' => $trips->where('status', 'cancelled')->count(),
                    'active' => $trips->whereIn('status', ['requested', 'accepted', 'arrived', 'in_progress'])->count(),
                    'revenue' => (float) $trips->where('status', 'completed')->sum('fare'),
                ];
                $rows = $trips->map(fn ($t) => [
                    'id' => $t->id,
                    'passenger' => $t->passenger?->name ?? '—',
                    'driver' => $t->driver?->name ?? '—',
                    'pickup' => $t->pickup_address,
                    'dropoff' => $t->dropoff_address,
                    'vehicle_type' => $t->vehicle_type,
                    'fare' => (float) $t->fare,
                    'status' => $t->status,
                    'created_at' => $t->created_at?->toDateTimeString(),
                ]);
                break;
        }

        return response()->json([
            'success' => true,
            'type' => $type,
            'date_from' => $dateFrom->toDateString(),
            'date_to' => $dateTo->toDateString(),
            'summary' => $summary,
            'rows' => $rows,
        ]);
    }

    /**
     * Export Report as UTF-8 BOM CSV (Excel Compatible)
     */
    public function exportReport(Request $request)
    {
        $reportData = $this->reports($request)->getData(true);
        $rows = $reportData['rows'] ?? [];
        $type = $reportData['type'] ?? 'trips';

        $filename = "rahaa-{$type}-report-" . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM for Arabic Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");
            if (!empty($rows)) {
                fputcsv($handle, array_keys($rows[0]));
                foreach ($rows as $row) {
                    fputcsv($handle, array_values($row));
                }
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
