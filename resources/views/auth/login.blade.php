@extends('layouts.management')
@section('title', 'Sign in')
@section('content')
<div class="mg-login-layout">
    <section class="mg-login-visual" aria-label="Gym Pro workspace"><img src="{{ asset('assets/gym-space.jpg') }}" alt="Training in a gym" width="1600" height="1067"><div class="mg-login-visual-copy"><span class="mg-eyebrow">ONE GYM. ONE TEAM.</span><h2>A STRONGER<br>DAY STARTS<br><span>TOGETHER.</span></h2><p>A dedicated space for your gym,<br>your people and your next chapter.</p></div><div class="mg-login-caption"><span class="mg-status-dot"></span> GYM PRO / YOUR GYM. CONNECTED.</div></section>
    <section class="mg-login-form"><div class="mg-auth-form-inner"><span class="mg-eyebrow mg-accent">WELCOME TO YOUR WORKSPACE</span><h1>Good to have<br>you back.</h1><p class="mg-lead">Sign in with your gym account to continue.</p>@include('partials.management-alerts')
    <form method="POST" action="{{ route('login.store') }}" x-data="{submitting:false}" @submit="submitting=true"><div class="mg-form-fields">@csrf
        <div class="mg-field"><label class="form-label" for="email">Email address</label><input class="form-control @error('email') is-invalid @enderror" type="email" name="email" id="email" value="{{ old('email') }}" autocomplete="username" required maxlength="254" placeholder="you@yourgym.com" autofocus></div>
        <x-password-field />
        <div class="mg-login-options"><label class="mg-checkbox"><input class="form-check-input" type="checkbox" name="remember" value="1" @checked(old('remember'))><span>Keep me signed in</span></label><a href="{{ route('password.request') }}">Forgot password?</a></div>
        <button class="btn mg-btn-primary w-100" type="submit" :disabled="submitting"><span x-text="submitting ? 'Signing in…' : 'Sign in'">Sign in</span><svg><use href="#mg-arrow"/></svg></button>
    </div></form><div class="mg-login-help"><svg><use href="#mg-shield"/></svg><p>For gym members and staff.<br>Need an account? Ask your gym administrator.</p></div></div></section>
</div>
@endsection
