<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Trip;
use App\Models\DriverProfile;
use App\Models\PassengerProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class RahaaApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * 1. Test Admin Login with 'علي نشوان' and '12345'
     */
    public function test_admin_login_successful_with_initial_credentials()
    {
        $response = $this->postJson('/api/auth/login', [
            'login_type' => 'admin',
            'username' => 'علي نشوان',
            'password' => '12345',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure(['token', 'user' => ['id', 'name', 'username', 'role']]);
    }

    /**
     * 2. Test Admin Login Rejects Invalid Password
     */
    public function test_admin_login_rejects_wrong_password()
    {
        $response = $this->postJson('/api/auth/login', [
            'login_type' => 'admin',
            'username' => 'علي نشوان',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson(['success' => false]);
    }

    /**
     * 3. Test Passenger Registration and Database Persistence
     */
    public function test_passenger_registration_persists_in_database()
    {
        $response = $this->postJson('/api/auth/register/passenger', [
            'name' => 'عمر خالد الصبري',
            'phone' => '778899001',
            'password' => 'securepass123',
            'password_confirmation' => 'securepass123',
        ]);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'phone' => '778899001',
            'role' => 'passenger',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('passenger_profiles', [
            'wallet_balance' => 0.00,
        ]);
    }

    /**
     * 4. Test Duplicate Phone Number is Rejected
     */
    public function test_duplicate_phone_registration_is_rejected()
    {
        // 771234567 seeded in DatabaseSeeder
        $response = $this->postJson('/api/auth/register/passenger', [
            'name' => 'مستخدم مكرر',
            'phone' => '771234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)
                 ->assertJson(['success' => false]);
    }

    /**
     * 5. Test Driver Registration Defaults to 'pending'
     */
    public function test_driver_registration_persists_as_pending()
    {
        $response = $this->postJson('/api/auth/register/driver', [
            'name' => 'فؤاد محمد الشميري',
            'phone' => '775566778',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'vehicle_plate' => '33412 / 1',
            'vehicle_model' => 'كيا سيراتو 2021',
        ]);

        $response->assertStatus(201)
                 ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'phone' => '775566778',
            'role' => 'driver',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('driver_profiles', [
            'status' => 'pending',
            'vehicle_plate' => '33412 / 1',
        ]);
    }

    /**
     * 6. Test Admin Password Change Requires Authentication
     */
    public function test_admin_change_password_requires_authentication()
    {
        $response = $this->postJson('/api/admin/change-password', [
            'current_password' => '12345',
            'new_password' => 'newadminpass99',
            'new_password_confirmation' => 'newadminpass99',
        ]);

        $response->assertStatus(401);
    }

    /**
     * 7. Test Admin Password Change Rejects Wrong Current Password
     */
    public function test_admin_change_password_rejects_wrong_current_password()
    {
        $admin = User::where('username', 'علي نشوان')->first();

        $response = $this->actingAs($admin)->postJson('/api/admin/change-password', [
            'current_password' => 'wrongpass',
            'new_password' => 'newadminpass99',
            'new_password_confirmation' => 'newadminpass99',
        ]);

        $response->assertStatus(422)
                 ->assertJson(['success' => false]);
    }

    /**
     * 8. Test Admin Successfully Changes Password Inside Dashboard
     */
    public function test_admin_successfully_changes_password()
    {
        $admin = User::where('username', 'علي نشوان')->first();

        $response = $this->actingAs($admin)->postJson('/api/admin/change-password', [
            'current_password' => '12345',
            'new_password' => 'newadminpass99',
            'new_password_confirmation' => 'newadminpass99',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);

        // Verify new password works
        $admin->refresh();
        $this->assertTrue(Hash::check('newadminpass99', $admin->password));
    }

    /**
     * 9. Test Passenger/Driver Cannot Change Admin Password
     */
    public function test_passenger_cannot_change_admin_password()
    {
        $passenger = User::where('role', 'passenger')->first();

        $response = $this->actingAs($passenger)->postJson('/api/admin/change-password', [
            'current_password' => 'password123',
            'new_password' => 'newadminpass99',
            'new_password_confirmation' => 'newadminpass99',
        ]);

        $response->assertStatus(403);
    }

    /**
     * 10. Test Trip Concurrency: Trip cannot be accepted twice
     */
    public function test_trip_cannot_be_accepted_by_two_drivers()
    {
        $driver1 = User::where('phone', '772223344')->first(); // approved driver
        $trip = Trip::where('status', 'requested')->first();

        // First driver accepts
        $response1 = $this->actingAs($driver1)->postJson("/api/trips/{$trip->id}/accept");
        $response1->assertStatus(200)->assertJson(['success' => true]);

        // Second driver tries to accept the same trip
        $driver2User = User::create([
            'name' => 'سائق ثاني',
            'phone' => '779911223',
            'password' => 'password123',
            'role' => 'driver',
            'status' => 'active',
        ]);
        DriverProfile::create([
            'user_id' => $driver2User->id,
            'status' => 'approved',
            'vehicle_plate' => '55555 / 1',
        ]);

        $response2 = $this->actingAs($driver2User)->postJson("/api/trips/{$trip->id}/accept");
        $response2->assertStatus(409)->assertJson(['success' => false]);
    }

    /**
     * 11. Test Passenger and Driver are Forbidden from Admin Dashboard Routes
     */
    public function test_non_admin_cannot_access_admin_stats_or_management()
    {
        $passenger = User::where('role', 'passenger')->first();
        $driver = User::where('role', 'driver')->first();

        $this->actingAs($passenger)->getJson('/api/admin/stats')->assertStatus(403);
        $this->actingAs($driver)->getJson('/api/admin/drivers')->assertStatus(403);
    }

    /**
     * 12. Test Trip Confirmation and Duplicate Prevention on Retry
     */
    public function test_trip_request_and_duplicate_prevention()
    {
        $passenger = User::where('role', 'passenger')->first();

        $payload = [
            'pickup_name' => 'شارع حدة - جولة الرويشان',
            'dropoff_name' => 'ميدان السبعين - جامع الصالح',
            'vehicle_type' => 'comfort',
            'fare' => 2600,
            'payment_method' => 'cash',
        ];

        $res1 = $this->actingAs($passenger)->postJson('/api/trips/request', $payload);
        $res1->assertStatus(201)->assertJson(['success' => true]);
        $tripId = $res1->json('trip.id');

        // Immediate retry should return the existing active requested trip without creating a duplicate
        $res2 = $this->actingAs($passenger)->postJson('/api/trips/request', $payload);
        $res2->assertStatus(200)->assertJson(['success' => true]);
        $this->assertEquals($tripId, $res2->json('trip.id'));

        // Fetching trip details for the map screen works
        $resShow = $this->actingAs($passenger)->getJson("/api/trips/{$tripId}");
        $resShow->assertStatus(200)->assertJsonPath('trip.id', $tripId);
    }
}
