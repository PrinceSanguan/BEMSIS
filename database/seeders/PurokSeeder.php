<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Purok;

class PurokSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $puroks = [
            'Purok 1',
            'Purok 2',
            'Purok 3',
            'Purok 4',
            'Purok 5',
            'Purok 6',
            'Purok 7',
        ];

        foreach ($puroks as $purok) {
            Purok::create(['name' => $purok]);
        }
    }
}
