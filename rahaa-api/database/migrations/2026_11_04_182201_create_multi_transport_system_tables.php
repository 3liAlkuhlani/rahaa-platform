<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Service Types Table (taxi, rental, truck, motorcycle)
        Schema::create('service_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // 'taxi', 'rental', 'truck', 'motorcycle'
            $table->string('name_ar');
            $table->string('name_en');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('base_fare', 8, 2)->default(500.00);
            $table->decimal('per_km_rate', 8, 2)->default(150.00);
            $table->timestamps();
        });

        // 2. Driver Services (Associates driver with approved services)
        Schema::create('driver_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('service_type'); // 'taxi', 'rental', 'truck', 'motorcycle'
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'service_type']);
        });

        // 3. Vehicles Table (Covers Rental cars, Taxis, Trucks, Motorcycles)
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('service_type'); // 'taxi', 'rental', 'truck', 'motorcycle'
            $table->string('make'); // e.g. Toyota, Hyundai, Isuzu
            $table->string('model'); // e.g. Corolla, Tucson, Elf
            $table->integer('year');
            $table->string('color')->nullable();
            $table->string('plate_number')->unique();
            $table->string('category')->nullable(); // For truck: 'small', 'medium', 'heavy', 'furniture', 'building'. For rental: 'sedan', 'suv', 'luxury'
            $table->integer('seats')->default(4);
            $table->string('fuel_type')->default('petrol'); // petrol, diesel, hybrid, electric
            $table->string('transmission')->default('automatic'); // automatic, manual
            $table->decimal('max_payload_kg', 8, 2)->nullable(); // For trucks
            $table->decimal('daily_rate', 10, 2)->nullable(); // For rentals
            $table->decimal('hourly_rate', 10, 2)->nullable(); // For rentals
            $table->boolean('with_driver_available')->default(false); // For rentals
            $table->boolean('self_drive_available')->default(true); // For rentals
            $table->string('location_name')->nullable();
            $table->double('location_lat', 10, 7)->nullable();
            $table->double('location_lng', 10, 7)->nullable();
            $table->json('images')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'paused'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_available')->default(true);
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->timestamps();
        });

        // 4. Vehicle & Driver Verification Documents
        Schema::create('verification_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->string('service_type'); // 'taxi', 'rental', 'truck', 'motorcycle'
            $table->string('document_type'); // 'id_card', 'driving_license', 'vehicle_registration', 'insurance', 'delegation', 'inspection'
            $table->string('file_path');
            $table->date('expires_at')->nullable();
            $table->enum('status', ['under_review', 'approved', 'rejected'])->default('under_review');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Rental Bookings Table
        Schema::create('rental_bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique();
            $table->foreignId('renter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('pickup_time')->nullable();
            $table->string('return_time')->nullable();
            $table->enum('rental_mode', ['self_drive', 'with_driver'])->default('self_drive');
            $table->decimal('total_amount', 10, 2);
            $table->string('payment_method')->default('wallet');
            $table->enum('status', ['pending', 'accepted', 'active', 'completed', 'cancelled', 'rejected'])->default('pending');
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();
        });

        // 6. Transport / Cargo & Motorcycle Requests Table
        Schema::create('cargo_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('service_type'); // 'truck', 'motorcycle'
            $table->string('sub_service')->default('cargo'); // 'cargo', 'delivery', 'passenger'
            $table->string('pickup_location');
            $table->double('pickup_lat', 10, 7)->nullable();
            $table->double('pickup_lng', 10, 7)->nullable();
            $table->string('delivery_location');
            $table->double('delivery_lat', 10, 7)->nullable();
            $table->double('delivery_lng', 10, 7)->nullable();
            $table->string('cargo_type')->nullable(); // 'furniture', 'boxes', 'construction', 'electronics', 'food'
            $table->text('cargo_description')->nullable();
            $table->decimal('weight_kg', 8, 2)->nullable();
            $table->string('volume_size')->nullable(); // 'small', 'medium', 'large'
            $table->string('required_truck_type')->nullable(); // 'small', 'medium', 'heavy', 'closed', 'open', 'furniture', 'building'
            $table->json('cargo_images')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->decimal('estimated_fare', 8, 2);
            $table->string('payment_method')->default('cash');
            $table->enum('status', [
                'pending',
                'accepted',
                'loading',
                'in_transit',
                'delivered',
                'cancelled'
            ])->default('pending');
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();
        });

        // 7. Add service_type to existing trips table if not present
        if (!Schema::hasColumn('trips', 'service_type')) {
            Schema::table('trips', function (Blueprint $table) {
                $table->string('service_type')->default('taxi')->after('trip_number');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('trips', 'service_type')) {
            Schema::table('trips', function (Blueprint $table) {
                $table->dropColumn('service_type');
            });
        }
        Schema::dropIfExists('cargo_requests');
        Schema::dropIfExists('rental_bookings');
        Schema::dropIfExists('verification_documents');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('driver_services');
        Schema::dropIfExists('service_types');
    }
};
