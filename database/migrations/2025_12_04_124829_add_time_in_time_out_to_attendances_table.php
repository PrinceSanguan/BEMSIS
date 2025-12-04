<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Drop old scanned column
            $table->dropColumn('scanned');

            // Add new time-in/time-out tracking
            $table->timestamp('time_in')->nullable()->after('qr_code');
            $table->enum('time_in_label', ['On-Time', 'Late'])->nullable()->after('time_in');
            $table->timestamp('time_out')->nullable()->after('time_in_label');
            $table->enum('time_out_label', ['Completed', 'Not Completed'])->nullable()->after('time_out');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['time_in', 'time_in_label', 'time_out', 'time_out_label']);
            $table->boolean('scanned')->default(false)->after('qr_code');
        });
    }
};
