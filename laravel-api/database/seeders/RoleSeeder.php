<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all permissions
        $permissions = DB::table('permissions')->pluck('id', 'name');

        // Define roles with their permissions
        $roles = [
            [
                'name' => 'Super Admin',
                'code' => 'super_admin',
                'description' => 'Full system access',
                'status' => 1,
                'permissions' => array_keys($permissions->toArray()), // All permissions
            ],
            [
                'name' => 'Administrator',
                'code' => 'administrator',
                'description' => 'Administrative access to all modules',
                'status' => 1,
                'permissions' => [
                    'view-dashboard',
                    'view-products', 'create-products', 'edit-products', 'delete-products',
                    'view-categories', 'create-categories', 'edit-categories', 'delete-categories',
                    'view-brands', 'create-brands', 'edit-brands', 'delete-brands',
                    'view-provinces', 'create-provinces', 'edit-provinces', 'delete-provinces',
                    'view-roles', 'create-roles', 'edit-roles', 'delete-roles',
                    'pos-access',
                    'academic-module',
                    'view-students', 'create-students', 'edit-students', 'delete-students',
                    'student-management', 'student-registration',
                    'view-subjects', 'create-subjects', 'edit-subjects', 'delete-subjects',
                    'subject-management',
                ],
            ],
            [
                'name' => 'Academic Admin',
                'code' => 'academic_admin',
                'description' => 'Access to student and subject management',
                'status' => 1,
                'permissions' => [
                    'view-dashboard',
                    'academic-module',
                    'view-students', 'create-students', 'edit-students',
                    'student-management', 'student-registration',
                    'view-subjects', 'create-subjects', 'edit-subjects',
                    'subject-management',
                ],
            ],
            [
                'name' => 'Teacher',
                'code' => 'teacher',
                'description' => 'Access to view students and manage subjects',
                'status' => 1,
                'permissions' => [
                    'view-dashboard',
                    'academic-module',
                    'view-students',
                    'student-management',
                    'view-subjects',
                    'subject-management',
                ],
            ],
            [
                'name' => 'Registrar',
                'code' => 'registrar',
                'description' => 'Access to student registration and management',
                'status' => 1,
                'permissions' => [
                    'view-dashboard',
                    'academic-module',
                    'view-students', 'create-students', 'edit-students',
                    'student-management', 'student-registration',
                    'view-subjects',
                    'subject-management',
                ],
            ],
            [
                'name' => 'Sales Staff',
                'code' => 'sales_staff',
                'description' => 'Access to POS and product management',
                'status' => 1,
                'permissions' => [
                    'view-dashboard',
                    'pos-access',
                    'view-products', 'create-products', 'edit-products',
                    'view-categories',
                    'view-brands',
                ],
            ],
            [
                'name' => 'Viewer',
                'code' => 'viewer',
                'description' => 'Read-only access to all modules',
                'status' => 1,
                'permissions' => [
                    'view-dashboard',
                    'view-products',
                    'view-categories',
                    'view-brands',
                    'view-provinces',
                    'view-roles',
                    'pos-access',
                    'academic-module',
                    'view-students',
                    'student-management',
                    'view-subjects',
                    'subject-management',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            // Create role
            $roleId = DB::table('roles')->insertGetId([
                'name' => $roleData['name'],
                'code' => $roleData['code'],
                'description' => $roleData['description'],
                'status' => $roleData['status'],
                'test' => '',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Attach permissions to role
            $permissionIds = [];
            foreach ($roleData['permissions'] as $permissionName) {
                if (isset($permissions[$permissionName])) {
                    $permissionIds[] = $permissions[$permissionName];
                }
            }

            if (!empty($permissionIds)) {
                foreach ($permissionIds as $permissionId) {
                    DB::table('role_permissions')->insert([
                        'role_id' => $roleId,
                        'permission_id' => $permissionId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        $this->command->info('Roles seeded successfully!');
    }
}
