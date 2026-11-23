<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const ACTIVE_STATUSES = ['requested', 'accepted', 'arrived', 'in_progress'];

    public function up(): void
    {
        // 1. Add real-time driver location columns to trips table
        Schema::table('trips', function (Blueprint $table) {
            if (!Schema::hasColumn('trips', 'driver_lat')) {
                $table->double('driver_lat', 10, 7)->nullable()->after('dropoff_lng');
            }
            if (!Schema::hasColumn('trips', 'driver_lng')) {
                $table->double('driver_lng', 10, 7)->nullable()->after('driver_lat');
            }
            if (!Schema::hasColumn('trips', 'driver_location_updated_at')) {
                $table->timestamp('driver_location_updated_at')->nullable()->after('driver_lng');
            }
        });

        // 2. Clean up any historical duplicate active trips per passenger before applying unique constraint
        $duplicatePassengers = DB::table('trips')
            ->select('passenger_id')
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->groupBy('passenger_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('passenger_id');

        foreach ($duplicatePassengers as $passengerId) {
            $activeTripIds = DB::table('trips')
                ->where('passenger_id', $passengerId)
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->orderByDesc('id')
                ->pluck('id')
                ->toArray();

            // Keep the newest active trip, cancel older stale ones
            $idsToCancel = array_slice($activeTripIds, 1);
            if (!empty($idsToCancel)) {
                DB::table('trips')
                    ->whereIn('id', $idsToCancel)
                    ->update([
                        'status' => 'cancelled',
                        'cancelled_by' => 'system',
                        'cancellation_reason' => 'إلغاء تلقائي لتطبيق قاعدة رحلة نشطة واحدة لكل راكب',
                        'cancelled_at' => now(),
                        'updated_at' => now(),
                    ]);
            }
        }

        // 3. Enforce single active trip per passenger at the DATABASE level
        $driver = DB::getDriverName();
        if (in_array($driver, ['sqlite', 'pgsql'], true)) {
            DB::statement(
                "CREATE UNIQUE INDEX IF NOT EXISTS trips_one_active_per_passenger_unique " .
                "ON trips (passenger_id) " .
                "WHERE status IN ('requested', 'accepted', 'arrived', 'in_progress')"
            );
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            if (!Schema::hasColumn('trips', 'active_passenger_lock')) {
                DB::statement(
                    "ALTER TABLE trips ADD COLUMN active_passenger_lock BIGINT UNSIGNED " .
                    "GENERATED ALWAYS AS (CASE WHEN status IN ('requested', 'accepted', 'arrived', 'in_progress') THEN passenger_id ELSE NULL END) VIRTUAL"
                );
                DB::statement(
                    "CREATE UNIQUE INDEX trips_one_active_per_passenger_unique ON trips (active_passenger_lock)"
                );
            }
        }
    }

    public function down(): void
    {
        $driver = DB::getDriverName();
        if (in_array($driver, ['sqlite', 'pgsql'], true)) {
            DB::statement('DROP INDEX IF EXISTS trips_one_active_per_passenger_unique');
        } elseif (in_array($driver, ['mysql', 'mariadb'], true)) {
            if (Schema::hasColumn('trips', 'active_passenger_lock')) {
                DB::statement('DROP INDEX trips_one_active_per_passenger_unique ON trips');
                DB::statement('ALTER TABLE trips DROP COLUMN active_passenger_lock');
            }
        }

        Schema::table('trips', function (Blueprint $table) {
            $cols = [];
            foreach (['driver_lat', 'driver_lng', 'driver_location_updated_at'] as $col) {
                if (Schema::hasColumn('trips', $col)) {
                    $cols[] = $col;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
