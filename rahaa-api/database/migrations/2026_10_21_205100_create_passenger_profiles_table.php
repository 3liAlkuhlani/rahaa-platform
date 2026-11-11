<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('passenger_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('wallet_balance', 10, 2)->default(0.00); // محفظة جيب
            $table->integer('total_trips')->default(0);
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->json('saved_places')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passenger_profiles');
    }
};
