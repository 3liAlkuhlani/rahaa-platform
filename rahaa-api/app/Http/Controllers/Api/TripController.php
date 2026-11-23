<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TripController extends Controller
{
    public const ACTIVE_TRIP_CONFLICT_MESSAGE = 'لديك رحلة نشطة بالفعل، لا يمكنك طلب رحلة جديدة حتى يتم إنهاء الرحلة الحالية أو إلغاؤها.';

    /**
     * Passenger: Get current active trip (if any)
     */
    public function activeTrip(Request $request)
    {
        $user = $request->user();

        $activeTrip = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone', 'driver.driverProfile'])
            ->where('passenger_id', $user->id)
            ->active()
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'has_active_trip' => $activeTrip !== null,
            'active_trip' => $activeTrip,
        ]);
    }

    /**
     * Passenger: Create trip request (Atomic single-active-trip enforcement)
     */
    public function requestTrip(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'passenger') {
            return response()->json([
                'success' => false,
                'message' => 'إنشاء طلب الرحلة متاح فقط لحسابات الركاب',
            ], 403);
        }

        $request->validate([
            'pickup_name' => 'required|string|max:255',
            'dropoff_name' => 'required|string|max:255',
            'vehicle_type' => 'nullable|string|in:economy,comfort,vip,family',
            'fare' => 'required|numeric|min:100',
            'payment_method' => 'nullable|string|in:wallet,cash,card',
            'pickup_lat' => 'nullable|numeric|between:-90,90',
            'pickup_lng' => 'nullable|numeric|between:-180,180',
            'dropoff_lat' => 'nullable|numeric|between:-90,90',
            'dropoff_lng' => 'nullable|numeric|between:-180,180',
        ], [
            'pickup_name.required' => 'يرجى تحديد نقطة الانطلاق',
            'dropoff_name.required' => 'يرجى تحديد وجهة الوصول',
            'fare.required' => 'أجرة الرحلة مطلوبة',
        ]);

        try {
            return DB::transaction(function () use ($request, $user) {
                // Lock the authenticated passenger row to serialize concurrent trip requests
                User::where('id', $user->id)->lockForUpdate()->first();

                // Strictly verify active trip using authenticated user's ID (never trust client passenger_id)
                $existingActiveTrip = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone', 'driver.driverProfile'])
                    ->where('passenger_id', $user->id)
                    ->active()
                    ->lockForUpdate()
                    ->latest()
                    ->first();

                if ($existingActiveTrip) {
                    return response()->json([
                        'success' => false,
                        'code' => 'ACTIVE_TRIP_EXISTS',
                        'message' => self::ACTIVE_TRIP_CONFLICT_MESSAGE,
                        'active_trip' => $existingActiveTrip,
                    ], 409);
                }

                $tripNumber = 'TRP-' . strtoupper(Str::random(6));

                $trip = Trip::create([
                    'trip_number' => $tripNumber,
                    'passenger_id' => $user->id,
                    'pickup_name' => $request->pickup_name,
                    'dropoff_name' => $request->dropoff_name,
                    'pickup_lat' => $request->pickup_lat ?? 15.3547,
                    'pickup_lng' => $request->pickup_lng ?? 44.2066,
                    'dropoff_lat' => $request->dropoff_lat ?? 15.3694,
                    'dropoff_lng' => $request->dropoff_lng ?? 44.1910,
                    'vehicle_type' => $request->input('vehicle_type', 'comfort'),
                    'fare' => $request->fare,
                    'payment_method' => $request->input('payment_method', 'wallet'),
                    'status' => 'requested',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'تم إنشاء طلب الرحلة بنجاح والبحث عن أقرب سائق',
                    'trip' => $trip->load(['passenger', 'driver.driverProfile']),
                ], 201);
            }, 3);
        } catch (QueryException $e) {
            // Database unique index safety net for simultaneous race conditions
            $sqlState = (string) ($e->errorInfo[0] ?? $e->getCode());
            if ($sqlState === '23000' || str_contains(strtolower($e->getMessage()), 'trips_one_active_per_passenger_unique') || str_contains(strtolower($e->getMessage()), 'unique constraint')) {
                $existingActiveTrip = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone', 'driver.driverProfile'])
                    ->where('passenger_id', $user->id)
                    ->active()
                    ->latest()
                    ->first();

                return response()->json([
                    'success' => false,
                    'code' => 'ACTIVE_TRIP_EXISTS',
                    'message' => self::ACTIVE_TRIP_CONFLICT_MESSAGE,
                    'active_trip' => $existingActiveTrip,
                ], 409);
            }

            throw $e;
        }
    }

    /**
     * Get single trip details by ID or trip_number
     */
    public function showTrip(Request $request, $id)
    {
        $user = $request->user();

        $trip = Trip::with(['passenger:id,name,phone', 'driver:id,name,phone', 'driver.driverProfile'])
            ->where('id', $id)
            ->orWhere('trip_number', ltrim($id, '#'))
            ->first();

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'الرحلة غير موجودة',
            ], 404);
        }

        if ($user->role !== 'admin' && $trip->passenger_id !== $user->id && $trip->driver_id !== $user->id && $trip->status !== 'requested') {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بعرض بيانات هذه الرحلة',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'trip' => $trip,
        ]);
    }

    /**
     * Driver: List available trips in requested status
     */
    public function availableTrips(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'driver') {
            return response()->json([
                'success' => false,
                'message' => 'عرض الرحلات المتاحة مخصص للسائقين فقط',
            ], 403);
        }

        $driverProfile = $user->driverProfile;
        if (!$driverProfile || $driverProfile->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'حساب السائق قيد المراجعة ولم يتم اعتماده بعد من قبل الإدارة',
            ], 403);
        }

        // Enforce taxi service eligibility
        $approvedServices = \App\Models\DriverService::where('user_id', $user->id)
            ->where('status', 'approved')
            ->pluck('service_type')
            ->toArray();
        if (!empty($approvedServices) && !in_array('taxi', $approvedServices, true)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك باستقبال طلبات التاكسي لأن حسابك غير معتمد لخدمة التاكسي',
            ], 403);
        }

        $rejectedTripIds = \App\Models\DriverRequestRejection::where('driver_id', $user->id)
            ->where('request_type', 'trip')
            ->pluck('request_id')
            ->toArray();

        $trips = Trip::with('passenger:id,name,phone')
            ->where('status', 'requested')
            ->whereNull('driver_id')
            ->when(!empty($rejectedTripIds), fn ($q) => $q->whereNotIn('id', $rejectedTripIds))
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'trips' => $trips,
        ]);
    }

    /**
     * Driver: Accept trip with concurrency database locking
     */
    public function acceptTrip(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'driver') {
            return response()->json([
                'success' => false,
                'message' => 'هذه العملية مخصصة للسائقين فقط',
            ], 403);
        }

        $driverProfile = $user->driverProfile;
        if (!$driverProfile || $driverProfile->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'يجب اعتماد حسابك من قبل الإدارة أولاً لتتمكن من قبول الرحلات',
            ], 403);
        }

        $approvedServices = \App\Models\DriverService::where('user_id', $user->id)
            ->where('status', 'approved')
            ->pluck('service_type')
            ->toArray();
        if (!empty($approvedServices) && !in_array('taxi', $approvedServices, true)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بقبول طلبات التاكسي لأن حسابك غير معتمد لخدمة التاكسي',
            ], 403);
        }

        // Concurrency lock using DB Transaction
        return DB::transaction(function () use ($id, $user) {
            $trip = Trip::where('id', $id)->lockForUpdate()->first();

            if (!$trip) {
                return response()->json([
                    'success' => false,
                    'message' => 'الرحلة غير موجودة',
                ], 404);
            }

            if ($trip->status !== 'requested' || $trip->driver_id !== null) {
                return response()->json([
                    'success' => false,
                    'message' => 'عذراً! تم قبول هذه الرحلة بالفعل بواسطة سائق آخر',
                ], 409);
            }

            $trip->driver_id = $user->id;
            $trip->status = 'accepted';
            $trip->accepted_at = now();
            if ($user->driverProfile && $user->driverProfile->current_lat && $user->driverProfile->current_lng) {
                $trip->driver_lat = $user->driverProfile->current_lat;
                $trip->driver_lng = $user->driverProfile->current_lng;
                $trip->driver_location_updated_at = now();
            } else {
                // Seed initial driver coordinates near pickup if driver GPS not yet synced
                $trip->driver_lat = ($trip->pickup_lat ?? 15.3547) - 0.008;
                $trip->driver_lng = ($trip->pickup_lng ?? 44.2066) - 0.006;
                $trip->driver_location_updated_at = now();
            }
            $trip->save();

            return response()->json([
                'success' => true,
                'message' => 'تم قبول الرحلة بنجاح. يرجى التوجه لموقع الراكب',
                'trip' => $trip->load(['passenger', 'driver.driverProfile']),
            ]);
        });
    }

    /**
     * Driver: Live GPS location update during an active trip
     */
    public function updateDriverLocation(Request $request, $id)
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $user = $request->user();
        $trip = Trip::find($id);

        if (!$trip) {
            return response()->json(['success' => false, 'message' => 'الرحلة غير موجودة'], 404);
        }

        if ($user->role !== 'admin' && $trip->driver_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك بتحديث موقع هذه الرحلة'], 403);
        }

        if (!$trip->isActive()) {
            return response()->json(['success' => false, 'message' => 'لا يمكن تحديث الموقع لرحلة منتهية أو ملغاة'], 409);
        }

        $trip->driver_lat = (float) $request->lat;
        $trip->driver_lng = (float) $request->lng;
        $trip->driver_location_updated_at = now();
        $trip->save();

        if ($user->driverProfile) {
            $user->driverProfile->current_lat = (float) $request->lat;
            $user->driverProfile->current_lng = (float) $request->lng;
            $user->driverProfile->save();
        }

        return response()->json([
            'success' => true,
            'driver_lat' => $trip->driver_lat,
            'driver_lng' => $trip->driver_lng,
            'driver_location_updated_at' => $trip->driver_location_updated_at,
        ]);
    }

    /**
     * Update trip status (arrived, in_progress, completed, cancelled)
     */
    public function updateStatus(Request $request, $id)
    {
        // Support alias 'driver_arriving' -> 'arrived'
        if ($request->input('status') === 'driver_arriving') {
            $request->merge(['status' => 'arrived']);
        }

        $request->validate([
            'status' => 'required|in:arrived,in_progress,completed,cancelled',
            'cancellation_reason' => 'nullable|string',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($request, $id, $user) {
            $trip = Trip::where('id', $id)->lockForUpdate()->first();

            if (!$trip) {
                return response()->json(['success' => false, 'message' => 'الرحلة غير موجودة'], 404);
            }

            // Authorization check
            if ($user->role !== 'admin' && $trip->driver_id !== $user->id && $trip->passenger_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بتعديل هذه الرحلة'], 403);
            }

            // Prevent modifying already completed/cancelled trips
            if (in_array($trip->status, Trip::TERMINAL_STATUSES, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن تغيير حالة رحلة مكتملة أو ملغاة بالفعل',
                    'trip' => $trip->load(['passenger', 'driver.driverProfile']),
                ], 409);
            }

            $newStatus = $request->status;

            if ($newStatus === 'cancelled') {
                $trip->status = 'cancelled';
                $trip->cancelled_by = $user->role;
                $trip->cancellation_reason = $request->cancellation_reason ?? 'تم الإلغاء من قبل المستخدم';
                $trip->cancelled_at = now();
            } elseif ($newStatus === 'arrived') {
                $trip->status = 'arrived';
            } elseif ($newStatus === 'in_progress') {
                $trip->status = 'in_progress';
                $trip->started_at = now();
            } elseif ($newStatus === 'completed') {
                $trip->status = 'completed';
                $trip->completed_at = now();

                // Update stats & balances
                if ($trip->driver && $trip->driver->driverProfile) {
                    $driverProf = $trip->driver->driverProfile;
                    $driverProf->increment('total_trips');
                    $driverProf->increment('wallet_balance', $trip->fare * 0.85); // 85% driver share
                }
                if ($trip->passenger && $trip->passenger->passengerProfile) {
                    $passProf = $trip->passenger->passengerProfile;
                    $passProf->increment('total_trips');
                }
            }

            $trip->save();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الرحلة بنجاح',
                'trip' => $trip->load(['passenger', 'driver.driverProfile']),
            ]);
        });
    }

    /**
     * Rate trip
     */
    public function rateTrip(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|numeric|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $trip = Trip::find($id);

        if (!$trip) {
            return response()->json(['success' => false, 'message' => 'الرحلة غير موجودة'], 404);
        }

        if ($user->id === $trip->passenger_id) {
            $trip->driver_rating = $request->rating;
            $trip->review = $request->review;
        } elseif ($user->id === $trip->driver_id) {
            $trip->passenger_rating = $request->rating;
        }

        $trip->save();

        return response()->json([
            'success' => true,
            'message' => 'شكراً لك، تم حفظ التقييم بنجاح',
            'trip' => $trip,
        ]);
    }

    /**
     * Get Trip History for current user
     */
    public function userTrips(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'passenger') {
            $trips = Trip::with('driver.driverProfile')
                ->where('passenger_id', $user->id)
                ->latest()
                ->paginate(15);
        } elseif ($user->role === 'driver') {
            $trips = Trip::with('passenger')
                ->where('driver_id', $user->id)
                ->latest()
                ->paginate(15);
        } else {
            $trips = Trip::with(['passenger', 'driver.driverProfile'])
                ->latest()
                ->paginate(20);
        }

        return response()->json([
            'success' => true,
            'trips' => $trips,
        ]);
    }
}
