<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add guarantee_amount & security_deposit to vehicles table if not present
        if (!Schema::hasColumn('vehicles', 'security_deposit')) {
            Schema::table('vehicles', function (Blueprint $table) {
                $table->decimal('security_deposit', 10, 2)->default(50000.00)->after('daily_rate');
                $table->string('guarantee_type_allowed')->default('cash_gold_weapon')->after('security_deposit'); // 'cash', 'cash_gold', 'cash_gold_weapon'
            });
        }

        // 2. Renter Verifications Table (Personal Photo, ID Front/Back, Driving License Front/Back)
        if (!Schema::hasTable('renter_verifications')) {
            Schema::create('renter_verifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
                $table->string('personal_photo')->nullable();
                $table->string('id_card_front')->nullable();
                $table->string('id_card_back')->nullable();
                $table->string('driving_license_front')->nullable();
                $table->string('driving_license_back')->nullable();
                $table->date('id_expires_at')->nullable();
                $table->date('license_expires_at')->nullable();
                $table->enum('status', ['not_submitted', 'under_review', 'approved', 'rejected', 'expired'])->default('not_submitted');
                $table->text('rejection_reason')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamps();
            });
        }

        // 3. Rental Guarantees Table (Cash, Gold, Weapon - handled with official inspection records)
        if (!Schema::hasTable('rental_guarantees')) {
            Schema::create('rental_guarantees', function (Blueprint $table) {
                $table->id();
                $table->string('guarantee_receipt_number')->unique();
                $table->foreignId('booking_id')->constrained('rental_bookings')->cascadeOnDelete();
                $table->foreignId('renter_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
                $table->enum('guarantee_type', ['cash', 'gold', 'weapon'])->default('cash');
                $table->decimal('estimated_value', 10, 2);
                $table->text('item_description')->nullable(); // For gold: weight, karat. For weapon: type, serial number, license permit number
                $table->string('legal_license_number')->nullable(); // For weapon legal permits
                $table->json('item_photos')->nullable();
                $table->enum('status', [
                    'pending',
                    'awaiting_handover',
                    'received',
                    'under_inspection',
                    'returned',
                    'disputed',
                    'partially_refunded'
                ])->default('pending');
                $table->text('inspection_notes')->nullable();
                $table->timestamp('received_at')->nullable();
                $table->timestamp('returned_at')->nullable();
                $table->string('received_by_signature')->nullable();
                $table->string('returned_to_signature')->nullable();
                $table->timestamps();
            });
        }

        // 4. Vehicle Handover & Return Inspection Records (Photos before & after, mileage, fuel)
        if (!Schema::hasTable('vehicle_handover_records')) {
            Schema::create('vehicle_handover_records', function (Blueprint $table) {
                $table->id();
                $table->foreignId('booking_id')->constrained('rental_bookings')->cascadeOnDelete();
                $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
                $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('renter_id')->constrained('users')->cascadeOnDelete();
                $table->enum('record_type', ['delivery', 'return']); // delivery (start) or return (end)
                $table->integer('odometer_km')->nullable();
                $table->string('fuel_level')->default('full'); // 'empty', 'quarter', 'half', 'three_quarters', 'full'
                $table->json('vehicle_condition_photos')->nullable();
                $table->text('condition_notes')->nullable();
                $table->boolean('keys_handed_over')->default(true);
                $table->decimal('extra_charges', 8, 2)->default(0.00);
                $table->string('extra_charges_reason')->nullable();
                $table->boolean('both_parties_confirmed')->default(true);
                $table->timestamps();
            });
        }

        // 5. Add rating and review columns to rental_bookings and cargo_requests if not present
        if (!Schema::hasColumn('rental_bookings', 'renter_rating')) {
            Schema::table('rental_bookings', function (Blueprint $table) {
                $table->decimal('renter_rating', 2, 1)->nullable();
                $table->text('renter_review')->nullable();
            });
        }

        if (!Schema::hasColumn('cargo_requests', 'sender_rating')) {
            Schema::table('cargo_requests', function (Blueprint $table) {
                $table->decimal('sender_rating', 2, 1)->nullable();
                $table->text('sender_review')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_handover_records');
        Schema::dropIfExists('rental_guarantees');
        Schema::dropIfExists('renter_verifications');
    }
};
