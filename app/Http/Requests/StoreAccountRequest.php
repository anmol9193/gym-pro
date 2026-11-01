<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\User;
use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreAccountRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower(trim($this->input('email')))]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'email', 'max:254', Rule::unique('users')],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[+0-9\s().-]+$/'],
            'role' => ['required', Rule::enum(UserRole::class)],
            'password' => PasswordRules::rules(),
        ];
    }
}
