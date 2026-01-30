<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'description' => 'Electronic devices and accessories', 'status' => true, 'parent_id' => 0],
            ['name' => 'Clothing', 'description' => 'Apparel and fashion items', 'status' => true, 'parent_id' => 0],
            ['name' => 'Food', 'description' => 'Food and beverages', 'status' => true, 'parent_id' => 0],
            ['name' => 'Books', 'description' => 'Books and publications', 'status' => true, 'parent_id' => 0],
            ['name' => 'Furniture', 'description' => 'Home and office furniture', 'status' => true, 'parent_id' => 0],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
