<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');

            Schema::create('users_new', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('username')->nullable()->unique();
                $table->string('phone')->nullable()->unique();
                $table->string('email')->nullable()->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->timestamp('phone_verified_at')->nullable();
                $table->string('password');
                $table->enum('role', ['admin', 'supervisor', 'passenger', 'driver'])->default('passenger');
                $table->json('permissions')->nullable();
                $table->enum('status', ['active', 'pending', 'rejected', 'banned'])->default('active');
                $table->string('avatar')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });

            DB::statement('
                INSERT INTO users_new (id, name, username, phone, email, email_verified_at, phone_verified_at, password, role, status, avatar, remember_token, created_at, updated_at)
                SELECT id, name, username, phone, email, email_verified_at, phone_verified_at, password, role, status, avatar, remember_token, created_at, updated_at
                FROM users
            ');

            Schema::drop('users');
            Schema::rename('users_new', 'users');

            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role', 30)->default('passenger')->change();
                $table->json('permissions')->nullable()->after('role');
            });
        }

        if (!Schema::hasTable('complaints')) {
            Schema::create('complaints', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('trip_id')->nullable()->constrained('trips')->nullOnDelete();
                $table->string('subject');
                $table->text('description');
                $table->enum('category', ['trip', 'driver', 'passenger', 'payment', 'vehicle', 'app', 'other'])->default('other');
                $table->enum('status', ['open', 'in_review', 'resolved', 'dismissed'])->default('open');
                $table->text('supervisor_notes')->nullable();
                $table->text('action_taken')->nullable();
                $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('resolved_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');

        if (DB::getDriverName() !== 'sqlite' && Schema::hasColumn('users', 'permissions')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('permissions');
            });
        }
    }
};
