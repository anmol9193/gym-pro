<?php

use App\Http\Middleware\NoStorePrivateResponse;
use App\Http\Middleware\ThrottleRecoveryRequests;
use Laravel\Fortify\Features;

return [
    'guard' => 'web',
    'middleware' => ['web', NoStorePrivateResponse::class, ThrottleRecoveryRequests::class],
    'auth_middleware' => 'auth',
    'passwords' => 'users',
    'username' => 'email',
    'email' => 'email',
    'views' => true,
    'home' => '/dashboard',
    'redirects' => ['logout' => '/login'],
    'prefix' => '',
    'domain' => null,
    'lowercase_usernames' => true,
    'limiters' => ['login' => null],
    'features' => [Features::resetPasswords()],
];
