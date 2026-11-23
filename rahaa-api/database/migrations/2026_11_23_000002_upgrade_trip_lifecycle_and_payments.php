<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // SQLite enforces ENUM via a table-level CHECK constraint; rebuild trips table cleanly
            // to include 'driver_arriving' in status CHECK and add payment tracking columns.
            DB::statement('PRAGMA foreign_keys = OFF');

            DB::beginTransaction();
            try {
                DB::statement('DROP INDEX IF EXISTS trips_one_active_per_passenger_unique');

                DB::statement(<<<'SQL'
CREATE TABLE trips_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    trip_number VARCHAR NOT NULL UNIQUE,
    passenger_id INTEGER NOT NULL,
    driver_id INTEGER NULL,
    pickup_name VARCHAR NOT NULL,
    dropoff_name VARCHAR NOT NULL,
    pickup_lat DOUBLE NULL,
    pickup_lng DOUBLE NULL,
    dropoff_lat DOUBLE NULL,
    dropoff_lng DOUBLE NULL,
    driver_lat DOUBLE NULL,
    driver_lng DOUBLE NULL,
    driver_location_updated_at DATETIME NULL,
    vehicle_type VARCHAR NOT NULL DEFAULT 'comfort',
    fare NUMERIC NOT NULL,
    final_fare NUMERIC NULL,
    payment_method VARCHAR NOT NULL DEFAULT 'wallet',
    payment_status VARCHAR NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_reference VARCHAR NULL UNIQUE,
    payment_confirmed_by INTEGER NULL,
    paid_at DATETIME NULL,
    status VARCHAR NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'driver_arriving', 'arrived', 'in_progress', 'completed', 'cancelled')),
    cancellation_reason VARCHAR NULL,
    cancelled_by VARCHAR NULL,
    passenger_rating NUMERIC NULL,
    driver_rating NUMERIC NULL,
    review TEXT NULL,
    accepted_at DATETIME NULL,
    driver_arriving_at DATETIME NULL,
    arrived_at DATETIME NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (payment_confirmed_by) REFERENCES users(id) ON DELETE SET NULL
)
SQL);

                DB::statement(<<<'SQL'
INSERT INTO trips_new (
    id, trip_number, passenger_id, driver_id, pickup_name, dropoff_name,
    pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, driver_lat, driver_lng, driver_location_updated_at,
    vehicle_type, fare, final_fare, payment_method, payment_status,
    status, cancellation_reason, cancelled_by, passenger_rating, driver_rating, review,
    accepted_at, started_at, completed_at, cancelled_at, created_at, updated_at
)
SELECT
    id, trip_number, passenger_id, driver_id, pickup_name, dropoff_name,
    pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, driver_lat, driver_lng, driver_location_updated_at,
    vehicle_type, fare,
    CASE WHEN status = 'completed' THEN fare ELSE NULL END,
    payment_method,
    'pending',
    status, cancellation_reason, cancelled_by, passenger_rating, driver_rating, review,
    accepted_at, started_at, completed_at, cancelled_at, created_at, updated_at
FROM trips
SQL);

                DB::statement('DROP TABLE trips');
                DB::statement('ALTER TABLE trips_new RENAME TO trips');

                // Re-apply database-level single active trip partial unique index including driver_arriving
                DB::statement(
                    "CREATE UNIQUE INDEX trips_one_active_per_passenger_unique " .
                    "ON trips (passenger_id) " .
                    "WHERE status IN ('requested', 'accepted', 'driver_arriving', 'arrived', 'in_progress')"
                );

                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            } finally {
                DB::statement('PRAGMA foreign_keys = ON');
            }
        } else {
            // MySQL / PostgreSQL path
            Schema::table('trips', function (Blueprint $table) {
                if (!Schema::hasColumn('trips', 'final_fare')) {
                    $table->decimal('final_fare', 10, 2)->nullable()->after('fare');
                }
                if (!Schema::hasColumn('trips', 'payment_status')) {
                    $table->string('payment_status', 20)->default('pending')->after('payment_method');
                }
                if (!Schema::hasColumn('trips', 'payment_reference')) {
                    $table->string('payment_reference', 64)->nullable()->unique()->after('payment_status');
                }
                if (!Schema::hasColumn('trips', 'payment_confirmed_by')) {
                    $table->foreignId('payment_confirmed_by')->nullable()->constrained('users')->nullOnDelete()->after('payment_reference');
                }
                if (!Schema::hasColumn('trips', 'paid_at')) {
                    $table->timestamp('paid_at')->nullable()->after('payment_confirmed_by');
                }
                if (!Schema::hasColumn('trips', 'driver_arriving_at')) {
                    $table->timestamp('driver_arriving_at')->nullable()->after('accepted_at');
                }
                if (!Schema::hasColumn('trips', 'arrived_at')) {
                    $table->timestamp('arrived_at')->nullable()->after('driver_arriving_at');
                }
            });

            if (in_array($driver, ['mysql', 'mariadb'], true)) {
                DB::statement(
                    "ALTER TABLE trips MODIFY COLUMN status ENUM('requested','accepted','driver_arriving','arrived','in_progress','completed','cancelled') NOT NULL DEFAULT 'requested'"
                );
            }
        }
    }

    public function down(): void
    {
        // Non-destructive down migration for safety
    }
};
