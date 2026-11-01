<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class ThrottleRecoveryRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('post') && $request->routeIs('password.email', 'password.update')) {
            $key = 'password-recovery:'.$request->ip();
            if (RateLimiter::tooManyAttempts($key, 5)) {
                throw ValidationException::withMessages(['email' => 'Too many password-reset requests. Try again in one minute.']);
            }
            RateLimiter::hit($key, 60);
        }

        return $next($request);
    }
}
