<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Apple', 'code' => 'APL', 'from_country' => 'USA', 'status' => 'active'],
            ['name' => 'Samsung', 'code' => 'SSG', 'from_country' => 'Korea', 'status' => 'active'],
            ['name' => 'Nike', 'code' => 'NIK', 'from_country' => 'USA', 'status' => 'active'],
            ['name' => 'Sony', 'code' => 'SNY', 'from_country' => 'Japan', 'status' => 'active'],
            ['name' => 'Dell', 'code' => 'DELL', 'from_country' => 'USA', 'status' => 'active'],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
