<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceType;
use App\Models\Vehicle;
use App\Models\RentalBooking;
use App\Models\CargoRequest;
use App\Models\VerificationDocument;
use App\Models\DriverService;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MultiTransportController extends Controller
{
    /**
     * 1. Get All Active Transport Service Types
     */
    public function getServices()
    {
        $services = ServiceType::where('is_active', true)->get();
        return response()->json([
            'success' => true,
            'services' => $services,
        ]);
    }

    /**
     * 2. Rental System: List available rental cars with filters
     */
    public function listRentals(Request $request)
    {
        $query = Vehicle::where('service_type', 'rental')
            ->where('status', 'approved')
            ->where('is_available', true)
            ->with('owner:id,name,phone');

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('make') && $request->make !== 'all') {
            $query->where('make', 'like', '%' . $request->make . '%');
        }

        if ($request->filled('mode')) {
            if ($request->mode === 'with_driver') {
                $query->where('with_driver_available', true);
            } elseif ($request->mode === 'self_drive') {
                $query->where('self_drive_available', true);
            }
        }

        if ($request->filled('max_daily_rate')) {
            $query->where('daily_rate', '<=', $request->max_daily_rate);
        }

        $rentals = $query->latest()->get();

        return response()->json([
            'success' => true,
            'vehicles' => $rentals,
        ]);
    }

    /**
     * 3. Rental System: Show single rental car details
     */
    public function showRental($id)
    {
        $vehicle = Vehicle::where('service_type', 'rental')
            ->with(['owner:id,name,phone', 'rentalBookings' => function ($q) {
                $q->whereIn('status', ['pending', 'accepted', 'active']);
            }])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'vehicle' => $vehicle,
        ]);
    }

    /**
     * 4. Rental System: Book a car (prevents overlapping bookings & handles guarantee)
     */
    public function bookRental(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'rental_mode' => 'required|in:self_drive,with_driver',
            'pickup_location' => 'nullable|string',
            'return_location' => 'nullable|string',
            'pickup_time' => 'nullable|string',
            'return_time' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'guarantee_type' => 'nullable|in:cash,gold,weapon',
            'guarantee_description' => 'nullable|string',
            'legal_license_number' => 'nullable|string',
        ], [
            'vehicle_id.required' => 'يرجى اختيار السيارة المراد حجزها',
            'start_date.required' => 'يرجى تحديد تاريخ بداية الإيجار',
            'end_date.required' => 'يرجى تحديد تاريخ نهاية الإيجار',
            'end_date.after_or_equal' => 'تاريخ نهاية الإيجار يجب أن يكون مساوياً أو بعد تاريخ البداية',
        ]);

        $vehicle = Vehicle::findOrFail($request->vehicle_id);

        if ($vehicle->status !== 'approved' || !$vehicle->is_available) {
            return response()->json([
                'success' => false,
                'message' => 'هذه السيارة غير متاحة للحجز حالياً',
            ], 422);
        }

        // Prevent overlapping bookings for the exact same vehicle
        $overlap = RentalBooking::where('vehicle_id', $vehicle->id)
            ->whereIn('status', ['pending', 'accepted', 'active'])
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                      ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('start_date', '<=', $request->start_date)
                            ->where('end_date', '>=', $request->end_date);
                      });
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً! السيارة محجوزة مسبقاً في هذه الفترة المحددة، يرجى اختيار تاريخ آخر أو سيارة أخرى',
            ], 409);
        }

        // Calculate days
        $start = \Carbon\Carbon::parse($request->start_date);
        $end = \Carbon\Carbon::parse($request->end_date);
        $days = max(1, $start->diffInDays($end));
        $totalAmount = $days * ($vehicle->daily_rate ?? 20000);

        if ($request->rental_mode === 'with_driver') {
            $totalAmount += ($days * 5000); // Driver surcharge
        }

        $bookingNumber = 'RNT-' . strtoupper(Str::random(6));

        $booking = DB::transaction(function () use ($user, $vehicle, $request, $totalAmount, $bookingNumber) {
            $bk = RentalBooking::create([
                'booking_number' => $bookingNumber,
                'renter_id' => $user->id,
                'vehicle_id' => $vehicle->id,
                'owner_id' => $vehicle->owner_id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'pickup_time' => $request->pickup_time ?? '09:00 ص',
                'return_time' => $request->return_time ?? '09:00 ص',
                'rental_mode' => $request->rental_mode,
                'total_amount' => $totalAmount,
                'payment_method' => $request->payment_method ?? 'wallet',
                'status' => 'pending',
            ]);

            // Create initial Guarantee record linked to this booking
            $guaranteeType = $request->input('guarantee_type', 'cash');
            $depositAmount = $vehicle->security_deposit ?? 50000.00;

            \App\Models\RentalGuarantee::create([
                'guarantee_receipt_number' => 'GUR-' . strtoupper(Str::random(6)),
                'booking_id' => $bk->id,
                'renter_id' => $user->id,
                'owner_id' => $vehicle->owner_id,
                'guarantee_type' => $guaranteeType,
                'estimated_value' => $depositAmount,
                'item_description' => $request->guarantee_description ?? ($guaranteeType === 'cash' ? "ضمان نقدي مسترد بقيمة {$depositAmount} ر.ي" : "ضمان عيني"),
                'legal_license_number' => $request->legal_license_number,
                'status' => 'pending',
            ]);

            return $bk;
        });

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال طلب حجز السيارة بنجاح وبانتظار تأكيد المالك واستلام الضمان',
            'booking' => $booking->load(['vehicle', 'owner:id,name,phone', 'guarantee']),
        ], 201);
    }

    /**
     * 5. Rental System: My bookings (as renter or owner)
     */
    public function myRentalBookings(Request $request)
    {
        $user = $request->user();

        $asRenter = RentalBooking::where('renter_id', $user->id)
            ->with(['vehicle', 'owner:id,name,phone', 'guarantee'])
            ->latest()
            ->get();

        $asOwner = RentalBooking::where('owner_id', $user->id)
            ->with(['vehicle', 'renter:id,name,phone', 'guarantee'])
            ->latest()
            ->get();

        $myVehicles = Vehicle::where('owner_id', $user->id)
            ->where('service_type', 'rental')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'as_renter' => $asRenter,
            'as_owner' => $asOwner,
            'my_vehicles' => $myVehicles,
        ]);
    }

    /**
     * 6. Rental Owner: Update booking status (accept / reject / complete)
     */
    public function updateBookingStatus(Request $request, $id)
    {
        $user = $request->user();
        $booking = RentalBooking::where('id', $id)
            ->where('owner_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:accepted,rejected,active,completed,cancelled',
            'cancellation_reason' => 'nullable|string',
        ]);

        $booking->status = $request->status;
        if ($request->filled('cancellation_reason')) {
            $booking->cancellation_reason = $request->cancellation_reason;
        }
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة حجز الإيجار بنجاح',
            'booking' => $booking,
        ]);
    }

    /**
     * 7. Cargo & Truck / Motorcycle Requests: Create a request
     */
    public function requestCargo(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'service_type' => 'required|in:truck,motorcycle',
            'sub_service' => 'nullable|string', // cargo, delivery, passenger
            'pickup_location' => 'required|string',
            'delivery_location' => 'required|string',
            'cargo_type' => 'nullable|string',
            'cargo_description' => 'nullable|string',
            'weight_kg' => 'nullable|numeric',
            'volume_size' => 'nullable|string',
            'required_truck_type' => 'nullable|string',
            'estimated_fare' => 'required|numeric|min:200',
            'payment_method' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ], [
            'pickup_location.required' => 'يرجى تحديد موقع التحميل/الانطلاق',
            'delivery_location.required' => 'يرجى تحديد موقع التسليم/الوصول',
            'estimated_fare.required' => 'أجرة التقدير مطلوبة',
        ]);

        $reqNumber = ($request->service_type === 'truck' ? 'TRK-' : 'MOT-') . strtoupper(Str::random(6));

        $cargo = CargoRequest::create([
            'request_number' => $reqNumber,
            'sender_id' => $user->id,
            'service_type' => $request->service_type,
            'sub_service' => $request->input('sub_service', 'cargo'),
            'pickup_location' => $request->pickup_location,
            'pickup_lat' => $request->pickup_lat ?? 15.3547,
            'pickup_lng' => $request->pickup_lng ?? 44.2066,
            'delivery_location' => $request->delivery_location,
            'delivery_lat' => $request->delivery_lat ?? 15.3700,
            'delivery_lng' => $request->delivery_lng ?? 44.1950,
            'cargo_type' => $request->cargo_type,
            'cargo_description' => $request->cargo_description,
            'weight_kg' => $request->weight_kg,
            'volume_size' => $request->volume_size,
            'required_truck_type' => $request->required_truck_type,
            'cargo_images' => $request->cargo_images,
            'scheduled_at' => $request->scheduled_at,
            'estimated_fare' => $request->estimated_fare,
            'payment_method' => $request->input('payment_method', 'cash'),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء طلب النقل بنجاح والبحث عن السائقين المؤهلين',
            'cargo' => $cargo->load('sender:id,name,phone'),
        ], 201);
    }

    /**
     * 8. Driver: List available cargo/transport orders matching driver's service
     */
    public function availableCargoOrders(Request $request)
    {
        $user = $request->user();

        // Check driver's approved services
        $approvedServices = DriverService::where('user_id', $user->id)
            ->where('status', 'approved')
            ->pluck('service_type')
            ->toArray();

        if (empty($approvedServices)) {
            return response()->json([
                'success' => true,
                'orders' => [],
                'message' => 'ليس لديك خدمات نقل معتمدة حالياً لاستقبال الطلبات',
            ]);
        }

        $orders = CargoRequest::whereIn('service_type', $approvedServices)
            ->where('status', 'pending')
            ->whereNull('driver_id')
            ->with('sender:id,name,phone')
            ->latest()
            ->get();

        $myOrders = CargoRequest::where('driver_id', $user->id)
            ->with('sender:id,name,phone')
            ->latest()
            ->get();

        $myVehicles = Vehicle::where('owner_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
            'my_orders' => $myOrders,
            'my_vehicles' => $myVehicles,
            'driver_services' => $approvedServices,
        ]);
    }

    /**
     * 9. Driver: Accept cargo/motorcycle request
     */
    public function acceptCargoOrder(Request $request, $id)
    {
        $user = $request->user();

        $order = CargoRequest::where('id', $id)
            ->where('status', 'pending')
            ->whereNull('driver_id')
            ->firstOrFail();

        // Verify driver has approved service for this order
        $hasService = DriverService::where('user_id', $user->id)
            ->where('service_type', $order->service_type)
            ->where('status', 'approved')
            ->exists();

        if (!$hasService) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بقبول هذا النوع من الطلبات لعدم اعتماد هذه الخدمة في حسابك',
            ], 403);
        }

        $order->driver_id = $user->id;
        $order->status = 'accepted';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'تم قبول الطلب بنجاح ويمكنك الآن بدء التوجه لموقع التحميل',
            'order' => $order->load(['sender:id,name,phone', 'driver:id,name,phone']),
        ]);
    }

    /**
     * 10. Driver: Update Cargo Order Status (loading, in_transit, delivered, cancelled)
     */
    public function updateCargoStatus(Request $request, $id)
    {
        $user = $request->user();

        $order = CargoRequest::where('id', $id)
            ->where('driver_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:loading,in_transit,delivered,cancelled',
            'cancellation_reason' => 'nullable|string',
        ]);

        $order->status = $request->status;
        if ($request->filled('cancellation_reason')) {
            $order->cancellation_reason = $request->cancellation_reason;
        }
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة طلب النقل بنجاح',
            'order' => $order,
        ]);
    }

    /**
     * 11. Vehicle Owner: Add a new vehicle (Rental, Truck, or Motorcycle)
     */
    public function addVehicle(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'service_type' => 'required|in:taxi,rental,truck,motorcycle',
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer',
            'plate_number' => 'required|string|unique:vehicles,plate_number',
            'category' => 'nullable|string',
            'seats' => 'nullable|integer',
            'daily_rate' => 'nullable|numeric',
            'hourly_rate' => 'nullable|numeric',
            'max_payload_kg' => 'nullable|numeric',
            'with_driver_available' => 'nullable|boolean',
            'self_drive_available' => 'nullable|boolean',
            'location_name' => 'nullable|string',
        ]);

        $vehicle = Vehicle::create([
            'owner_id' => $user->id,
            'service_type' => $request->service_type,
            'make' => $request->make,
            'model' => $request->model,
            'year' => $request->year,
            'color' => $request->color ?? 'أبيض',
            'plate_number' => $request->plate_number,
            'category' => $request->category,
            'seats' => $request->seats ?? 4,
            'fuel_type' => $request->fuel_type ?? 'petrol',
            'transmission' => $request->transmission ?? 'automatic',
            'daily_rate' => $request->daily_rate,
            'hourly_rate' => $request->hourly_rate,
            'max_payload_kg' => $request->max_payload_kg,
            'with_driver_available' => $request->boolean('with_driver_available', false),
            'self_drive_available' => $request->boolean('self_drive_available', true),
            'location_name' => $request->location_name ?? 'أمانة العاصمة صنعاء',
            'images' => $request->images ?? ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'],
            'status' => 'pending', // Pending admin review
            'is_available' => true,
            'rating' => 5.00,
        ]);

        // Register DriverService association if not existing
        DriverService::firstOrCreate(
            ['user_id' => $user->id, 'service_type' => $request->service_type],
            ['status' => 'pending']
        );

        return response()->json([
            'success' => true,
            'message' => 'تمت إضافة المركبة بنجاح وهي الآن بانتظار مراجعة واعتماد الوثائق من الإدارة',
            'vehicle' => $vehicle,
        ], 201);
    }

    /**
     * 12. Upload Verification Documents for Vehicle / Driver
     */
    public function uploadDocument(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'service_type' => 'required|in:taxi,rental,truck,motorcycle',
            'document_type' => 'required|string', // id_card, driving_license, vehicle_registration, insurance, delegation
            'file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'expires_at' => 'nullable|date',
        ]);

        $filePath = $request->file('file')->store('verification_docs', 'public');

        $doc = VerificationDocument::create([
            'user_id' => $user->id,
            'vehicle_id' => $request->vehicle_id,
            'service_type' => $request->service_type,
            'document_type' => $request->document_type,
            'file_path' => $filePath,
            'expires_at' => $request->expires_at,
            'status' => 'under_review',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم رفع الوثيقة بنجاح وجاري تدقيقها من قبل المشرف',
            'document' => $doc,
        ], 201);
    }

    /**
     * 13. Driver: Get my profile & all active services with statuses
     */
    /**
     * 14. Renter Verification: Get status & Upload ID and License documents
     */
    public function getRenterVerification(Request $request)
    {
        $user = $request->user();
        $verif = \App\Models\RenterVerification::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'verification' => $verif ?? [
                'status' => 'not_submitted',
                'user_id' => $user->id,
            ],
        ]);
    }

    public function submitRenterVerification(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'personal_photo' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
            'id_card_front' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
            'id_card_back' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
            'driving_license_front' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
            'driving_license_back' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
        ]);

        $verif = \App\Models\RenterVerification::firstOrNew(['user_id' => $user->id]);

        if ($request->hasFile('personal_photo')) {
            $verif->personal_photo = $request->file('personal_photo')->store('renter_docs', 'public');
        }
        if ($request->hasFile('id_card_front')) {
            $verif->id_card_front = $request->file('id_card_front')->store('renter_docs', 'public');
        }
        if ($request->hasFile('id_card_back')) {
            $verif->id_card_back = $request->file('id_card_back')->store('renter_docs', 'public');
        }
        if ($request->hasFile('driving_license_front')) {
            $verif->driving_license_front = $request->file('driving_license_front')->store('renter_docs', 'public');
        }
        if ($request->hasFile('driving_license_back')) {
            $verif->driving_license_back = $request->file('driving_license_back')->store('renter_docs', 'public');
        }

        $verif->status = 'under_review';
        $verif->rejection_reason = null;
        $verif->save();

        return response()->json([
            'success' => true,
            'message' => 'تم استلام وثائق الهوية ورخصة القيادة بنجاح وهي الآن قيد التدقيق',
            'verification' => $verif,
        ]);
    }

    /**
     * 15. Guarantee Handover & Return Management
     */
    public function updateGuaranteeStatus(Request $request, $bookingId)
    {
        $user = $request->user();
        $guarantee = \App\Models\RentalGuarantee::where('booking_id', $bookingId)->firstOrFail();

        // Ensure user is owner or admin
        if ($user->id !== $guarantee->owner_id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        $request->validate([
            'status' => 'required|in:awaiting_handover,received,under_inspection,returned,disputed',
            'inspection_notes' => 'nullable|string',
            'signature' => 'nullable|string',
        ]);

        $guarantee->status = $request->status;
        if ($request->status === 'received') {
            $guarantee->received_at = now();
            $guarantee->received_by_signature = $request->signature ?? $user->name;
        } elseif ($request->status === 'returned') {
            $guarantee->returned_at = now();
            $guarantee->returned_to_signature = $request->signature ?? 'المستأجر';
        }
        if ($request->filled('inspection_notes')) {
            $guarantee->inspection_notes = $request->inspection_notes;
        }
        $guarantee->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث حالة الضمان المالي وإصدار الإيصال الرقمي بنجاح',
            'guarantee' => $guarantee,
        ]);
    }

    /**
     * 16. Record Vehicle Handover / Return (Photos, odometer, fuel)
     */
    public function recordVehicleHandover(Request $request, $bookingId)
    {
        $user = $request->user();
        $booking = RentalBooking::findOrFail($bookingId);

        if ($user->id !== $booking->owner_id && $user->id !== $booking->renter_id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'غير مصرح'], 403);
        }

        $request->validate([
            'record_type' => 'required|in:delivery,return',
            'odometer_km' => 'nullable|integer',
            'fuel_level' => 'nullable|string',
            'condition_notes' => 'nullable|string',
            'extra_charges' => 'nullable|numeric',
            'extra_charges_reason' => 'nullable|string',
        ]);

        $record = \App\Models\VehicleHandoverRecord::create([
            'booking_id' => $booking->id,
            'vehicle_id' => $booking->vehicle_id,
            'owner_id' => $booking->owner_id,
            'renter_id' => $booking->renter_id,
            'record_type' => $request->record_type,
            'odometer_km' => $request->odometer_km,
            'fuel_level' => $request->fuel_level ?? 'full',
            'condition_notes' => $request->condition_notes,
            'keys_handed_over' => true,
            'extra_charges' => $request->extra_charges ?? 0.00,
            'extra_charges_reason' => $request->extra_charges_reason,
            'both_parties_confirmed' => true,
        ]);

        // If returned, mark booking as completed
        if ($request->record_type === 'return') {
            $booking->status = 'completed';
            $booking->save();
        } elseif ($request->record_type === 'delivery') {
            $booking->status = 'active';
            $booking->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'تم توثيق محضر استلام/تسليم السيارة بنجاح واعتماد الفحص الميداني',
            'record' => $record,
            'booking' => $booking,
        ]);
    }

    /**
     * 17. Rate Rental Booking
     */
    public function rateRentalBooking(Request $request, $bookingId)
    {
        $user = $request->user();
        $booking = RentalBooking::where('id', $bookingId)
            ->where('renter_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'rating' => 'required|numeric|min:1|max:5',
            'review' => 'nullable|string',
        ]);

        $booking->renter_rating = $request->rating;
        $booking->renter_review = $request->review;
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'شكراً لك! تم تسجيل تقييمك للسيارة ومقدم الخدمة بنجاح',
            'booking' => $booking,
        ]);
    }

    /**
     * 18. Rate Cargo / Motorcycle Request
     */
    public function rateCargoRequest(Request $request, $id)
    {
        $user = $request->user();
        $cargo = CargoRequest::where('id', $id)
            ->where('sender_id', $user->id)
            ->firstOrFail();

        $request->validate([
            'rating' => 'required|numeric|min:1|max:5',
            'review' => 'nullable|string',
        ]);

        $cargo->sender_rating = $request->rating;
        $cargo->sender_review = $request->review;
        $cargo->save();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل تقييمك لخدمة النقل بنجاح',
            'cargo' => $cargo,
        ]);
    }

    /**
     * 19. Universal Active Order Checker for Current User
     */
    public function getActiveOrder(Request $request)
    {
        $user = $request->user();

        // Active Trip (Taxi)
        $trip = Trip::where('passenger_id', $user->id)
            ->whereIn('status', ['requested', 'accepted', 'arrived', 'in_progress'])
            ->with(['driver:id,name,phone', 'driver.driverProfile'])
            ->latest()
            ->first();

        // Active Cargo / Motorcycle
        $cargo = CargoRequest::where('sender_id', $user->id)
            ->whereIn('status', ['pending', 'accepted', 'loading', 'in_transit'])
            ->with(['driver:id,name,phone'])
            ->latest()
            ->first();

        // Active Rental
        $rental = RentalBooking::where('renter_id', $user->id)
            ->whereIn('status', ['pending', 'accepted', 'active'])
            ->with(['vehicle', 'owner:id,name,phone', 'guarantee'])
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'active_trip' => $trip,
            'active_cargo' => $cargo,
            'active_rental' => $rental,
        ]);
    }

    /**
     * 20. Get Driver Registered Transport Services and Vehicles
     */
    public function myServices(Request $request)
    {
        $user = $request->user();
        $services = DriverService::where('user_id', $user->id)->get();
        $vehicles = Vehicle::where('owner_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'services' => $services,
            'vehicles' => $vehicles,
        ]);
    }
}

