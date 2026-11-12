<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CargoRequest;
use App\Models\DriverRequestRejection;
use App\Models\DriverService;
use App\Models\RentalBooking;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DriverRequestController extends Controller
{
    private const SERVICE_LABELS = [
        'taxi' => 'تاكسي',
        'motorcycle' => 'دراجة نارية',
        'truck' => 'شاحنة نقل',
        'rental' => 'سيارة خاصة',
    ];

    /**
     * Resolve approved service types for the authenticated driver.
     */
    private function resolveDriverServices(User $user): array
    {
        $services = DriverService::where('user_id', $user->id)
            ->where('status', 'approved')
            ->pluck('service_type')
            ->toArray();

        if (empty($services)) {
            $services = Vehicle::where('owner_id', $user->id)
                ->where('status', 'approved')
                ->pluck('service_type')
                ->toArray();
        }

        if (empty($services) && $user->driverProfile && $user->driverProfile->status === 'approved') {
            $services = ['taxi'];
        }

        return array_values(array_unique(array_intersect($services, ['taxi', 'motorcycle', 'truck', 'rental'])));
    }

    /**
     * Ensure user is an active, approved driver and return their approved services.
     */
    private function authorizeDriver(Request $request): array
    {
        $user = $request->user();

        if (!$user || $user->role !== 'driver') {
            return [null, response()->json([
                'success' => false,
                'message' => 'هذه الصفحة مخصصة لحسابات السائقين والكباتن فقط',
            ], 403)];
        }

        if ($user->status !== 'active') {
            return [null, response()->json([
                'success' => false,
                'message' => 'حساب السائق غير نشط حالياً',
            ], 403)];
        }

        $services = $this->resolveDriverServices($user);
        if (empty($services)) {
            return [null, response()->json([
                'success' => false,
                'message' => 'حسابك أو خدمتك قيد المراجعة ولم يتم اعتمادها بعد من الإدارة',
            ], 403)];
        }

        return [$services, null];
    }

    /**
     * Haversine distance in km when coordinates are available.
     */
    private function calcDistanceKm($lat1, $lng1, $lat2, $lng2): ?float
    {
        if (!$lat1 || !$lng1 || !$lat2 || !$lng2) {
            return null;
        }
        $earthRadius = 6371;
        $dLat = deg2rad((float) $lat2 - (float) $lat1);
        $dLng = deg2rad((float) $lng2 - (float) $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad((float) $lat1)) * cos(deg2rad((float) $lat2)) *
            sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 1);
    }

    /**
     * Normalize a Trip into unified request format.
     */
    private function formatTrip(Trip $trip, int $driverId, bool $isRejected = false): array
    {
        $requestStatus = 'new';
        if ($isRejected) {
            if ($trip->driver_id && (int) $trip->driver_id !== $driverId) {
                $requestStatus = 'assigned_other';
            } elseif ($trip->status === 'cancelled') {
                $requestStatus = 'expired_cancelled';
            } else {
                $requestStatus = 'rejected';
            }
        } elseif ($trip->driver_id && (int) $trip->driver_id !== $driverId) {
            $requestStatus = 'assigned_other';
        } elseif (in_array($trip->status, ['accepted', 'arrived', 'in_progress'], true)) {
            $requestStatus = 'accepted';
        } elseif ($trip->status === 'completed') {
            $requestStatus = 'completed';
        } elseif ($trip->status === 'cancelled') {
            $requestStatus = 'expired_cancelled';
        }

        return [
            'uid' => 'trip-' . $trip->id,
            'id' => $trip->id,
            'request_type' => 'trip',
            'service_type' => 'taxi',
            'service_label' => self::SERVICE_LABELS['taxi'],
            'reference_number' => $trip->trip_number,
            'customer' => $trip->passenger ? [
                'id' => $trip->passenger->id,
                'name' => $trip->passenger->name,
                'phone' => $trip->passenger->phone,
            ] : null,
            'pickup_name' => $trip->pickup_name,
            'dropoff_name' => $trip->dropoff_name,
            'pickup_lat' => $trip->pickup_lat,
            'pickup_lng' => $trip->pickup_lng,
            'dropoff_lat' => $trip->dropoff_lat,
            'dropoff_lng' => $trip->dropoff_lng,
            'distance_km' => $this->calcDistanceKm($trip->pickup_lat, $trip->pickup_lng, $trip->dropoff_lat, $trip->dropoff_lng),
            'fare' => (float) $trip->fare,
            'payment_method' => $trip->payment_method,
            'vehicle_category' => $trip->vehicle_type,
            'notes' => $trip->cancellation_reason,
            'raw_status' => $trip->status,
            'request_status' => $requestStatus,
            'accepted_at' => optional($trip->accepted_at)->toISOString(),
            'created_at' => optional($trip->created_at)->toISOString(),
        ];
    }

    /**
     * Normalize a CargoRequest (motorcycle / truck) into unified request format.
     */
    private function formatCargo(CargoRequest $order, int $driverId, bool $isRejected = false): array
    {
        $requestStatus = 'new';
        if ($isRejected) {
            if ($order->driver_id && (int) $order->driver_id !== $driverId) {
                $requestStatus = 'assigned_other';
            } elseif ($order->status === 'cancelled') {
                $requestStatus = 'expired_cancelled';
            } else {
                $requestStatus = 'rejected';
            }
        } elseif ($order->driver_id && (int) $order->driver_id !== $driverId) {
            $requestStatus = 'assigned_other';
        } elseif (in_array($order->status, ['accepted', 'loading', 'in_transit'], true)) {
            $requestStatus = 'accepted';
        } elseif ($order->status === 'delivered') {
            $requestStatus = 'completed';
        } elseif ($order->status === 'cancelled') {
            $requestStatus = 'expired_cancelled';
        }

        return [
            'uid' => 'cargo-' . $order->id,
            'id' => $order->id,
            'request_type' => 'cargo',
            'service_type' => $order->service_type,
            'service_label' => self::SERVICE_LABELS[$order->service_type] ?? $order->service_type,
            'reference_number' => $order->request_number ?: ('CRG-' . $order->id),
            'customer' => $order->sender ? [
                'id' => $order->sender->id,
                'name' => $order->sender->name,
                'phone' => $order->sender->phone,
            ] : null,
            'pickup_name' => $order->pickup_location,
            'dropoff_name' => $order->delivery_location,
            'pickup_lat' => $order->pickup_lat,
            'pickup_lng' => $order->pickup_lng,
            'dropoff_lat' => $order->delivery_lat,
            'dropoff_lng' => $order->delivery_lng,
            'distance_km' => $this->calcDistanceKm($order->pickup_lat, $order->pickup_lng, $order->delivery_lat, $order->delivery_lng),
            'fare' => $order->estimated_fare !== null ? (float) $order->estimated_fare : null,
            'payment_method' => $order->payment_method,
            'vehicle_category' => $order->required_truck_type ?: $order->sub_service,
            'cargo_type' => $order->cargo_type,
            'weight_kg' => $order->weight_kg,
            'notes' => $order->cargo_description,
            'raw_status' => $order->status,
            'request_status' => $requestStatus,
            'created_at' => optional($order->created_at)->toISOString(),
        ];
    }

    /**
     * Normalize a RentalBooking (private car) into unified request format.
     */
    private function formatRental(RentalBooking $booking): array
    {
        $requestStatus = 'new';
        if (in_array($booking->status, ['accepted', 'active'], true)) {
            $requestStatus = 'accepted';
        } elseif ($booking->status === 'rejected') {
            $requestStatus = 'rejected';
        } elseif ($booking->status === 'completed') {
            $requestStatus = 'completed';
        } elseif ($booking->status === 'cancelled') {
            $requestStatus = 'expired_cancelled';
        }

        $vehicleLabel = $booking->vehicle
            ? trim(($booking->vehicle->make ?? '') . ' ' . ($booking->vehicle->model ?? '') . ' ' . ($booking->vehicle->year ?? ''))
            : 'سيارة خاصة';

        return [
            'uid' => 'rental-' . $booking->id,
            'id' => $booking->id,
            'request_type' => 'rental',
            'service_type' => 'rental',
            'service_label' => self::SERVICE_LABELS['rental'],
            'reference_number' => $booking->booking_number ?: ('RNT-' . $booking->id),
            'customer' => $booking->renter ? [
                'id' => $booking->renter->id,
                'name' => $booking->renter->name,
                'phone' => $booking->renter->phone,
            ] : null,
            'pickup_name' => $vehicleLabel,
            'dropoff_name' => $booking->start_date && $booking->end_date
                ? ($booking->start_date->format('Y-m-d') . ' ← ' . $booking->end_date->format('Y-m-d'))
                : ($booking->rental_mode ?? 'حجز سيارة خاصة'),
            'pickup_lat' => null,
            'pickup_lng' => null,
            'dropoff_lat' => null,
            'dropoff_lng' => null,
            'distance_km' => null,
            'fare' => $booking->total_amount !== null ? (float) $booking->total_amount : null,
            'payment_method' => $booking->payment_method,
            'vehicle_category' => $vehicleLabel,
            'start_date' => optional($booking->start_date)->format('Y-m-d'),
            'end_date' => optional($booking->end_date)->format('Y-m-d'),
            'pickup_time' => $booking->pickup_time,
            'return_time' => $booking->return_time,
            'rental_mode' => $booking->rental_mode,
            'notes' => $booking->cancellation_reason,
            'raw_status' => $booking->status,
            'request_status' => $requestStatus,
            'created_at' => optional($booking->created_at)->toISOString(),
        ];
    }

    /**
     * GET /api/driver/requests?tab=all|new|accepted|previous
     */
    public function index(Request $request)
    {
        [$services, $errorResponse] = $this->authorizeDriver($request);
        if ($errorResponse) {
            return $errorResponse;
        }

        $user = $request->user();
        $tab = $request->query('tab', 'all');

        $rejections = DriverRequestRejection::where('driver_id', $user->id)
            ->get()
            ->groupBy('request_type');

        $rejectedTripIds = ($rejections->get('trip') ?? collect())->pluck('request_id')->all();
        $rejectedCargoIds = ($rejections->get('cargo') ?? collect())->pluck('request_id')->all();

        $newItems = collect();
        $acceptedItems = collect();
        $previousItems = collect();

        // 1. Taxi Trips
        if (in_array('taxi', $services, true)) {
            $newTrips = Trip::with('passenger:id,name,phone')
                ->where('status', 'requested')
                ->whereNull('driver_id')
                ->when(!empty($rejectedTripIds), fn ($q) => $q->whereNotIn('id', $rejectedTripIds))
                ->latest()
                ->limit(50)
                ->get();
            foreach ($newTrips as $t) {
                $newItems->push($this->formatTrip($t, $user->id));
            }

            $acceptedTrips = Trip::with('passenger:id,name,phone')
                ->where('driver_id', $user->id)
                ->whereIn('status', ['accepted', 'arrived', 'in_progress'])
                ->latest()
                ->limit(50)
                ->get();
            foreach ($acceptedTrips as $t) {
                $acceptedItems->push($this->formatTrip($t, $user->id));
            }

            $prevTrips = Trip::with('passenger:id,name,phone')
                ->where(function ($q) use ($user, $rejectedTripIds) {
                    $q->where(function ($sub) use ($user) {
                        $sub->where('driver_id', $user->id)
                            ->whereIn('status', ['completed', 'cancelled']);
                    });
                    if (!empty($rejectedTripIds)) {
                        $q->orWhereIn('id', $rejectedTripIds);
                    }
                })
                ->latest()
                ->limit(50)
                ->get();
            foreach ($prevTrips as $t) {
                $isRej = in_array($t->id, $rejectedTripIds, true);
                $previousItems->push($this->formatTrip($t, $user->id, $isRej));
            }
        }

        // 2. Cargo (Motorcycle / Truck)
        $cargoServices = array_values(array_intersect($services, ['motorcycle', 'truck']));
        if (!empty($cargoServices)) {
            $newCargo = CargoRequest::with('sender:id,name,phone')
                ->whereIn('service_type', $cargoServices)
                ->where('status', 'pending')
                ->whereNull('driver_id')
                ->when(!empty($rejectedCargoIds), fn ($q) => $q->whereNotIn('id', $rejectedCargoIds))
                ->latest()
                ->limit(50)
                ->get();
            foreach ($newCargo as $c) {
                $newItems->push($this->formatCargo($c, $user->id));
            }

            $acceptedCargo = CargoRequest::with('sender:id,name,phone')
                ->whereIn('service_type', $cargoServices)
                ->where('driver_id', $user->id)
                ->whereIn('status', ['accepted', 'loading', 'in_transit'])
                ->latest()
                ->limit(50)
                ->get();
            foreach ($acceptedCargo as $c) {
                $acceptedItems->push($this->formatCargo($c, $user->id));
            }

            $prevCargo = CargoRequest::with('sender:id,name,phone')
                ->whereIn('service_type', $cargoServices)
                ->where(function ($q) use ($user, $rejectedCargoIds) {
                    $q->where(function ($sub) use ($user) {
                        $sub->where('driver_id', $user->id)
                            ->whereIn('status', ['delivered', 'cancelled']);
                    });
                    if (!empty($rejectedCargoIds)) {
                        $q->orWhereIn('id', $rejectedCargoIds);
                    }
                })
                ->latest()
                ->limit(50)
                ->get();
            foreach ($prevCargo as $c) {
                $isRej = in_array($c->id, $rejectedCargoIds, true);
                $previousItems->push($this->formatCargo($c, $user->id, $isRej));
            }
        }

        // 3. Rental (Private Car)
        if (in_array('rental', $services, true)) {
            $rentals = RentalBooking::with(['renter:id,name,phone', 'vehicle:id,make,model,year,plate_number'])
                ->where('owner_id', $user->id)
                ->latest()
                ->limit(80)
                ->get();

            foreach ($rentals as $r) {
                $formatted = $this->formatRental($r);
                if ($formatted['request_status'] === 'new') {
                    $newItems->push($formatted);
                } elseif ($formatted['request_status'] === 'accepted') {
                    $acceptedItems->push($formatted);
                } else {
                    $previousItems->push($formatted);
                }
            }
        }

        $sortByCreated = fn ($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        $newArr = $newItems->values()->all();
        $acceptedArr = $acceptedItems->values()->all();
        $previousArr = $previousItems->values()->all();
        usort($newArr, $sortByCreated);
        usort($acceptedArr, $sortByCreated);
        usort($previousArr, $sortByCreated);

        $counts = [
            'new' => count($newArr),
            'accepted' => count($acceptedArr),
            'previous' => count($previousArr),
            'total' => count($newArr) + count($acceptedArr) + count($previousArr),
        ];

        $result = match ($tab) {
            'new' => $newArr,
            'accepted' => $acceptedArr,
            'previous' => $previousArr,
            default => array_merge($newArr, $acceptedArr, $previousArr),
        };

        return response()->json([
            'success' => true,
            'driver_services' => $services,
            'counts' => $counts,
            'requests' => $result,
        ]);
    }

    /**
     * GET /api/driver/requests/{type}/{id}
     */
    public function show(Request $request, string $type, int $id)
    {
        [$services, $errorResponse] = $this->authorizeDriver($request);
        if ($errorResponse) {
            return $errorResponse;
        }

        $user = $request->user();

        if ($type === 'trip') {
            if (!in_array('taxi', $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بعرض طلبات التاكسي'], 403);
            }
            $trip = Trip::with('passenger:id,name,phone')->find($id);
            if (!$trip) {
                return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
            }
            $isRej = DriverRequestRejection::where('driver_id', $user->id)
                ->where('request_type', 'trip')
                ->where('request_id', $id)
                ->exists();
            return response()->json([
                'success' => true,
                'request' => $this->formatTrip($trip, $user->id, $isRej),
            ]);
        }

        if ($type === 'cargo') {
            $order = CargoRequest::with('sender:id,name,phone')->find($id);
            if (!$order) {
                return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
            }
            if (!in_array($order->service_type, $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بعرض طلبات هذه الخدمة'], 403);
            }
            $isRej = DriverRequestRejection::where('driver_id', $user->id)
                ->where('request_type', 'cargo')
                ->where('request_id', $id)
                ->exists();
            return response()->json([
                'success' => true,
                'request' => $this->formatCargo($order, $user->id, $isRej),
            ]);
        }

        if ($type === 'rental') {
            if (!in_array('rental', $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بعرض طلبات السيارات الخاصة'], 403);
            }
            $booking = RentalBooking::with(['renter:id,name,phone', 'vehicle:id,make,model,year,plate_number'])
                ->where('owner_id', $user->id)
                ->find($id);
            if (!$booking) {
                return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
            }
            return response()->json([
                'success' => true,
                'request' => $this->formatRental($booking),
            ]);
        }

        return response()->json(['success' => false, 'message' => 'نوع الطلب غير صالح'], 400);
    }

    /**
     * POST /api/driver/requests/{type}/{id}/accept
     */
    public function accept(Request $request, string $type, int $id)
    {
        [$services, $errorResponse] = $this->authorizeDriver($request);
        if ($errorResponse) {
            return $errorResponse;
        }

        $user = $request->user();

        if ($type === 'trip') {
            if (!in_array('taxi', $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بقبول طلبات التاكسي'], 403);
            }

            return DB::transaction(function () use ($id, $user) {
                $trip = Trip::where('id', $id)->lockForUpdate()->first();
                if (!$trip) {
                    return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
                }
                if ($trip->driver_id === $user->id && $trip->status === 'accepted') {
                    return response()->json([
                        'success' => true,
                        'message' => 'تم قبول هذه الرحلة مسبقاً لحسابك',
                        'request' => $this->formatTrip($trip->load('passenger:id,name,phone'), $user->id),
                    ]);
                }
                if ($trip->status !== 'requested' || $trip->driver_id !== null) {
                    return response()->json([
                        'success' => false,
                        'message' => 'عذراً! تم قبول هذا الطلب من سائق آخر أو لم يعد متاحاً',
                    ], 409);
                }

                $trip->driver_id = $user->id;
                $trip->status = 'accepted';
                $trip->accepted_at = now();
                $trip->save();

                DriverRequestRejection::where('driver_id', $user->id)
                    ->where('request_type', 'trip')
                    ->where('request_id', $id)
                    ->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'تم قبول طلب الرحلة بنجاح',
                    'request' => $this->formatTrip($trip->load('passenger:id,name,phone'), $user->id),
                ]);
            });
        }

        if ($type === 'cargo') {
            return DB::transaction(function () use ($id, $user, $services) {
                $order = CargoRequest::where('id', $id)->lockForUpdate()->first();
                if (!$order) {
                    return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
                }
                if (!in_array($order->service_type, $services, true)) {
                    return response()->json(['success' => false, 'message' => 'غير مصرح لك بقبول طلبات هذه الخدمة'], 403);
                }
                if ($order->driver_id === $user->id && $order->status === 'accepted') {
                    return response()->json([
                        'success' => true,
                        'message' => 'تم قبول هذا الطلب مسبقاً لحسابك',
                        'request' => $this->formatCargo($order->load('sender:id,name,phone'), $user->id),
                    ]);
                }
                if ($order->status !== 'pending' || $order->driver_id !== null) {
                    return response()->json([
                        'success' => false,
                        'message' => 'عذراً! تم قبول هذا الطلب من سائق آخر أو لم يعد متاحاً',
                    ], 409);
                }

                $order->driver_id = $user->id;
                $order->status = 'accepted';
                $order->save();

                DriverRequestRejection::where('driver_id', $user->id)
                    ->where('request_type', 'cargo')
                    ->where('request_id', $id)
                    ->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'تم قبول الطلب بنجاح',
                    'request' => $this->formatCargo($order->load('sender:id,name,phone'), $user->id),
                ]);
            });
        }

        if ($type === 'rental') {
            if (!in_array('rental', $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك بقبول طلبات السيارات الخاصة'], 403);
            }

            return DB::transaction(function () use ($id, $user) {
                $booking = RentalBooking::where('id', $id)
                    ->where('owner_id', $user->id)
                    ->lockForUpdate()
                    ->first();

                if (!$booking) {
                    return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
                }
                if ($booking->status === 'accepted') {
                    return response()->json([
                        'success' => true,
                        'message' => 'تم قبول هذا الحجز مسبقاً',
                        'request' => $this->formatRental($booking->load(['renter:id,name,phone', 'vehicle:id,make,model,year'])),
                    ]);
                }
                if ($booking->status !== 'pending') {
                    return response()->json([
                        'success' => false,
                        'message' => 'عذراً! لم يعد هذا الحجز متاحاً للقبول',
                    ], 409);
                }

                $booking->status = 'accepted';
                $booking->save();

                return response()->json([
                    'success' => true,
                    'message' => 'تم قبول طلب الحجز بنجاح',
                    'request' => $this->formatRental($booking->load(['renter:id,name,phone', 'vehicle:id,make,model,year'])),
                ]);
            });
        }

        return response()->json(['success' => false, 'message' => 'نوع الطلب غير صالح'], 400);
    }

    /**
     * POST /api/driver/requests/{type}/{id}/reject
     */
    public function reject(Request $request, string $type, int $id)
    {
        [$services, $errorResponse] = $this->authorizeDriver($request);
        if ($errorResponse) {
            return $errorResponse;
        }

        $user = $request->user();
        $reason = trim((string) $request->input('reason', 'رفض السائق الطلب'));

        if ($type === 'trip') {
            if (!in_array('taxi', $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك برفض طلبات التاكسي'], 403);
            }
            $trip = Trip::find($id);
            if (!$trip) {
                return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
            }
            DriverRequestRejection::updateOrCreate(
                ['driver_id' => $user->id, 'request_type' => 'trip', 'request_id' => $id],
                ['reason' => $reason]
            );
            return response()->json([
                'success' => true,
                'message' => 'تم رفض الطلب وإزالته من قائمتك دون إلغاء طلب العميل',
            ]);
        }

        if ($type === 'cargo') {
            $order = CargoRequest::find($id);
            if (!$order) {
                return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
            }
            if (!in_array($order->service_type, $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك برفض طلبات هذه الخدمة'], 403);
            }
            DriverRequestRejection::updateOrCreate(
                ['driver_id' => $user->id, 'request_type' => 'cargo', 'request_id' => $id],
                ['reason' => $reason]
            );
            return response()->json([
                'success' => true,
                'message' => 'تم رفض الطلب وإزالته من قائمتك دون إلغاء طلب العميل',
            ]);
        }

        if ($type === 'rental') {
            if (!in_array('rental', $services, true)) {
                return response()->json(['success' => false, 'message' => 'غير مصرح لك برفض طلبات السيارات الخاصة'], 403);
            }
            $booking = RentalBooking::where('id', $id)->where('owner_id', $user->id)->first();
            if (!$booking) {
                return response()->json(['success' => false, 'message' => 'الطلب غير موجود'], 404);
            }
            if ($booking->status !== 'pending') {
                return response()->json(['success' => false, 'message' => 'لا يمكن رفض حجز تم التعامل معه مسبقاً'], 409);
            }
            $booking->status = 'rejected';
            $booking->cancellation_reason = $reason;
            $booking->save();

            return response()->json([
                'success' => true,
                'message' => 'تم رفض طلب الحجز',
            ]);
        }

        return response()->json(['success' => false, 'message' => 'نوع الطلب غير صالح'], 400);
    }
}
