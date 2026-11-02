<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $password = config('superadmin.password');

        if (! is_string($password) || $password === '') {
            throw new RuntimeException('Set SUPER_ADMIN_PASSWORD before seeding the super admin.');
        }

        DB::transaction(function () use ($password): void {
            $role = Role::firstOrCreate(['name' => Role::SUPER_ADMIN, 'guard_name' => 'web']);
            $user = User::firstOrNew(['email' => config('superadmin.email')]);
            $user->forceFill([
                'name' => 'Super Admin',
                'email_verified_at' => now(),
                'password' => $password,
            ])->save();
            $user->roles()->syncWithoutDetaching([$role->id]);
        });
    }
}
