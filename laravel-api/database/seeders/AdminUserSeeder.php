<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get Super Admin role ID
        $superAdminRole = DB::table('roles')->where('code', 'super_admin')->first();
        
        if (!$superAdminRole) {
            $this->command->error('Super Admin role not found. Please run RoleSeeder first.');
            return;
        }

        // Create admin user
        $userId = DB::table('users')->insertGetId([
            'name' => 'Super Admin',
            'email' => 'admin@school.com',
            'password' => Hash::make('password123'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Assign Super Admin role to user
        DB::table('user_role')->insert([
            'user_id' => $userId,
            'role_id' => $superAdminRole->id,
        ]);

        // Create Academic Admin user
        $academicAdminRole = DB::table('roles')->where('code', 'academic_admin')->first();
        
        if ($academicAdminRole) {
            $academicUserId = DB::table('users')->insertGetId([
                'name' => 'Academic Admin',
                'email' => 'academic@school.com',
                'password' => Hash::make('password123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_role')->insert([
                'user_id' => $academicUserId,
                'role_id' => $academicAdminRole->id,
            ]);
        }

        $this->command->info('Admin users created successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Super Admin: admin@school.com / password123');
        $this->command->info('Academic Admin: academic@school.com / password123');
    }
}
