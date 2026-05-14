<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (DB::table('rooms')->exists()) return;

        $rooms = [
            [
                'name' => 'Suite Andalouse', 'slug' => 'suite-andalouse', 'category' => 'suite',
                'size' => '45 m²', 'price_per_night' => 1800,
                'description' => 'Spacious Andalusian-style suite with carved cedar ceilings and a private terrace.',
                'max_guests' => 3, 'inventory_count' => 2,
            ],
            [
                'name' => 'Chambre Médina', 'slug' => 'chambre-medina', 'category' => 'standard',
                'size' => '25 m²', 'price_per_night' => 950,
                'description' => 'Cosy room overlooking the inner courtyard, with traditional zellige tilework.',
                'max_guests' => 2, 'inventory_count' => 4,
            ],
            [
                'name' => 'Suite Royale', 'slug' => 'suite-royale', 'category' => 'royal',
                'size' => '60 m²', 'price_per_night' => 2800,
                'description' => 'The signature royal suite — fireplace, hammam access, panoramic Fes view.',
                'max_guests' => 4, 'inventory_count' => 1,
            ],
        ];

        foreach ($rooms as $r) {
            DB::table('rooms')->insert(array_merge($r, [
                'id' => (string) Str::uuid(),
                'amenities' => json_encode(['WiFi','Air conditioning','Hammam access','Breakfast included']),
                'images' => json_encode([]),
                'is_available' => true,
                'group_discount_threshold' => 5,
                'group_discount_percent' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}