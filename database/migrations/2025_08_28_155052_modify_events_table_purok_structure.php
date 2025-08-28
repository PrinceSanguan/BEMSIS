<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyEventsTablePurokStructure extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['purok_id']);
            // Drop the purok_id column
            $table->dropColumn('purok_id');
            // Add the new purok_ids JSON column
            $table->json('purok_ids')->nullable()->after('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Remove the JSON column
            $table->dropColumn('purok_ids');
            // Add back the single purok_id column
            $table->unsignedBigInteger('purok_id')->nullable()->after('created_by');
            // Re-add the foreign key constraint
            $table->foreign('purok_id')->references('id')->on('puroks');
        });
    }
}
