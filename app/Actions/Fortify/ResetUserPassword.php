<?php

namespace App\Actions\Fortify;

use App\Enums\UserStatus;
use App\Models\User;
use App\Services\AccountService;
use App\Support\PasswordRules;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\ResetsUserPasswords;

class ResetUserPassword implements ResetsUserPasswords
{
    public function reset(User $user, array $input): void
    {
        Validator::make($input, ['password' => PasswordRules::rules()])->validate();
        if ($user->status !== UserStatus::Active) {
            throw ValidationException::withMessages(['email' => 'This account is unavailable. Contact the gym administrator.']);
        }

        app(AccountService::class)->changePassword($user, $input['password'], request()->ip());
    }
}
