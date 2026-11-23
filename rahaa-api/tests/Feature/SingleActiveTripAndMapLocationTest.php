<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\TripController;
use App\Models\DriverProfile;
use App\Models\DriverService;
use App\Models\PassengerProfile;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SingleActiveTripAndMapLocationTest extends TestCase
{
    use RefreshDatabase;

    private function createPassenger(string $phone = '771111111'): User
    {
        $user = User::create([
            'name' => 'راكب اختبار',
            'phone' => $phone,
            'password' => Hash::make('password123'),
            'role' => 'passenger',
            'status' => 'active',
        ]);
        PassengerProfile::create(['user_id' => $user->id]);
        return $user;
    }

    private function createApprovedTaxiDriver(string $phone = '772222222'): User
    {
        $user = User::create([
            'name' => 'كابتن اختبار',
            'phone' => $phone,
            'password' => Hash::make('password123'),
            'role' => 'driver',
            'status' => 'active',
        ]);
        DriverProfile::create([
            'user_id' => $user->id,
            'vehicle_type' => 'comfort',
            'vehicle_plate' => 'أ ب ج 1234',
            'vehicle_model' => 'Toyota Camry 2022',
            'vehicle_color' => 'أبيض',
            'status' => 'approved',
            'is_online' => true,
            'current_lat' => 15.3510,
            'current_lng' => 44.2010,
        ]);
        DriverService::create([
            'user_id' => $user->id,
            'service_type' => 'taxi',
            'status' => 'approved',
        ]);
        return $user;
    }

    private function tripPayload(array $overrides = []): array
    {
        return array_merge([
            'pickup_name' => 'شارع حدة - مركز الكميم',
            'dropoff_name' => 'ميدان السبعين - جامع الصالح',
            'vehicle_type' => 'comfort',
            'fare' => 2600,
            'payment_method' => 'wallet',
            'pickup_lat' => 15.3280,
            'pickup_lng' => 44.1850,
            'dropoff_lat' => 15.3250,
            'dropoff_lng' => 44.2080,
        ], $overrides);
    }

    public function test_full_single_active_trip_lifecycle_and_live_driver_location(): void
    {
        $passenger = $this->createPassenger('771000001');
        $otherPassenger = $this->createPassenger('771000002');
        $driver = $this->createApprovedTaxiDriver('772000001');

        $passengerToken = $passenger->createToken('test-p1')->plainTextToken;
        $driverToken = $driver->createToken('test-d1')->plainTextToken;

        // 1. Passenger with NO active trip can request a new trip (and spoofed passenger_id is ignored)
        $res1 = $this->withHeader('Authorization', "Bearer {$passengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload(['passenger_id' => $otherPassenger->id]));

        $res1->assertStatus(201)->assertJsonPath('success', true);
        $tripId = $res1->json('trip.id');
        $this->assertEquals($passenger->id, $res1->json('trip.passenger_id'));

        // 2. Passenger with PENDING (requested) trip CANNOT request a second trip
        $res2 = $this->withHeader('Authorization', "Bearer {$passengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload(['dropoff_name' => 'مطار صنعاء']));

        $res2->assertStatus(409)
            ->assertJsonPath('code', 'ACTIVE_TRIP_EXISTS')
            ->assertJsonPath('message', TripController::ACTIVE_TRIP_CONFLICT_MESSAGE)
            ->assertJsonPath('active_trip.id', $tripId);

        // 3. Driver accepts trip -> status becomes ACCEPTED -> Passenger STILL cannot request a second trip
        $this->withHeader('Authorization', "Bearer {$driverToken}")
            ->postJson("/api/trips/{$tripId}/accept")
            ->assertStatus(200)
            ->assertJsonPath('trip.status', 'accepted');

        $this->withHeader('Authorization', "Bearer {$passengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload())
            ->assertStatus(409)
            ->assertJsonPath('message', TripController::ACTIVE_TRIP_CONFLICT_MESSAGE);

        // 4. Driver updates status to arrived (driver_arriving alias) & pushes live GPS location
        $this->withHeader('Authorization', "Bearer {$driverToken}")
            ->postJson("/api/trips/{$tripId}/status", ['status' => 'driver_arriving'])
            ->assertStatus(200)
            ->assertJsonPath('trip.status', 'arrived');

        $this->withHeader('Authorization', "Bearer {$driverToken}")
            ->postJson("/api/trips/{$tripId}/driver-location", ['lat' => 15.3312, 'lng' => 44.1899])
            ->assertStatus(200)
            ->assertJsonPath('driver_lat', 15.3312)
            ->assertJsonPath('driver_lng', 44.1899);

        // Passenger fetches trip and receives live driver coordinates
        $this->withHeader('Authorization', "Bearer {$passengerToken}")
            ->getJson("/api/trips/{$tripId}")
            ->assertStatus(200)
            ->assertJsonPath('trip.driver_lat', 15.3312)
            ->assertJsonPath('trip.driver_lng', 44.1899);

        // Still blocked in arrived status
        $this->withHeader('Authorization', "Bearer {$passengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload())
            ->assertStatus(409);

        // 5. Trip becomes IN_PROGRESS -> still blocked
        $this->withHeader('Authorization', "Bearer {$driverToken}")
            ->postJson("/api/trips/{$tripId}/status", ['status' => 'in_progress'])
            ->assertStatus(200)
            ->assertJsonPath('trip.status', 'in_progress');

        $this->withHeader('Authorization', "Bearer {$passengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload())
            ->assertStatus(409);

        // 6. Logout & re-login -> STILL blocked while active trip exists
        $this->withHeader('Authorization', "Bearer {$passengerToken}")
            ->postJson('/api/auth/logout')
            ->assertStatus(200);

        $newPassengerToken = $passenger->createToken('test-p2')->plainTextToken;
        $this->withHeader('Authorization', "Bearer {$newPassengerToken}")
            ->getJson('/api/trips/active')
            ->assertStatus(200)
            ->assertJsonPath('has_active_trip', true)
            ->assertJsonPath('active_trip.id', $tripId);

        $this->withHeader('Authorization', "Bearer {$newPassengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload())
            ->assertStatus(409);

        // 7. Complete trip -> passenger CAN immediately request a new trip
        $this->withHeader('Authorization', "Bearer {$driverToken}")
            ->postJson("/api/trips/{$tripId}/status", ['status' => 'completed'])
            ->assertStatus(200)
            ->assertJsonPath('trip.status', 'completed');

        $resAfterComplete = $this->withHeader('Authorization', "Bearer {$newPassengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload());
        $resAfterComplete->assertStatus(201);
        $secondTripId = $resAfterComplete->json('trip.id');

        // 8. Cancel the second trip -> passenger CAN immediately request a third trip
        $this->withHeader('Authorization', "Bearer {$newPassengerToken}")
            ->postJson("/api/trips/{$secondTripId}/status", ['status' => 'cancelled'])
            ->assertStatus(200)
            ->assertJsonPath('trip.status', 'cancelled');

        $resAfterCancel = $this->withHeader('Authorization', "Bearer {$newPassengerToken}")
            ->postJson('/api/trips/request', $this->tripPayload());
        $resAfterCancel->assertStatus(201);
    }

    public function test_database_unique_index_blocks_simultaneous_active_trips(): void
    {
        $passenger = $this->createPassenger('771000099');

        Trip::create([
            'trip_number' => 'TRP-DBTEST1',
            'passenger_id' => $passenger->id,
            'pickup_name' => 'شارع حدة',
            'dropoff_name' => 'ميدان السبعين',
            'fare' => 2000,
            'status' => 'requested',
        ]);

        // Direct DB insert of a second active trip for the same passenger MUST fail at the DB constraint level
        $this->expectException(QueryException::class);

        Trip::create([
            'trip_number' => 'TRP-DBTEST2',
            'passenger_id' => $passenger->id,
            'pickup_name' => 'شارع الزبيري',
            'dropoff_name' => 'جامعة صنعاء',
            'fare' => 1800,
            'status' => 'requested',
        ]);
    }
}

