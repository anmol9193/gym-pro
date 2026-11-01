<?php

namespace App\Providers;

use App\Actions\Fortify\ResetUserPassword;
use App\Enums\UserStatus;
use App\Http\Responses\LoginResponse;
use App\Http\Responses\ResetLinkResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Support\Timebox;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(LoginResponseContract::class, LoginResponse::class);
        $this->app->bind(SuccessfulPasswordResetLinkRequestResponse::class, ResetLinkResponse::class);
        $this->app->bind(FailedPasswordResetLinkRequestResponse::class, ResetLinkResponse::class);
    }

    public function boot(): void
    {
        Fortify::loginView(fn () => view('auth.login'));
        Fortify::requestPasswordResetLinkView(fn () => view('auth.forgot-password'));
        Fortify::resetPasswordView(fn (Request $request) => view('auth.reset-password', ['request' => $request]));
        Fortify::confirmPasswordView(fn () => view('auth.confirm-password'));
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::authenticateUsing(function (Request $request): ?User {
            return (new Timebox)->call(function () use ($request): ?User {
                $user = User::where('email', Str::lower(trim((string) $request->input('email'))))
                    ->where('status', UserStatus::Active->value)->first();
                $password = (string) $request->input('password');

                return $user && strlen($password) <= 128 && Hash::check($password, $user->password) ? $user : null;
            }, 200000);
        });
    }
}
