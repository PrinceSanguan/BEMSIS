<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $secretary = User::where('email', 'secretary@gmail.com')->first();

        Announcement::create([
            'created_by' => $secretary->id,
            'title' => 'Scheduled Water Interruption Notice',
            'content' => 'Please be advised that there will be a scheduled water interruption on April 5, 2026 from 8:00 AM to 5:00 PM due to maintenance work by the local water district. Residents are advised to store enough water for the day. Thank you for your understanding.',
            'target_all_puroks' => true,
            'target_puroks' => [1, 2, 3, 4, 5, 6, 7],
        ]);

        Announcement::create([
            'created_by' => $secretary->id,
            'title' => 'Barangay ID Distribution Schedule',
            'content' => 'Residents of Purok 1, 2, and 3 may claim their Barangay IDs at the Barangay Hall from March 25 to March 28, 2026. Please bring one valid government ID for verification. Distribution hours: 8:00 AM to 4:00 PM.',
            'target_all_puroks' => false,
            'target_puroks' => [1, 2, 3],
        ]);

        Announcement::create([
            'created_by' => $secretary->id,
            'title' => 'Reminder: Proper Waste Segregation',
            'content' => 'All residents are reminded to follow the proper waste segregation schedule: Biodegradable (Monday, Wednesday, Friday), Non-Biodegradable (Tuesday, Thursday), and Recyclables (Saturday). Let us keep our barangay clean and green. Violators may face penalties as per Barangay Ordinance No. 2025-003.',
            'target_all_puroks' => true,
            'target_puroks' => [1, 2, 3, 4, 5, 6, 7],
        ]);
    }
}
