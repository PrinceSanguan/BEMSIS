<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('partner_feedback_link')->nullable()->after('has_certificate');
            $table->string('partner_certificate_path')->nullable()->after('partner_feedback_link');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['partner_feedback_link', 'partner_certificate_path']);
        });
    }
};
