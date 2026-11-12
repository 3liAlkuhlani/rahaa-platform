<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DriverProfile;
use App\Models\PassengerProfile;
use App\Models\Trip;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Main Admin
        $this->call(AdminSeeder::class);

        // 2. Seed Sample Passenger
        $passenger = User::firstOrCreate(
            ['phone' => '771234567'],
            [
                'name' => 'محمد أحمد الصنعاني',
                'email' => 'mohammed@example.com',
                'password' => Hash::make('password123'),
                'role' => 'passenger',
                'status' => 'active',
                'phone_verified_at' => now(),
            ]
        );
        PassengerProfile::firstOrCreate(
            ['user_id' => $passenger->id],
            [
                'wallet_balance' => 4500.00,
                'total_trips' => 14,
                'rating' => 4.9,
                'saved_places' => [
                    ['title' => 'المنزل', 'address' => 'شارع حدة، بالقرب من جولة الرويشان'],
                    ['title' => 'العمل', 'address' => 'شارع الزبيري، برج النعمان']
                ],
            ]
        );

        // 3. Seed Sample Approved Driver
        $driver1 = User::firstOrCreate(
            ['phone' => '772223344'],
            [
                'name' => 'صالح علي الحميري',
                'email' => 'saleh@example.com',
                'password' => Hash::make('password123'),
                'role' => 'driver',
                'status' => 'active',
                'phone_verified_at' => now(),
            ]
        );
        DriverProfile::firstOrCreate(
            ['user_id' => $driver1->id],
            [
                'vehicle_type' => 'comfort',
                'vehicle_plate' => '12450 / 1',
                'vehicle_model' => 'تويوتا كورولا 2022',
                'vehicle_color' => 'أبيض لؤلؤي',
                'status' => 'approved',
                'rating' => 4.95,
                'total_trips' => 89,
                'wallet_balance' => 18450.00,
                'is_online' => true,
                'current_lat' => 15.3524,
                'current_lng' => 44.2078,
            ]
        );

        // 4. Seed Sample Pending Driver for Admin Approval Workflow
        $driver2 = User::firstOrCreate(
            ['phone' => '773334455'],
            [
                'name' => 'ياسر خالد اليافعي',
                'email' => 'yasser@example.com',
                'password' => Hash::make('password123'),
                'role' => 'driver',
                'status' => 'pending',
                'phone_verified_at' => now(),
            ]
        );
        DriverProfile::firstOrCreate(
            ['user_id' => $driver2->id],
            [
                'vehicle_type' => 'vip',
                'vehicle_plate' => '89421 / 1',
                'vehicle_model' => 'هيونداي سوناتا 2023',
                'vehicle_color' => 'فضي',
                'status' => 'pending',
                'rating' => 5.00,
                'total_trips' => 0,
                'wallet_balance' => 0.00,
                'is_online' => false,
            ]
        );

        // 5. Seed Sample Trips
        Trip::firstOrCreate(
            ['trip_number' => 'TRP-1001'],
            [
                'passenger_id' => $passenger->id,
                'driver_id' => $driver1->id,
                'pickup_name' => 'حدة - جولة الرويشان',
                'dropoff_name' => 'شارع الستين الجنوبي - فندق موفنبيك',
                'vehicle_type' => 'comfort',
                'fare' => 2400.00,
                'payment_method' => 'wallet',
                'status' => 'completed',
                'passenger_rating' => 5.0,
                'driver_rating' => 5.0,
                'review' => 'سائق ممتاز وخلوق وملتزم بالوقت',
                'accepted_at' => now()->subHours(3),
                'started_at' => now()->subHours(3)->addMinutes(5),
                'completed_at' => now()->subHours(2)->addMinutes(35),
            ]
        );

        Trip::firstOrCreate(
            ['trip_number' => 'TRP-1002'],
            [
                'passenger_id' => $passenger->id,
                'driver_id' => null,
                'pickup_name' => 'شارع بغداد - أمام المستشفى الجمهوري',
                'dropoff_name' => 'شارع الزبيري - المركز التجاري',
                'vehicle_type' => 'comfort',
                'fare' => 1800.00,
                'payment_method' => 'wallet',
                'status' => 'requested',
            ]
        // 6. Multi-Transport Services and Vehicles
        $this->call(MultiTransportSeeder::class);
    }
}
