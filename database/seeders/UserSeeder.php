<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Captain Account
        User::create([
            'name' => 'Maristela T. Ubalde',
            'email' => 'captain@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639171234567',
            'role' => 'captain',
            'status' => 'approved',
            'is_active' => true,
        ]);

        // Secretary Account
        User::create([
            'name' => 'Maria Clara Santos',
            'email' => 'secretary@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639172345678',
            'role' => 'secretary',
            'status' => 'approved',
            'is_active' => true,
        ]);

        // Resident 1 — Approved (Purok 1)
        User::create([
            'name' => 'Juan Andres Dela Cruz',
            'email' => 'resident@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639173456789',
            'role' => 'resident',
            'status' => 'approved',
            'is_active' => true,
            'purok_id' => 1,
            'first_name' => 'Juan Andres',
            'middle_name' => 'Bautista',
            'last_name' => 'Dela Cruz',
            'place_of_birth' => 'Virac, Catanduanes',
            'date_of_birth' => '1995-06-15',
            'age' => 30,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'citizenship' => 'Filipino',
            'occupation' => 'Teacher',
        ]);

        // Resident 2 — Approved (Purok 3)
        User::create([
            'name' => 'Ana Marie Reyes',
            'email' => 'resident2@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639269876543',
            'role' => 'resident',
            'status' => 'approved',
            'is_active' => true,
            'purok_id' => 3,
            'first_name' => 'Ana Marie',
            'middle_name' => 'Garcia',
            'last_name' => 'Reyes',
            'place_of_birth' => 'Virac, Catanduanes',
            'date_of_birth' => '1990-03-22',
            'age' => 35,
            'sex' => 'Female',
            'civil_status' => 'Married',
            'citizenship' => 'Filipino',
            'occupation' => 'Nurse',
        ]);

        // Resident 3 — Pending (Purok 5) — shows approval workflow
        User::create([
            'name' => 'Pedro Ramos',
            'email' => 'resident3@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639365432198',
            'role' => 'resident',
            'status' => 'pending',
            'is_active' => true,
            'purok_id' => 5,
            'first_name' => 'Pedro',
            'middle_name' => 'Lim',
            'last_name' => 'Ramos',
            'place_of_birth' => 'San Andres, Catanduanes',
            'date_of_birth' => '1998-11-08',
            'age' => 27,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'citizenship' => 'Filipino',
            'occupation' => 'Fisherman',
        ]);

        // Resident 4 — Approved (Purok 2)
        User::create([
            'name' => 'Maricel Villanueva',
            'email' => 'resident4@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639557891234',
            'role' => 'resident',
            'status' => 'approved',
            'is_active' => true,
            'purok_id' => 2,
            'first_name' => 'Maricel',
            'middle_name' => 'Torres',
            'last_name' => 'Villanueva',
            'place_of_birth' => 'Virac, Catanduanes',
            'date_of_birth' => '1988-07-30',
            'age' => 37,
            'sex' => 'Female',
            'civil_status' => 'Married',
            'citizenship' => 'Filipino',
            'occupation' => 'Vendor',
        ]);

        // Resident 5 — Approved (Purok 6)
        User::create([
            'name' => 'Carlos Miguel Fernandez',
            'email' => 'resident5@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639051237890',
            'role' => 'resident',
            'status' => 'approved',
            'is_active' => true,
            'purok_id' => 6,
            'first_name' => 'Carlos Miguel',
            'middle_name' => 'Santos',
            'last_name' => 'Fernandez',
            'place_of_birth' => 'Bato, Catanduanes',
            'date_of_birth' => '2000-01-12',
            'age' => 26,
            'sex' => 'Male',
            'civil_status' => 'Single',
            'citizenship' => 'Filipino',
            'occupation' => 'Student',
        ]);

        // Partner Agency 1 — Approved (DOH)
        User::create([
            'name' => 'Department of Health - Bicol Region',
            'email' => 'partner@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639176789012',
            'role' => 'partner_agency',
            'status' => 'approved',
            'is_active' => true,
            'agency_name' => 'Department of Health - Bicol Region',
            'representative_first_name' => 'Roberto',
            'representative_last_name' => 'Mendoza',
            'agency_address' => 'Rizal Street, Virac, Catanduanes',
        ]);

        // Partner Agency 2 — Pending (Red Cross)
        User::create([
            'name' => 'Philippine Red Cross - Catanduanes Chapter',
            'email' => 'partner2@gmail.com',
            'password' => bcrypt('password123'),
            'phone' => '639277890123',
            'role' => 'partner_agency',
            'status' => 'pending',
            'is_active' => true,
            'agency_name' => 'Philippine Red Cross - Catanduanes Chapter',
            'representative_first_name' => 'Elena',
            'representative_last_name' => 'Villanueva',
            'agency_address' => 'San Juan Street, Virac, Catanduanes',
        ]);
    }
}
