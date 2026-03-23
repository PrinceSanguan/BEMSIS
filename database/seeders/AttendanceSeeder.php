<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $cleanUp = Event::where('title', 'Barangay Clean-Up Drive')->first();
        $medical = Event::where('title', 'Libreng Medical Mission')->first();

        $residents = User::where('role', 'resident')
            ->where('status', 'approved')
            ->get();

        // Attendance for Clean-Up Drive (all approved residents attended)
        foreach ($residents as $index => $resident) {
            $minutesLate = $index * 8; // stagger arrivals
            $timeIn = $cleanUp->start_date->copy()->addMinutes($minutesLate);
            $isLate = $minutesLate > 15;

            Attendance::create([
                'event_id' => $cleanUp->id,
                'user_id' => $resident->id,
                'status' => 'confirmed',
                'qr_code' => 'QR-' . $cleanUp->id . '-' . $resident->id . '-' . Str::upper(Str::random(8)),
                'time_in' => $timeIn,
                'time_in_label' => $isLate ? 'Late' : 'On Time',
                'time_out' => $index < 3 ? $cleanUp->end_date->copy()->subMinutes($index * 5) : null,
                'time_out_label' => $index < 3 ? 'Completed' : null,
            ]);
        }

        // Attendance for Medical Mission (first 3 residents — event targets Puroks 1-3)
        $eligibleResidents = $residents->filter(fn ($r) => in_array($r->purok_id, [1, 2, 3]));

        foreach ($eligibleResidents as $index => $resident) {
            $minutesLate = $index * 12;
            $timeIn = $medical->start_date->copy()->addMinutes($minutesLate);

            Attendance::create([
                'event_id' => $medical->id,
                'user_id' => $resident->id,
                'status' => 'confirmed',
                'qr_code' => 'QR-' . $medical->id . '-' . $resident->id . '-' . Str::upper(Str::random(8)),
                'time_in' => $timeIn,
                'time_in_label' => $minutesLate > 15 ? 'Late' : 'On Time',
                'time_out' => $medical->end_date->copy()->subMinutes($index * 10),
                'time_out_label' => 'Completed',
            ]);
        }
    }
}
