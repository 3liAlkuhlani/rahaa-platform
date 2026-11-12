<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('driver_request_rejections')) {
            Schema::create('driver_request_rejections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('driver_id')->constrained('users')->cascadeOnDelete();
                $table->string('request_type', 20); // 'trip', 'cargo', 'rental'
                $table->unsignedBigInteger('request_id');
                $table->string('reason')->nullable();
                $table->timestamps();

                $table->unique(['driver_id', 'request_type', 'request_id'], 'driver_req_reject_unique');
                $table->index(['request_type', 'request_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_request_rejections');
    }
};

