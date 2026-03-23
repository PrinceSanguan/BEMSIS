<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PurokSeeder::class,
            UserSeeder::class,
            EventSeeder::class,
            AttendanceSeeder::class,
            FeedbackSeeder::class,
            AnnouncementSeeder::class,
        ]);
    }
}
