@extends('layouts.portal')
@section('title', 'Welcome back')
@section('body-class', 'bl-page')
@push('styles')
<link rel="stylesheet" href="{{ asset('assets/login.css') }}">
@endpush
@section('content')
<main class="bl-main" id="main">
    <div class="bl-card">
        <section class="bl-form-panel" aria-labelledby="login-title">
            <div class="bl-form-top"><span class="bl-access-mark"><svg class="icon" aria-hidden="true"><use href="#bp-dumbbell"/></svg></span><span class="bl-access-label">YOUR GYM.<br>YOUR SPACE.</span><span class="bl-preview-tag">ADMIN ACCESS</span></div>
            <div class="bl-intro"><h1 id="login-title">Welcome back<span>.</span></h1><p>Find your focus. Get back to your strong.</p></div>
            <form class="bl-form" action="{{ route('login.store') }}" method="POST">
                @csrf
                <div class="bl-field"><label for="email">Email address</label><div class="bl-input-wrap"><svg class="bl-input-icon icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg><input type="email" id="email" name="email" value="{{ old('email') }}" required @error('email') aria-invalid="true" @enderror autocomplete="username" placeholder="you@example.com" maxlength="254" aria-describedby="email-error"></div><small class="bl-field-error" id="email-error" role="alert" @if(! $errors->has('email')) hidden @endif>{{ $errors->first('email') ?: 'Enter a valid email address.' }}</small></div>
                <div class="bl-field"><div class="bl-label-row"><label for="password">Password</label><a href="{{ route('contact') }}#enquiry">Need help?</a></div><div class="bl-input-wrap"><svg class="bl-input-icon icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg><input type="password" id="password" name="password" required aria-describedby="password-error" @error('password') aria-invalid="true" @enderror autocomplete="current-password" placeholder="Enter your password" maxlength="128"><button type="button" class="bl-password-toggle" data-password-toggle aria-label="Show password" aria-pressed="false" hidden><svg class="icon" aria-hidden="true"><use href="#bp-eye"/></svg></button></div><small class="bl-field-error" id="password-error" role="alert" @if(! $errors->has('password')) hidden @endif>{{ $errors->first('password') }}</small></div>
                <button class="button button-primary bl-submit" type="submit"><span>Sign in</span><span class="bl-submit-arrow"><svg class="icon" aria-hidden="true"><use href="#bp-arrow"/></svg></span></button>
                <div class="bl-preview-note"><span class="bl-note-dot" aria-hidden="true"></span><p>Sign in to manage your gym.</p></div>
            </form>
            <div class="bl-membership"><span>Not part of the crew yet?</span><a href="{{ route('membership') }}">Explore memberships <svg class="icon" aria-hidden="true"><use href="#bp-external"/></svg></a></div>
        </section>
        <section class="bl-visual" aria-label="Beast Mode mindset">
            <img src="{{ asset('assets/boxing.jpg') }}" alt="Boxing gloves ready for the next training session" width="900" height="1350" fetchpriority="high">
            <div class="bl-visual-shade"></div>
            <div class="bl-visual-top"><span class="bl-live-label"><i></i> THE WORK STARTS WITH YOU</span><svg class="icon" aria-hidden="true"><use href="#bp-bolt"/></svg></div>
            <div class="bl-visual-copy"><span>EVERY DAY. A LITTLE STRONGER.</span><h2>MAKE IT<br><em>COUNT.</em></h2></div>
            <div class="bl-visual-bottom"><span class="bl-visual-symbol" aria-hidden="true">✳</span><p>Your pace. Your people.<br><strong>Your kind of strong.</strong></p><span class="bl-visual-number" aria-hidden="true">B/M</span></div>
        </section>
    </div>
</main>
@endsection
