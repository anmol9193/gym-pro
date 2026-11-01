<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->status === UserStatus::Active && $actor->can('users.view');
    }

    public function create(User $actor): bool
    {
        return $actor->status === UserStatus::Active && $actor->can('users.create');
    }

    public function update(User $actor, User $target): bool
    {
        return $actor->status === UserStatus::Active && $actor->can('users.update')
            && $actor->id !== $target->id
            && (! $target->hasRole(UserRole::SuperAdmin->value) || $actor->hasRole(UserRole::SuperAdmin->value));
    }
}
