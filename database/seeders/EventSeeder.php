<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $secretary = User::where('email', 'secretary@gmail.com')->first();
        $partner = User::where('email', 'partner@gmail.com')->first();

        // Past Event 1 — Approved, completed, with certificates
        Event::create([
            'created_by' => $secretary->id,
            'title' => 'Barangay Clean-Up Drive',
            'description' => 'Community-wide clean-up activity to maintain cleanliness and orderliness in our barangay. All residents are encouraged to participate and bring their own cleaning materials. Refreshments will be provided.',
            'venue' => 'Barangay Hall Grounds',
            'purok_ids' => [1, 2, 3, 4, 5, 6, 7],
            'target_all_residents' => true,
            'start_date' => Carbon::now()->subWeeks(2)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->subWeeks(2)->setHour(11)->setMinute(0),
            'has_certificate' => true,
            'status' => 'approved',
        ]);

        // Past Event 2 — Approved, completed, partner-created
        Event::create([
            'created_by' => $partner->id,
            'title' => 'Libreng Medical Mission',
            'description' => 'Free medical check-up, consultation, and medicine distribution in partnership with the Department of Health. Services include blood pressure monitoring, blood sugar testing, and basic dental check-up.',
            'venue' => 'Barangay Health Center',
            'purok_ids' => [1, 2, 3],
            'target_all_residents' => false,
            'start_date' => Carbon::now()->subWeek()->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->subWeek()->setHour(14)->setMinute(0),
            'has_certificate' => false,
            'status' => 'approved',
        ]);

        // Upcoming Event 1 — Approved
        Event::create([
            'created_by' => $secretary->id,
            'title' => 'Palarong Barangay 2026',
            'description' => 'Annual youth sports festival featuring basketball, volleyball, and relay races. Open to all residents aged 15 and above. Registration is free. Prizes await the winners!',
            'venue' => 'Barangay Covered Court',
            'purok_ids' => [1, 2, 3, 4, 5, 6, 7],
            'target_all_residents' => true,
            'start_date' => Carbon::now()->addWeek()->setHour(6)->setMinute(0),
            'end_date' => Carbon::now()->addWeek()->setHour(17)->setMinute(0),
            'has_certificate' => true,
            'status' => 'approved',
        ]);

        // Upcoming Event 2 — Pending approval
        Event::create([
            'created_by' => $secretary->id,
            'title' => 'Tree Planting Activity',
            'description' => 'Environmental awareness tree planting along the barangay riverside area. Seedlings will be provided. Please wear appropriate clothing and footwear.',
            'venue' => 'Barangay Riverside Area',
            'purok_ids' => [4, 5, 6],
            'target_all_residents' => false,
            'start_date' => Carbon::now()->addWeeks(2)->setHour(7)->setMinute(0),
            'end_date' => Carbon::now()->addWeeks(2)->setHour(11)->setMinute(0),
            'has_certificate' => false,
            'status' => 'pending',
        ]);

        // Upcoming Event 3 — Approved, partner-created
        Event::create([
            'created_by' => $partner->id,
            'title' => 'Basic First Aid and CPR Training',
            'description' => 'Learn essential life-saving skills including CPR, wound care, and emergency response. Conducted by certified trainers from the Department of Health. Certificate of completion will be awarded.',
            'venue' => 'Barangay Multi-Purpose Hall',
            'purok_ids' => [1, 2, 3, 4, 5, 6, 7],
            'target_all_residents' => true,
            'start_date' => Carbon::now()->addWeeks(3)->setHour(8)->setMinute(0),
            'end_date' => Carbon::now()->addWeeks(3)->setHour(16)->setMinute(0),
            'has_certificate' => true,
            'status' => 'approved',
        ]);

        // Declined Event — shows workflow
        Event::create([
            'created_by' => $secretary->id,
            'title' => 'Supplemental Feeding Program',
            'description' => 'Nutrition program for children aged 2-5 years old in coordination with the municipal nutrition office.',
            'venue' => 'Barangay Day Care Center',
            'purok_ids' => [1, 2, 3],
            'target_all_residents' => false,
            'start_date' => Carbon::now()->addWeeks(2)->setHour(9)->setMinute(0),
            'end_date' => Carbon::now()->addWeeks(2)->setHour(12)->setMinute(0),
            'has_certificate' => false,
            'status' => 'declined',
        ]);
    }
}
