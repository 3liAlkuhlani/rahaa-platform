<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceType;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\DriverService;
use Illuminate\Support\Facades\Hash;

class MultiTransportSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed the 4 Core Service Types
        $services = [
            [
                'slug' => 'taxi',
                'name_ar' => 'سيارات الأجرة (تاكسي)',
                'name_en' => 'Taxi Service',
                'description' => 'تنقل فوري وآمن داخل وخارج أمانة العاصمة صنعاء مع أمهر السائقين وبأسعار قياسية.',
                'icon' => 'Car',
                'is_active' => true,
                'base_fare' => 600.00,
                'per_km_rate' => 200.00,
            ],
            [
                'slug' => 'rental',
                'name_ar' => 'السيارات الخاصة وتأجير السيارات',
                'name_en' => 'Private Cars & Rental',
                'description' => 'احجز واستأجر سيارات خاصة واقتصادية وفارهة باليوم أو بالساعة، بقيادتك أو مع سائق محترف.',
                'icon' => 'Key',
                'is_active' => true,
                'base_fare' => 15000.00,
                'per_km_rate' => 0.00,
            ],
            [
                'slug' => 'truck',
                'name_ar' => 'شاحنات نقل البضائع والعفش',
                'name_en' => 'Trucks & Cargo Transportation',
                'description' => 'نقل آمن لجميع البضائع والأثاث والمواد الإنشائية بمختلف أحجام الشاحنات (دينا، ونش، قاطرة).',
                'icon' => 'Truck',
                'is_active' => true,
                'base_fare' => 4500.00,
                'per_km_rate' => 400.00,
            ],
            [
                'slug' => 'motorcycle',
                'name_ar' => 'الدراجات النارية (توصيل ومشاوير)',
                'name_en' => 'Motorcycles & Fast Courier',
                'description' => 'أسرع وسيلة لتجاوز الزحام ونقل الركاب وتوصيل الطرود والطلبات الصغيرة في دقائق.',
                'icon' => 'Bike',
                'is_active' => true,
                'base_fare' => 300.00,
                'per_km_rate' => 100.00,
            ],
        ];

        foreach ($services as $srv) {
            ServiceType::updateOrCreate(['slug' => $srv['slug']], $srv);
        }

        // 2. Ensure existing approved driver has Taxi service & vehicle assigned
        $driver = User::where('phone', '772223344')->first();
        if ($driver) {
            DriverService::updateOrCreate(
                ['user_id' => $driver->id, 'service_type' => 'taxi'],
                ['status' => 'approved', 'approved_at' => now()]
            );

            Vehicle::updateOrCreate(
                ['plate_number' => 'صنعاء أجرة / 33410'],
                [
                    'owner_id' => $driver->id,
                    'service_type' => 'taxi',
                    'make' => 'تويوتا',
                    'model' => 'كامري أجرة حديثة',
                    'year' => 2023,
                    'color' => 'أبيض وأصفر',
                    'plate_number' => 'صنعاء أجرة / 33410',
                    'category' => 'comfort',
                    'seats' => 4,
                    'fuel_type' => 'petrol',
                    'transmission' => 'automatic',
                    'location_name' => 'شارع حدة - صنعاء',
                    'status' => 'approved',
                    'is_available' => true,
                    'rating' => 4.96,
                ]
            );
        }

        // 3. Seed a Car Rental Owner & sample rental vehicles
        $rentalOwner = User::firstOrCreate(
            ['phone' => '774445566'],
            [
                'name' => 'معرض الصنعاني للسيارات',
                'username' => 'sana_rental',
                'email' => 'rental@rahah.ye',
                'password' => Hash::make('password123'),
                'role' => 'driver',
                'status' => 'active',
                'phone_verified_at' => now(),
            ]
        );

        DriverService::updateOrCreate(
            ['user_id' => $rentalOwner->id, 'service_type' => 'rental'],
            ['status' => 'approved', 'approved_at' => now()]
        );

        // Seed Sample Rental Vehicles
        $rentalVehicles = [
            [
                'owner_id' => $rentalOwner->id,
                'service_type' => 'rental',
                'make' => 'تويوتا',
                'model' => 'لاند كروزر صالون فاخر',
                'year' => 2023,
                'color' => 'أبيض لؤلؤي',
                'plate_number' => 'صنعاء / 45892',
                'category' => 'suv',
                'seats' => 7,
                'fuel_type' => 'petrol',
                'transmission' => 'automatic',
                'daily_rate' => 45000.00,
                'hourly_rate' => 5000.00,
                'with_driver_available' => true,
                'self_drive_available' => true,
                'location_name' => 'حدة - شارع الستين الجنوبي',
                'location_lat' => 15.3280,
                'location_lng' => 44.1850,
                'images' => [
                    'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
                ],
                'status' => 'approved',
                'is_available' => true,
                'rating' => 4.95,
            ],
            [
                'owner_id' => $rentalOwner->id,
                'service_type' => 'rental',
                'make' => 'هيونداي',
                'model' => 'إلنترا حديثة',
                'year' => 2024,
                'color' => 'فضي معدني',
                'plate_number' => 'صنعاء / 12890',
                'category' => 'sedan',
                'seats' => 5,
                'fuel_type' => 'petrol',
                'transmission' => 'automatic',
                'daily_rate' => 22000.00,
                'hourly_rate' => 2500.00,
                'with_driver_available' => true,
                'self_drive_available' => true,
                'location_name' => 'الأصبحي - قرب بريد الأصبحي',
                'location_lat' => 15.3120,
                'location_lng' => 44.2150,
                'images' => [
                    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
                ],
                'status' => 'approved',
                'is_available' => true,
                'rating' => 4.88,
            ],
            [
                'owner_id' => $rentalOwner->id,
                'service_type' => 'rental',
                'make' => 'كيا',
                'model' => 'سبورتاج دفع رباعي',
                'year' => 2023,
                'color' => 'أسود ملوكي',
                'plate_number' => 'صنعاء / 77312',
                'category' => 'suv',
                'seats' => 5,
                'fuel_type' => 'hybrid',
                'transmission' => 'automatic',
                'daily_rate' => 28000.00,
                'hourly_rate' => 3200.00,
                'with_driver_available' => true,
                'self_drive_available' => true,
                'location_name' => 'شارع الزبيري - تقاطع بغداد',
                'location_lat' => 15.3480,
                'location_lng' => 44.1980,
                'images' => [
                    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format&fit=crop&q=80',
                ],
                'status' => 'approved',
                'is_available' => true,
                'rating' => 4.90,
            ],
        ];

        foreach ($rentalVehicles as $vData) {
            Vehicle::updateOrCreate(['plate_number' => $vData['plate_number']], $vData);
        }

        // 4. Seed Truck Driver
        $truckDriver = User::firstOrCreate(
            ['phone' => '775556677'],
            [
                'name' => 'وليد الحميري (شاحنات نقل)',
                'username' => 'walid_truck',
                'email' => 'truck@rahah.ye',
                'password' => Hash::make('password123'),
                'role' => 'driver',
                'status' => 'active',
                'phone_verified_at' => now(),
            ]
        );

        DriverService::updateOrCreate(
            ['user_id' => $truckDriver->id, 'service_type' => 'truck'],
            ['status' => 'approved', 'approved_at' => now()]
        );

        Vehicle::updateOrCreate(
            ['plate_number' => 'صنعاء نقل / 55102'],
            [
                'owner_id' => $truckDriver->id,
                'service_type' => 'truck',
                'make' => 'إيسوزو',
                'model' => 'دينا نقل عفش وبضائع',
                'year' => 2021,
                'color' => 'أبيض',
                'plate_number' => 'صنعاء نقل / 55102',
                'category' => 'furniture',
                'max_payload_kg' => 4500.00,
                'location_name' => 'صنعاء - جولة آية',
                'status' => 'approved',
                'is_available' => true,
                'rating' => 4.92,
            ]
        );

        // 5. Seed Motorcycle Driver
        $motoDriver = User::firstOrCreate(
            ['phone' => '776667788'],
            [
                'name' => 'عصام البعداني (دراجة سريعة)',
                'username' => 'esam_moto',
                'email' => 'moto@rahah.ye',
                'password' => Hash::make('password123'),
                'role' => 'driver',
                'status' => 'active',
                'phone_verified_at' => now(),
            ]
        );

        DriverService::updateOrCreate(
            ['user_id' => $motoDriver->id, 'service_type' => 'motorcycle'],
            ['status' => 'approved', 'approved_at' => now()]
        );

        Vehicle::updateOrCreate(
            ['plate_number' => 'صنعاء دراجة / 9901'],
            [
                'owner_id' => $motoDriver->id,
                'service_type' => 'motorcycle',
                'make' => 'سانيانغ',
                'model' => 'سكوتر توصيل سريع',
                'year' => 2023,
                'color' => 'أحمر وأسود',
                'plate_number' => 'صنعاء دراجة / 9901',
                'category' => 'delivery',
                'location_name' => 'التحرير - صنعاء',
                'status' => 'approved',
                'is_available' => true,
                'rating' => 5.00,
            ]
        );

        // 6. Seed Sample Orders for Rental, Truck, and Motorcycle Portals
        $passenger = User::where('phone', '771234567')->first();
        $firstRentalCar = Vehicle::where('owner_id', $rentalOwner->id)->first();

        if ($passenger && $firstRentalCar) {
            \App\Models\RentalBooking::firstOrCreate(
                ['booking_number' => 'RNT-1001'],
                [
                    'renter_id' => $passenger->id,
                    'vehicle_id' => $firstRentalCar->id,
                    'owner_id' => $rentalOwner->id,
                    'rental_mode' => 'self_drive',
                    'start_date' => now()->format('Y-m-d'),
                    'end_date' => now()->addDays(2)->format('Y-m-d'),
                    'pickup_time' => '09:00 ص',
                    'return_time' => '09:00 ص',
                    'total_amount' => 90000.00,
                    'payment_method' => 'wallet',
                    'status' => 'pending',
                ]
            );
        }

        if ($passenger) {
            \App\Models\CargoRequest::firstOrCreate(
                ['request_number' => 'TRK-2001'],
                [
                    'sender_id' => $passenger->id,
                    'service_type' => 'truck',
                    'sub_service' => 'cargo',
                    'pickup_location' => 'شارع تعز - جولة العدين',
                    'pickup_lat' => 15.3200,
                    'pickup_lng' => 44.2050,
                    'delivery_location' => 'حي الأصبحي - خلف المقالح',
                    'delivery_lat' => 15.3120,
                    'delivery_lng' => 44.2150,
                    'cargo_type' => 'أثاث منزلي وغرف نوم',
                    'cargo_description' => 'نقل غرفة نوم كاملة مع مجلس عربي وثلاجة (يحتاج دينا مغلقة)',
                    'weight_kg' => 1800,
                    'volume_size' => 'large',
                    'required_truck_type' => 'dina_closed',
                    'estimated_fare' => 12000.00,
                    'payment_method' => 'cash',
                    'status' => 'pending',
                ]
            );

            \App\Models\CargoRequest::firstOrCreate(
                ['request_number' => 'MOT-3001'],
                [
                    'sender_id' => $passenger->id,
                    'service_type' => 'motorcycle',
                    'sub_service' => 'delivery',
                    'pickup_location' => 'شارع حدة - جولة الرويشان',
                    'pickup_lat' => 15.3280,
                    'pickup_lng' => 44.1850,
                    'delivery_location' => 'شارع الزبيري - أمام مستشفى الكويت',
                    'delivery_lat' => 15.3480,
                    'delivery_lng' => 44.1980,
                    'cargo_type' => 'طرد مستندات وأدوية مستعجلة',
                    'cargo_description' => 'توصيل ظرف مستندات رسمية مع حقيبة صغيرة بشكل فوري',
                    'weight_kg' => 5,
                    'volume_size' => 'small',
                    'estimated_fare' => 1200.00,
                    'payment_method' => 'wallet',
                    'status' => 'pending',
                ]
            );
        }
    }
}
