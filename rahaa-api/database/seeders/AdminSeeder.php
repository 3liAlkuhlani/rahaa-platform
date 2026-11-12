<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates default Admin: Username 'علي نشوان', Password '12345'
     */
    public function run(): void
    {
        // 1. Primary Admin account with 770000000
        $admin = User::updateOrCreate(
            ['phone' => '770000000'],
            [
                'name' => 'علي نشوان',
                'username' => 'علي نشوان',
                'email' => 'admin@rahaa.ye',
                'password' => '12345',
                'role' => 'admin',
                'status' => 'active',
                'phone_verified_at' => now(),
            ]
        );

        // 2. Secondary Admin account with 775229000
        User::updateOrCreate(
            ['phone' => '775229000'],
            [
                'name' => 'علي نشوان (مشرف)',
                'username' => 'ali_admin',
                'email' => 'admin2@rahaa.ye',
                'password' => '12345',
                'role' => 'admin',
                'status' => 'active',
                'phone_verified_at' => now(),
            ]
        );
    }
}
