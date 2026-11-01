<?php

namespace App\Support;

use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

final class PasswordRules
{
    public static function rules(): array
    {
        return ['required', 'string', 'max:128', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()];
    }

    public static function generate(): string
    {
        return Str::random(20).'!9aA';
    }
}
