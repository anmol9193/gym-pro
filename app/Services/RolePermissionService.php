<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionService
{
    public function update(User $actor, Role $role, array $permissions, ?string $ip): void
    {
        Gate::forUser($actor)->authorize('permissions.manage');
        abort_if($role->name === UserRole::SuperAdmin->value, 403, 'Super Admin permissions are system-managed.');
        abort_if(array_diff($permissions, UserRole::allPermissions()) !== [], 422);

        DB::transaction(function () use ($actor, $role, $permissions, $ip): void {
            $role = Role::whereKey($role->id)->lockForUpdate()->firstOrFail();
            $before = $role->permissions()->pluck('name')->all();
            $role->syncPermissions($permissions);
            AuditLog::create(['user_id' => $actor->id, 'action' => 'role.permissions-updated', 'entity_type' => Role::class, 'entity_id' => $role->id, 'old_values' => ['permissions' => $before], 'new_values' => ['permissions' => $permissions], 'ip_address' => $ip]);
        });
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
