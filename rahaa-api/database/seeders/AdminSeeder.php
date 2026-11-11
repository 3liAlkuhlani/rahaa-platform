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
        $admin = User::where('username', 'علي نشوان')->first();
        if ($admin) {
            $admin->password = '12345';
            $admin->save();
        } else {
            User::create([
                'name' => 'علي نشوان',
                'username' => 'علي نشوان',
                'phone' => '775229000',
                'email' => 'admin@rahaa.ye',
                'password' => '12345',
                'role' => 'admin',
                'status' => 'active',
            ]);
        }
    }
}
