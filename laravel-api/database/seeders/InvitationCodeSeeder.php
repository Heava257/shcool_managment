<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InvitationCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('invitation_codes')->insert([
            [
                'code' => 'TEACHER2026',
                'role' => 'teacher',
                'usage_limit' => 100,
                'used_count' => 0,
                'expires_at' => '2026-12-31 23:59:59',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'STUDENT2026',
                'role' => 'student',
                'usage_limit' => 1000,
                'used_count' => 0,
                'expires_at' => '2026-12-31 23:59:59',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'GUEST_PASS',
                'role' => 'student',
                'usage_limit' => 50,
                'used_count' => 0,
                'expires_at' => null, // Never expires
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
