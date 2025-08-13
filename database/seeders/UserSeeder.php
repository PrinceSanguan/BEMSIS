<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Secretary Account
        User::create([
            'name' => 'Secretary',
            'email' => 'secretary@gmail.com',
            'password' => bcrypt('password123'),
            'role' => 'secretary',
            'phone' => '09123456789',
            'status' => 'approved',
        ]);

        // Create Captain Account  
        User::create([
            'name' => 'Captain',
            'email' => 'captain@gmail.com',
            'password' => bcrypt('password123'),
            'role' => 'captain',
            'phone' => '09987654321',
            'status' => 'approved',
        ]);
    }
}
