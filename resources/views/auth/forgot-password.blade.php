@extends('layouts.management')
@section('title', 'Reset your password')
@section('content')
<section class="mg-auth-card"><span class="mg-auth-emblem"><svg><use href="#mg-lock"/></svg></span><span class="mg-eyebrow mg-accent">ACCOUNT RECOVERY</span><h1>Find your way back.</h1><p class="mg-lead">Enter your account email to request password-reset instructions.</p>@include('partials.management-alerts')
@if(app()->environment('local') && config('mail.default') === 'log')<p class="alert mg-alert-info">Local development: reset links are recorded in the private mail log. Email delivery is not configured.</p>@endif
<form method="POST" action="{{ route('password.email') }}" class="mg-form-fields">@csrf<div class="mg-field"><label class="form-label" for="email">Email address</label><input class="form-control" id="email" name="email" type="email" autocomplete="email" value="{{ old('email') }}" required maxlength="254" autofocus></div><button class="btn mg-btn-primary" type="submit">Request reset instructions <svg><use href="#mg-arrow"/></svg></button></form><a class="mg-auth-back" href="{{ route('login') }}">Back to sign in</a></section>
@endsection
