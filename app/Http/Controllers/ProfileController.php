<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ProfileController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (is_string($request->input('email'))) {
            $request->merge(['email' => strtolower(trim($request->input('email')))]);
        }
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'email' => ['required', 'string', 'email', 'max:254', Rule::unique('users')->ignore($user->id)],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=4096,max_height=4096'],
            'remove_avatar' => ['sometimes', 'boolean'],
        ]);

        $previousPhoto = $user->avatar_path;
        $newPhoto = null;
        if ($request->hasFile('avatar')) {
            $newPhoto = $request->file('avatar')->store('profile-photos', 'local');
            if ($newPhoto === false) {
                throw ValidationException::withMessages(['avatar' => 'The photo could not be uploaded. Please try again.']);
            }
            $user->avatar_path = $newPhoto;
        } elseif ($request->boolean('remove_avatar')) {
            $user->avatar_path = null;
        }

        $user->fill(Arr::only($data, ['name', 'email']));
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        try {
            $user->save();
        } catch (Throwable $exception) {
            if ($newPhoto) {
                Storage::disk('local')->delete($newPhoto);
            }
            throw $exception;
        }
        if ($previousPhoto && $previousPhoto !== $user->avatar_path) {
            Storage::disk('local')->delete($previousPhoto);
        }

        return to_route('profile.edit')->with('status', 'Your profile has been updated.');
    }

    public function photo(Request $request): StreamedResponse
    {
        $path = $request->user()->avatar_path;
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path, null, ['X-Content-Type-Options' => 'nosniff']);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string', 'max:128', 'current_password:web'],
            'password' => ['required', 'string', 'min:8', 'max:128', 'confirmed', 'different:current_password'],
        ]);

        $request->user()->forceFill([
            'password' => $data['password'],
            'remember_token' => Str::random(60),
        ])->save();
        $request->session()->regenerate(true);
        $request->session()->regenerateToken();

        return to_route('password.edit')->with('status', 'Your password has been changed.');
    }
}
