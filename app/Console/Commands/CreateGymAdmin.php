<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\PasswordRules;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class CreateGymAdmin extends Command
{
    protected $signature = 'gym:create-admin {email} {--name=Gym Owner}';

    protected $description = 'Create an initial Super Admin with a privately entered password';

    public function handle(): int
    {
        $password = $this->secret('Choose a password (12+ characters, uppercase, lowercase, number and symbol)');
        $confirmation = $this->secret('Confirm password');
        $data = ['email' => strtolower(trim((string) $this->argument('email'))), 'name' => $this->option('name'), 'password' => $password, 'password_confirmation' => $confirmation];
        $validator = Validator::make($data, ['email' => ['required', 'email', 'max:254', Rule::unique('users')], 'name' => ['required', 'string', 'max:80'], 'password' => PasswordRules::rules()]);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        if (! Role::where('name', UserRole::SuperAdmin->value)->exists()) {
            $this->error('Run php artisan migrate --seed before creating the initial administrator.');

            return self::FAILURE;
        }

        DB::transaction(function () use ($data): void {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
            $user->assignRole(UserRole::SuperAdmin->value);
            AuditLog::create(['user_id' => $user->id, 'action' => 'account.created-via-console', 'entity_type' => User::class, 'entity_id' => $user->id, 'new_values' => ['role' => UserRole::SuperAdmin->value, 'status' => 'active']]);
        });
        $this->info('Super Admin created. Sign in at '.route('login'));

        return self::SUCCESS;
    }
}
