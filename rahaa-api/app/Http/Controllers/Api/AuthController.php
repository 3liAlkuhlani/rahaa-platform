<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PassengerProfile;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

            $user = User::whereIn('role', ['admin', 'supervisor'])
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

            $token = $user->createToken('admin-access-token', [$user->role])->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل دخول الإدارة بنجاح',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'role' => $user->role,
                    'permissions' => $user->isAdmin() ? User::SUPERVISOR_PERMISSIONS : ($user->permissions ?? []),
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
                'username' => $user->username,
                'phone' => $user->phone,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $user->isAdmin() ? User::SUPERVISOR_PERMISSIONS : ($user->isSupervisor() ? ($user->permissions ?? []) : []),
                'status' => $user->status,
                'profile' => $profile,
                'primary_service' => $primaryService,
                'driver_services' => $driverServices,
                'vehicles' => $vehicles,
            ],
        ]);
    }

    private function normalizeArabicDigits(?string $value): string
    {
        if ($value === null) {
            return '';
        }
        $arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        $western = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return str_replace($arabic, $western, $value);
    }

    /**
     * Register Passenger
     */
    public function registerPassenger(Request $request)
    {
        $cleanName = trim((string) $request->input('name', ''));
        $cleanPhone = preg_replace('/\D/', '', $this->normalizeArabicDigits((string) $request->input('phone', '')));
        $cleanEmail = $request->filled('email') ? trim((string) $request->input('email')) : null;

        $input = array_merge($request->all(), [
            'name' => $cleanName,
            'phone' => $cleanPhone,
            'email' => $cleanEmail,
        ]);

        $validator = Validator::make($input, [
            'name' => 'required|string|min:3|max:100',
            'phone' => ['required', 'string', 'regex:/^7[0-9]{8}$/', 'unique:users,phone'],
            'password' => 'required|string|min:6|confirmed',
            'email' => 'nullable|email|unique:users,email',
        ], [
            'name.required' => 'يرجى إدخال الاسم الكامل',
            'name.min' => 'يجب أن يتكون الاسم من 3 أحرف على الأقل',
            'phone.required' => 'يرجى إدخال رقم الهاتف',
            'phone.regex' => 'يرجى إدخال رقم هاتف صحيح مكون من 9 أرقام ويبدأ بالرقم 7',
            'phone.unique' => 'رقم الهاتف هذا مسجل بالفعل مسبقاً',
            'email.email' => 'يرجى إدخال البريد الإلكتروني بشكل صحيح',
            'email.unique' => 'البريد الإلكتروني هذا مسجل بالفعل مسبقاً',
            'password.required' => 'يرجى إنشاء كلمة المرور',
            'password.min' => 'يجب ألا تقل كلمة المرور عن 6 خانات',
            'password.confirmed' => 'كلمة المرور وتأكيدها غير متطابقتين',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        [$user, $profile] = DB::transaction(function () use ($cleanName, $cleanPhone, $cleanEmail, $request) {
            $user = User::create([
                'name' => $cleanName,
                'phone' => $cleanPhone,
                'email' => $cleanEmail,
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

            return [$user, $profile];
        });

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
     * Register Driver with mandatory vehicle fields & file uploads
     */
    public function registerDriver(Request $request)
    {
        $cleanName = trim((string) $request->input('name', ''));
        $cleanPhone = preg_replace('/\D/', '', $this->normalizeArabicDigits((string) $request->input('phone', '')));
        $cleanEmail = $request->filled('email') ? trim((string) $request->input('email')) : null;
        $cleanPlate = trim((string) $request->input('vehicle_plate', ''));
        $cleanModel = trim((string) $request->input('vehicle_model', ''));

        $input = array_merge($request->all(), [
            'name' => $cleanName,
            'phone' => $cleanPhone,
            'email' => $cleanEmail,
            'vehicle_plate' => $cleanPlate,
            'vehicle_model' => $cleanModel,
        ]);

        $validator = Validator::make($input, [
            'name' => 'required|string|min:3|max:100',
            'phone' => ['required', 'string', 'regex:/^7[0-9]{8}$/', 'unique:users,phone'],
            'password' => 'required|string|min:6|confirmed',
            'email' => 'nullable|email|unique:users,email',
            'service_type' => 'required|string|in:taxi,rental,truck,motorcycle',
            'vehicle_plate' => 'required|string|min:2|max:20',
            'vehicle_model' => 'required|string|min:2|max:50',
            'vehicle_type' => 'nullable|string|in:economy,comfort,vip,family',
            'vehicle_color' => 'nullable|string|max:30',
            'max_payload_kg' => 'required_if:service_type,truck|nullable|numeric|min:100',
            'daily_rate' => 'required_if:service_type,rental|nullable|numeric|min:1000',
            'license_photo' => 'required|file|mimes:jpeg,png,jpg,webp,pdf|max:5120',
            'selfie_photo' => 'required|file|mimes:jpeg,png,jpg,webp|max:5120',
            'car_front_photo' => 'required|file|mimes:jpeg,png,jpg,webp|max:5120',
            'car_back_photo' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:5120',
        ], [
            'name.required' => 'يرجى إدخال اسم السائق الكامل',
            'name.min' => 'يجب أن يتكون الاسم من 3 أحرف على الأقل',
            'phone.required' => 'يرجى إدخال رقم الهاتف',
            'phone.regex' => 'يرجى إدخال رقم هاتف صحيح مكون من 9 أرقام ويبدأ بالرقم 7',
            'phone.unique' => 'رقم الهاتف مسجل بالفعل لسائق أو راكب آخر',
            'email.email' => 'يرجى إدخال البريد الإلكتروني بشكل صحيح',
            'email.unique' => 'البريد الإلكتروني مسجل بالفعل لحساب آخر',
            'password.required' => 'يرجى إنشاء كلمة المرور',
            'password.min' => 'يجب ألا تقل كلمة المرور عن 6 خانات',
            'password.confirmed' => 'كلمة المرور وتأكيدها غير متطابقتين',
            'service_type.required' => 'يرجى اختيار نوع الخدمة / وسيلة النقل',
            'service_type.in' => 'نوع الخدمة المختار غير صالح',
            'vehicle_plate.required' => 'يرجى إدخال رقم لوحة المركبة',
            'vehicle_plate.min' => 'رقم لوحة المركبة قصير جداً',
            'vehicle_model.required' => 'يرجى إدخال طراز المركبة وسنة الصنع',
            'vehicle_model.min' => 'طراز المركبة قصير جداً',
            'max_payload_kg.required_if' => 'يرجى تحديد الحمولة القصوى للشاحنة بالكيلوجرام',
            'daily_rate.required_if' => 'يرجى تحديد السعر اليومي لتأجير السيارة',
            'license_photo.required' => 'يرجى إرفاق صورة رخصة القيادة',
            'license_photo.mimes' => 'صيغة ملف رخصة القيادة غير مدعومة',
            'license_photo.max' => 'حجم ملف رخصة القيادة يتجاوز الحد الأقصى (5MB)',
            'selfie_photo.required' => 'يرجى إرفاق صورة سيلفي واضحة للوجه',
            'selfie_photo.mimes' => 'صيغة صورة السيلفي غير مدعومة',
            'selfie_photo.max' => 'حجم صورة السيلفي يتجاوز الحد الأقصى (5MB)',
            'car_front_photo.required' => 'يرجى إرفاق صورة واحدة على الأقل للمركبة',
            'car_front_photo.mimes' => 'صيغة صورة المركبة غير مدعومة',
            'car_front_photo.max' => 'حجم صورة المركبة يتجاوز الحد الأقصى (5MB)',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        // Store files safely in storage/app/public/driver_docs
        $licensePath = $request->file('license_photo')->store('driver_docs', 'public');
        $selfiePath = $request->file('selfie_photo')->store('driver_docs', 'public');
        $carFrontPath = $request->file('car_front_photo')->store('driver_docs', 'public');
        $carBackPath = $request->hasFile('car_back_photo')
            ? $request->file('car_back_photo')->store('driver_docs', 'public')
            : null;

        $chosenService = $input['service_type'];

        [$user, $profile] = DB::transaction(function () use (
            $cleanName,
            $cleanPhone,
            $cleanEmail,
            $cleanPlate,
            $cleanModel,
            $licensePath,
            $selfiePath,
            $carFrontPath,
            $carBackPath,
            $chosenService,
            $request
        ) {
            $user = User::create([
                'name' => $cleanName,
                'phone' => $cleanPhone,
                'email' => $cleanEmail,
                'password' => Hash::make($request->password),
                'role' => 'driver',
                'status' => 'pending', // Pending Admin approval
                'phone_verified_at' => now(),
            ]);

            $profile = DriverProfile::create([
                'user_id' => $user->id,
                'vehicle_type' => $request->input('vehicle_type', 'comfort'),
                'vehicle_plate' => $cleanPlate,
                'vehicle_model' => $cleanModel,
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

            \App\Models\DriverService::create([
                'user_id' => $user->id,
                'service_type' => $chosenService,
                'status' => 'pending',
            ]);

            \App\Models\Vehicle::create([
                'owner_id' => $user->id,
                'service_type' => $chosenService,
                'make' => explode(' ', $cleanModel)[0] ?: 'تويوتا',
                'model' => $cleanModel,
                'year' => (int) $request->input('vehicle_year', 2022),
                'color' => $request->vehicle_color ?? 'أبيض',
                'plate_number' => $cleanPlate,
                'category' => $request->input('category', 'sedan'),
                'max_payload_kg' => $request->input('max_payload_kg'),
                'daily_rate' => $request->input('daily_rate'),
                'status' => 'pending',
                'is_available' => true,
            ]);

            return [$user, $profile];
        });

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
                'permissions' => $user->isAdmin() ? User::SUPERVISOR_PERMISSIONS : ($user->isSupervisor() ? ($user->permissions ?? []) : []),
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
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }
}
