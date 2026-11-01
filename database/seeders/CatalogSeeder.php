<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Program;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (File::json(resource_path('data/products.json')) as $position => $item) {
                Product::firstOrCreate(['slug' => $item['slug']], [
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'supplement_type' => $item['supplementType'] ?? null,
                    'position' => $position,
                    'content' => $item,
                ]);
            }

            foreach (File::json(resource_path('data/programs.json')) as $position => $item) {
                Program::firstOrCreate(['slug' => $item['slug']], [
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'position' => $position,
                    'content' => $item,
                ]);
            }
        });
    }
}
