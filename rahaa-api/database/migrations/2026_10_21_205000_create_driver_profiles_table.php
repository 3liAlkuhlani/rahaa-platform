<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('vehicle_type')->default('comfort'); // 'economy', 'comfort', 'vip', 'family'
            $table->string('vehicle_plate')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_color')->nullable();
            $table->string('license_photo')->nullable();
            $table->string('selfie_photo')->nullable();
            $table->string('car_front_photo')->nullable();
            $table->string('car_back_photo')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('total_trips')->default(0);
            $table->decimal('wallet_balance', 10, 2)->default(0.00);
            $table->boolean('is_online')->default(false);
            $table->double('current_lat', 10, 7)->nullable();
            $table->double('current_lng', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_profiles');
    }
};
