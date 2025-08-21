<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Common fields (keep existing: name, email, phone, password, role, status, purok_id)

            // Resident-specific fields
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('extension')->nullable(); // Jr., Sr., III, IV
            $table->string('place_of_birth')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->integer('age')->nullable();
            $table->enum('sex', ['Male', 'Female'])->nullable();
            $table->string('civil_status')->nullable();
            $table->string('citizenship')->nullable();
            $table->string('occupation')->nullable();
            $table->text('special_notes')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('valid_id_path')->nullable();

            // Partner Agency-specific fields
            $table->string('agency_name')->nullable();
            $table->string('representative_first_name')->nullable();
            $table->string('representative_last_name')->nullable();
            $table->string('agency_address')->nullable();
            $table->string('agency_contact_number')->nullable();
            $table->string('agency_valid_id_path')->nullable();
            $table->string('agency_endorsement_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'middle_name',
                'last_name',
                'extension',
                'place_of_birth',
                'date_of_birth',
                'age',
                'sex',
                'civil_status',
                'citizenship',
                'occupation',
                'special_notes',
                'contact_number',
                'valid_id_path',
                'agency_name',
                'representative_first_name',
                'representative_last_name',
                'agency_address',
                'agency_contact_number',
                'agency_valid_id_path',
                'agency_endorsement_path'
            ]);
        });
    }
};
