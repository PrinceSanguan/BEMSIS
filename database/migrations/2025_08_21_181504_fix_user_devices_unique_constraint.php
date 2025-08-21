<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_devices', function (Blueprint $table) {
            // Drop the existing unique constraint on device_hash
            $table->dropUnique(['device_hash']);

            // Add composite unique constraint on user_id and device_hash
            $table->unique(['user_id', 'device_hash'], 'user_devices_user_device_unique');
        });
    }

    public function down(): void
    {
        Schema::table('user_devices', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('user_devices_user_device_unique');

            // Restore the original unique constraint on device_hash
            $table->unique('device_hash');
        });
    }
};
