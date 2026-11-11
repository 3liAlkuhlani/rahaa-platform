<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->string('trip_number')->unique();
            $table->foreignId('passenger_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('pickup_name');
            $table->string('dropoff_name');
            $table->double('pickup_lat', 10, 7)->nullable();
            $table->double('pickup_lng', 10, 7)->nullable();
            $table->double('dropoff_lat', 10, 7)->nullable();
            $table->double('dropoff_lng', 10, 7)->nullable();
            $table->string('vehicle_type')->default('comfort'); // 'economy', 'comfort', 'vip', 'family'
            $table->decimal('fare', 8, 2);
            $table->string('payment_method')->default('wallet'); // 'wallet', 'cash', 'card'
            $table->enum('status', [
                'requested',     // Created by passenger, waiting for driver
                'accepted',      // Driver accepted the trip
                'arrived',       // Driver arrived at pickup
                'in_progress',   // Trip started
                'completed',     // Trip ended
                'cancelled'      // Cancelled by passenger or driver
            ])->default('requested');
            $table->string('cancellation_reason')->nullable();
            $table->string('cancelled_by')->nullable(); // 'passenger', 'driver', 'admin'
            $table->decimal('passenger_rating', 2, 1)->nullable();
            $table->decimal('driver_rating', 2, 1)->nullable();
            $table->text('review')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
