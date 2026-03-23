<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Database\Seeder;

class FeedbackSeeder extends Seeder
{
    public function run(): void
    {
        $cleanUp = Event::where('title', 'Barangay Clean-Up Drive')->first();
        $medical = Event::where('title', 'Libreng Medical Mission')->first();

        $resident1 = User::where('email', 'resident@gmail.com')->first();
        $resident2 = User::where('email', 'resident2@gmail.com')->first();
        $resident4 = User::where('email', 'resident4@gmail.com')->first();
        $resident5 = User::where('email', 'resident5@gmail.com')->first();

        // Feedback for Clean-Up Drive
        Feedback::create([
            'event_id' => $cleanUp->id,
            'user_id' => $resident1->id,
            'comments' => 'Maganda po yung event! Well-organized and very productive. Napakaganda ng naging resulta ng clean-up. Sana po magkaroon ulit.',
            'rating' => 5,
        ]);

        Feedback::create([
            'event_id' => $cleanUp->id,
            'user_id' => $resident4->id,
            'comments' => 'Okay naman po, kaso medyo late ang start. Sana po next time mas on time para hindi mahaba ang paghihintay.',
            'rating' => 3,
        ]);

        Feedback::create([
            'event_id' => $cleanUp->id,
            'user_id' => $resident5->id,
            'comments' => 'Nakakatuwa po kasi maraming sumali. Ang ganda ng teamwork ng mga tao sa barangay. Highly recommend po sa ibang events!',
            'rating' => 5,
        ]);

        // Feedback for Medical Mission
        Feedback::create([
            'event_id' => $medical->id,
            'user_id' => $resident1->id,
            'comments' => 'Salamat po sa libreng check-up! Very accommodating ang mga volunteers at doctors. Napakalaking tulong po nito sa aming komunidad.',
            'rating' => 5,
        ]);

        Feedback::create([
            'event_id' => $medical->id,
            'user_id' => $resident2->id,
            'comments' => 'Very helpful po ang medical mission. Sana po mas maraming gamot next time kasi naubusan po kami. Overall, maganda pa rin po.',
            'rating' => 4,
        ]);
    }
}
