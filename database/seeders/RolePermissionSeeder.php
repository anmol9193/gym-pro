<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (UserRole::allPermissions() as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        foreach (UserRole::cases() as $role) {
            $record = Role::firstOrCreate(['name' => $role->value, 'guard_name' => 'web']);
            if ($record->wasRecentlyCreated || $role === UserRole::SuperAdmin) {
                $record->syncPermissions($role->permissions());
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
