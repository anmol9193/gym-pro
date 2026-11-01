<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super-admin';
    case GymAdmin = 'gym-admin';
    case Receptionist = 'receptionist';
    case Trainer = 'trainer';
    case Member = 'member';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::GymAdmin => 'Gym Admin',
            self::Receptionist => 'Receptionist',
            self::Trainer => 'Trainer',
            self::Member => 'Member',
        };
    }

    public function dashboardRoute(): string
    {
        return match ($this) {
            self::SuperAdmin, self::GymAdmin => 'admin.dashboard',
            self::Receptionist => 'receptionist.dashboard',
            self::Trainer => 'trainer.dashboard',
            self::Member => 'member.dashboard',
        };
    }

    public function permissions(): array
    {
        return match ($this) {
            self::SuperAdmin => self::allPermissions(),
            self::GymAdmin => ['admin.dashboard', 'users.view', 'users.create', 'users.update', 'roles.view', 'roles.assign', 'settings.manage'],
            self::Receptionist => ['receptionist.dashboard'],
            self::Trainer => ['trainer.dashboard'],
            self::Member => ['member.dashboard'],
        };
    }

    public static function allPermissions(): array
    {
        return ['admin.dashboard', 'receptionist.dashboard', 'trainer.dashboard', 'member.dashboard', 'users.view', 'users.create', 'users.update', 'roles.view', 'roles.assign', 'permissions.manage', 'settings.manage'];
    }
}
