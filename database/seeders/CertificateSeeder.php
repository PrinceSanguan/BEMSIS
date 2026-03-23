<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        // Assign certificates for the Clean-Up Drive (has_certificate = true)
        $cleanUp = Event::where('title', 'Barangay Clean-Up Drive')->first();

        // Get attendees who completed (have time_out)
        $completedAttendees = Attendance::where('event_id', $cleanUp->id)
            ->whereNotNull('time_out')
            ->get();

        foreach ($completedAttendees as $attendance) {
            Certificate::create([
                'event_id' => $cleanUp->id,
                'user_id' => $attendance->user_id,
                'certificate_code' => 'CERT-' . Str::upper(Str::random(10)),
                'file_path' => 'certificates/' . $cleanUp->id . '_' . $attendance->user_id . '.pdf',
            ]);
        }
    }
}
