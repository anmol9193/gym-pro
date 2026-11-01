<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AccountService
{
    public function create(User $actor, array $data, ?string $ip): User
    {
        Gate::forUser($actor)->authorize('create', User::class);
        $role = UserRole::from($data['role']);
        $this->authorizeRole($actor, $role);

        return DB::transaction(function () use ($actor, $data, $role, $ip): User {
            $user = User::create([
                'name' => $data['name'],
                'email' => Str::lower($data['email']),
                'password' => $data['password'],
            ]);
            $user->forceFill(['phone' => $data['phone'] ?? null, 'status' => UserStatus::Active, 'must_change_password' => true])->save();
            $user->syncRoles([$role->value]);
            $this->audit($actor->id, 'account.created', $user, null, ['role' => $role->value, 'status' => 'active'], $ip);

            return $user;
        });
    }

    public function updateAccess(User $actor, User $target, array $data, ?string $ip): void
    {
        Gate::forUser($actor)->authorize('update', $target);
        $role = UserRole::from($data['role']);
        $this->authorizeRole($actor, $role);

        DB::transaction(function () use ($actor, $target, $data, $role, $ip): void {
            // Lock all current Super Admin accounts before checking the last-active rule.
            $superAdmins = User::role(UserRole::SuperAdmin->value)->orderBy('id')->lockForUpdate()->get();
            $target = User::whereKey($target->id)->lockForUpdate()->firstOrFail();
            $actor->refresh();
            Gate::forUser($actor)->authorize('update', $target);
            $old = ['role' => $target->primaryRole()?->value, 'status' => $target->status->value];
            $removingSuperAdmin = $target->hasRole(UserRole::SuperAdmin->value)
                && ($role !== UserRole::SuperAdmin || $data['status'] !== UserStatus::Active->value);
            if ($removingSuperAdmin && $superAdmins->where('id', '!=', $target->id)->where('status', UserStatus::Active)->isEmpty()) {
                throw ValidationException::withMessages(['role' => 'Keep at least one active Super Admin account.']);
            }
            $target->forceFill(['status' => UserStatus::from($data['status']), 'remember_token' => Str::random(60)])->save();
            $target->syncRoles([$role->value]);
            $this->forgetSessions($target);
            $this->audit($actor->id, 'account.access-updated', $target, $old, ['role' => $role->value, 'status' => $data['status']], $ip);
        });
    }

    public function changePassword(User $user, string $password, ?string $ip): void
    {
        DB::transaction(function () use ($user, $password, $ip): void {
            $user->forceFill(['password' => $password, 'must_change_password' => false, 'remember_token' => Str::random(60)])->save();
            $this->forgetSessions($user);
            $this->audit($user->id, 'account.password-changed', $user, null, null, $ip);
        });
    }

    private function authorizeRole(User $actor, UserRole $role): void
    {
        abort_unless($actor->can('roles.assign'), 403);
        abort_if($role === UserRole::SuperAdmin && ! $actor->hasRole(UserRole::SuperAdmin->value), 403);
    }

    private function forgetSessions(User $user): void
    {
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        }
    }

    private function audit(?int $actorId, string $action, User $target, ?array $old, ?array $new, ?string $ip): void
    {
        AuditLog::create(['user_id' => $actorId, 'action' => $action, 'entity_type' => User::class, 'entity_id' => $target->id, 'old_values' => $old, 'new_values' => $new, 'ip_address' => $ip]);
    }
}
