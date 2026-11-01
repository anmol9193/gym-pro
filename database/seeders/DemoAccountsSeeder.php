<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use App\Support\PasswordRules;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing')) {
            throw new RuntimeException('Demo accounts are restricted to local and testing environments.');
        }

        $this->call(RolePermissionSeeder::class);
        $created = DB::transaction(function (): array {
            $accounts = [];
            foreach ([
                ['Super Admin', 'superadmin@gympro.local', UserRole::SuperAdmin],
                ['Gym Administrator', 'admin@gympro.local', UserRole::GymAdmin],
                ['Reception Desk', 'reception@gympro.local', UserRole::Receptionist],
                ['Demo Trainer One', 'trainer1@gympro.local', UserRole::Trainer],
                ['Demo Trainer Two', 'trainer2@gympro.local', UserRole::Trainer],
                ['Demo Member', 'member@gympro.local', UserRole::Member],
            ] as [$name, $email, $role]) {
                if (User::where('email', $email)->exists()) {
                    continue;
                }
                $password = PasswordRules::generate();
                $user = User::create(['name' => $name, 'email' => $email, 'password' => $password]);
                $user->forceFill(['status' => UserStatus::Active, 'must_change_password' => true])->save();
                $user->assignRole($role->value);
                $accounts[] = ['name' => $name, 'email' => $email, 'role' => $role->label(), 'initial_password' => $password];
            }

            return $accounts;
        });

        if ($created !== []) {
            $disk = Storage::disk('local');
            $file = 'local-demo-credentials.json';
            $previous = $disk->exists($file) ? json_decode($disk->get($file), true, flags: JSON_THROW_ON_ERROR) : [];
            $disk->put($file, json_encode([...$previous, ...$created], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
        }

        $this->command?->info(count($created).' local demo accounts created. Initial passwords are in storage/app/private/local-demo-credentials.json; existing accounts were preserved.');
    }
}
