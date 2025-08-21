<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('device_hash')->unique(); // Unique device fingerprint
            $table->string('device_name')->nullable(); // Human readable device name
            $table->string('user_agent'); // Browser/device info
            $table->string('ip_address', 45); // IPv4/IPv6 support
            $table->string('platform')->nullable(); // Windows, macOS, Android, etc.
            $table->string('browser')->nullable(); // Chrome, Firefox, etc.
            $table->boolean('is_trusted')->default(false); // Whether device is verified
            $table->timestamp('first_used_at')->nullable(); // When device was first detected
            $table->timestamp('last_used_at')->nullable(); // Last login from this device
            $table->string('verification_token')->nullable(); // For email verification
            $table->timestamp('verified_at')->nullable(); // When device was verified
            $table->timestamps();

            $table->index(['user_id', 'device_hash']);
            $table->index(['user_id', 'is_trusted']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
