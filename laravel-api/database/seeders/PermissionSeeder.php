<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Student Management Permissions
            [
                'name' => 'view-students',
                'group' => 'students',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'create-students',
                'group' => 'students',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'edit-students',
                'group' => 'students',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'delete-students',
                'group' => 'students',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'student-management',
                'group' => 'students',
                'is_menu_web' => true,
                'web_route_key' => 'admin.students',
            ],
            [
                'name' => 'student-registration',
                'group' => 'students',
                'is_menu_web' => true,
                'web_route_key' => 'admin.students.register',
            ],

            // Subject Management Permissions
            [
                'name' => 'view-subjects',
                'group' => 'subjects',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'create-subjects',
                'group' => 'subjects',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'edit-subjects',
                'group' => 'subjects',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'delete-subjects',
                'group' => 'subjects',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'subject-management',
                'group' => 'subjects',
                'is_menu_web' => true,
                'web_route_key' => 'admin.subjects',
            ],

            // Academic Module Menu
            [
                'name' => 'academic-module',
                'group' => 'academic',
                'is_menu_web' => true,
                'web_route_key' => 'academic',
            ],

            // Existing permissions for other modules
            [
                'name' => 'view-dashboard',
                'group' => 'dashboard',
                'is_menu_web' => true,
                'web_route_key' => '/',
            ],
            [
                'name' => 'view-products',
                'group' => 'products',
                'is_menu_web' => true,
                'web_route_key' => 'product',
            ],
            [
                'name' => 'create-products',
                'group' => 'products',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'edit-products',
                'group' => 'products',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'delete-products',
                'group' => 'products',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'view-categories',
                'group' => 'categories',
                'is_menu_web' => true,
                'web_route_key' => 'categories',
            ],
            [
                'name' => 'create-categories',
                'group' => 'categories',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'edit-categories',
                'group' => 'categories',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'delete-categories',
                'group' => 'categories',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'view-brands',
                'group' => 'brands',
                'is_menu_web' => true,
                'web_route_key' => 'brands',
            ],
            [
                'name' => 'create-brands',
                'group' => 'brands',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'edit-brands',
                'group' => 'brands',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'delete-brands',
                'group' => 'brands',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'view-provinces',
                'group' => 'provinces',
                'is_menu_web' => true,
                'web_route_key' => 'province',
            ],
            [
                'name' => 'create-provinces',
                'group' => 'provinces',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'edit-provinces',
                'group' => 'provinces',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'delete-provinces',
                'group' => 'provinces',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'view-roles',
                'group' => 'users',
                'is_menu_web' => true,
                'web_route_key' => 'role',
            ],
            [
                'name' => 'create-roles',
                'group' => 'users',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'edit-roles',
                'group' => 'users',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'delete-roles',
                'group' => 'users',
                'is_menu_web' => false,
                'web_route_key' => null,
            ],
            [
                'name' => 'pos-access',
                'group' => 'pos',
                'is_menu_web' => true,
                'web_route_key' => 'pos',
            ],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->insert([
                'name' => $permission['name'],
                'group' => $permission['group'],
                'is_menu_web' => $permission['is_menu_web'],
                'web_route_key' => $permission['web_route_key'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Permissions seeded successfully!');
    }
}
