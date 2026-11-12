<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PassengerProfile;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Universal Login:
     * - Admin: username + password ('علي نشوان' / '12345') or phone + password
     * - Passenger/Driver: phone + password
     */
    public function login(Request $request)
    {
        $loginType = $request->input('login_type', 'user'); // 'admin' or 'user'

        if ($loginType === 'admin') {
            $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ], [
                'username.required' => 'يرجى إدخال اسم المشرف الإداري',
                'password.required' => 'يرجى إدخال كلمة المرور',
            ]);

            $rawUsername = trim($request->username);
            $cleanPhone = preg_replace('/\D/', '', $rawUsername);

            $user = User::where('role', 'admin')
                ->where(function ($q) use ($rawUsername, $cleanPhone) {
                    $q->where('username', $rawUsername)
                      ->orWhere('name', $rawUsername);
                    if (!empty($cleanPhone)) {
                        $q->orWhere('phone', $cleanPhone);
                    }
                })
                ->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المشرف أو كلمة المرور',
                ], 401);
            }

            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'حساب المشرف غير مفعل حالياً',
                ], 403);
            }

            $token = $user->createToken('admin-access-token', ['admin'])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل دخول المشرف بنجاح',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                ],
            ]);
        }

        // Passenger, Driver, or unified credential login
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ], [
            'phone.required' => 'يرجى إدخال رقم الهاتف',
            'password.required' => 'يرجى إدخال كلمة المرور',
        ]);

        $rawIdentifier = trim($request->phone);
        $phone = preg_replace('/\D/', '', $rawIdentifier);

        $user = User::where(function ($query) use ($phone, $rawIdentifier) {
            if (!empty($phone)) {
                $query->where('phone', $phone);
            }
            $query->orWhere('phone', $rawIdentifier)
                  ->orWhere('username', $rawIdentifier);
        })->first();

        // Admin fallback: support both 770000000, 775229000, and 'علي نشوان'
        if (!$user && (in_array($phone, ['770000000', '775229000']) || in_array($rawIdentifier, ['علي نشوان', 'admin']))) {
            $user = User::where('role', 'admin')->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'رقم الهاتف أو كلمة المرور غير صحيحة',
            ], 401);
        }

        if ($user->status === 'banned') {
            return response()->json([
                'success' => false,
                'message' => 'تم حظر هذا الحساب، يرجى مراجعة إدارة راحة',
            ], 403);
        }

        // Fetch user profile based on role
        $profile = null;
        $driverServices = [];
        $vehicles = [];
        $primaryService = null;

        $serviceNamesAr = [
            'taxi' => 'سيارات الأجرة (تاكسي)',
            'rental' => 'تأجير السيارات الخاصة',
            'truck' => 'شاحنات نقل البضائع',
            'motorcycle' => 'الدراجات النارية',
        ];

        if ($user->role === 'driver') {
            $profile = $user->driverProfile;
            $driverServices = $user->driverServices()->get();
            $vehicles = $user->vehicles()->get();

            $ownedServices = $driverServices->pluck('service_type')
                ->merge($vehicles->pluck('service_type'))
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            if (empty($ownedServices)) {
                $ownedServices = ['taxi'];
            }

            $primaryService = $ownedServices[0];

            // Verify driver vehicle type if specified during driver portal login
            $requestedService = $request->input('driver_service_type');
            if (!empty($requestedService) && in_array($requestedService, ['taxi', 'rental', 'truck', 'motorcycle'])) {
                if (!in_array($requestedService, $ownedServices)) {
                    $ownedLabel = $serviceNamesAr[$primaryService] ?? $primaryService;
                    $reqLabel = $serviceNamesAr[$requestedService] ?? $requestedService;
                    return response()->json([
                        'success' => false,
                        'owned_service' => $primaryService,
                        'message' => "عفواً، هذا الحساب مسجل لوسيلة نقل ({$ownedLabel}) ولا يملك ({$reqLabel}). يرجى تسجيل الدخول من بوابة وسيلة النقل التي تملكها.",
                    ], 403);
                }
                $primaryService = $requestedService;
            }
        } elseif ($user->role === 'passenger') {
            $profile = $user->passengerProfile;
        }

        $token = $user->createToken('user-access-token', [$user->role])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'profile' => $profile,
                'primary_service' => $primaryService,
                'driver_services' => $driverServices,
                'vehicles' => $vehicles,
            ],
        ]);
    }

    /**
     * Register Passenger
     */
    public function registerPassenger(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'phone' => 'required|string|unique:users,phone|min:9|max:15',
            'password' => 'required|string|min:6|confirmed',
            'email' => 'nullable|email|unique:users,email',
        ], [
            'name.required' => 'الاسم الكامل مطلوب',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.unique' => 'رقم الهاتف هذا مسجل بالفعل مسبقاً',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'يجب ألا تقل كلمة المرور عن 6 خانات',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'phone' => preg_replace('/\D/', '', $request->phone),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'passenger',
            'status' => 'active',
            'phone_verified_at' => now(),
        ]);

        $profile = PassengerProfile::create([
            'user_id' => $user->id,
            'wallet_balance' => 0.00,
            'total_trips' => 0,
            'rating' => 5.00,
        ]);

        $token = $user->createToken('passenger-access-token', ['passenger'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حساب الراكب وحفظه بنجاح',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'profile' => $profile,
            ],
        ], 201);
    }

    /**
     * Register Driver with file uploads
     */
    public function registerDriver(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'phone' => 'required|string|unique:users,phone|min:9|max:15',
            'password' => 'required|string|min:6|confirmed',
            'email' => 'nullable|email|unique:users,email',
            'vehicle_plate' => 'required|string|max:20',
            'vehicle_model' => 'required|string|max:50',
            'vehicle_type' => 'nullable|string|in:economy,comfort,vip,family',
            'vehicle_color' => 'nullable|string|max:30',
            'license_photo' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'selfie_photo' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
            'car_front_photo' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
            'car_back_photo' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
        ], [
            'name.required' => 'الاسم الكامل مطلوب',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.unique' => 'رقم الهاتف مسجل بالفعل لسائق أو راكب آخر',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
            'vehicle_plate.required' => 'رقم لوحة المركبة مطلوب',
            'vehicle_model.required' => 'طراز المركبة وسنة الصنع مطلوبان',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Store files safely in storage/app/public/driver_docs
        $licensePath = null;
        if ($request->hasFile('license_photo')) {
            $licensePath = $request->file('license_photo')->store('driver_docs', 'public');
        }

        $selfiePath = null;
        if ($request->hasFile('selfie_photo')) {
            $selfiePath = $request->file('selfie_photo')->store('driver_docs', 'public');
        }

        $carFrontPath = null;
        if ($request->hasFile('car_front_photo')) {
            $carFrontPath = $request->file('car_front_photo')->store('driver_docs', 'public');
        }

        $carBackPath = null;
        if ($request->hasFile('car_back_photo')) {
            $carBackPath = $request->file('car_back_photo')->store('driver_docs', 'public');
        }

        // Create user with status 'pending' awaiting admin review
        $user = User::create([
            'name' => $request->name,
            'phone' => preg_replace('/\D/', '', $request->phone),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'driver',
            'status' => 'pending', // Pending Admin approval
            'phone_verified_at' => now(),
        ]);

        $profile = DriverProfile::create([
            'user_id' => $user->id,
            'vehicle_type' => $request->input('vehicle_type', 'comfort'),
            'vehicle_plate' => $request->vehicle_plate,
            'vehicle_model' => $request->vehicle_model,
            'vehicle_color' => $request->vehicle_color,
            'license_photo' => $licensePath,
            'selfie_photo' => $selfiePath,
            'car_front_photo' => $carFrontPath,
            'car_back_photo' => $carBackPath,
            'status' => 'pending',
            'rating' => 5.00,
            'total_trips' => 0,
            'wallet_balance' => 0.00,
        ]);

        // Register default requested service (e.g. taxi or selected service)
        $chosenService = $request->input('service_type', 'taxi');
        \App\Models\DriverService::create([
            'user_id' => $user->id,
            'service_type' => $chosenService,
            'status' => 'pending',
        ]);

        // Also create a vehicle record for the multi-transport system
        \App\Models\Vehicle::create([
            'owner_id' => $user->id,
            'service_type' => $chosenService,
            'make' => explode(' ', $request->vehicle_model)[0] ?? 'تويوتا',
            'model' => $request->vehicle_model,
            'year' => (int) $request->input('vehicle_year', 2022),
            'color' => $request->vehicle_color ?? 'أبيض',
            'plate_number' => $request->vehicle_plate,
            'category' => $request->input('category', 'sedan'),
            'max_payload_kg' => $request->input('max_payload_kg'),
            'status' => 'pending',
            'is_available' => true,
        ]);

        $token = $user->createToken('driver-access-token', ['driver'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء حساب السائق بنجاح وهو الآن قيد مراجعة واعتماد المشرف الإداري',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'profile' => $profile,
                'primary_service' => $chosenService,
                'driver_services' => $user->driverServices()->get(),
                'vehicles' => $user->vehicles()->get(),
            ],
        ], 201);
    }

    /**
     * Get Current Authenticated User & Profile
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $profile = null;
        $driverServices = [];
        $vehicles = [];
        $primaryService = null;

        if ($user->role === 'driver') {
            $profile = $user->driverProfile;
            $driverServices = $user->driverServices()->get();
            $vehicles = $user->vehicles()->get();
            $owned = $driverServices->pluck('service_type')
                ->merge($vehicles->pluck('service_type'))
                ->filter()
                ->unique()
                ->values()
                ->toArray();
            $primaryService = $owned[0] ?? 'taxi';
        } elseif ($user->role === 'passenger') {
            $profile = $user->passengerProfile;
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'phone' => $user->phone,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'profile' => $profile,
                'primary_service' => $primaryService,
                'driver_services' => $driverServices,
                'vehicles' => $vehicles,
            ],
        ]);
    }

    /**
     * Logout and revoke tokens
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }
}
