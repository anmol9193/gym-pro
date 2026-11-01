@extends('layouts.portal')
@section('title', 'Welcome back')
@section('body-class', 'bp-login-page')
@section('content')
<header class="bp-login-header">@include('partials.portal-brand')<div class="bp-header-actions"><a class="bp-back-link" href="{{ route('home') }}">Back to website <svg class="icon"><use href="#bp-external"/></svg></a><button class="icon-button" data-theme-toggle type="button" aria-label="Switch to light theme" hidden><svg class="icon"><use href="#bp-sun"/></svg></button></div></header>
<main class="bp-login-layout" id="main">
    <section class="bp-login-photo" aria-label="Beast Mode training"><img src="{{ asset('assets/hero-athlete.jpg') }}" alt="Athlete training with a barbell at the gym" width="1500" height="1000" fetchpriority="high"><div class="bp-photo-top"><span><i class="status-dot"></i> BEAST MODE: ON</span><svg class="icon"><use href="#bp-external"/></svg></div><div class="bp-photo-copy"><span class="eyebrow">SHOW UP FOR YOURSELF.</span><h2>YOUR NEXT<br>CHAPTER.<br><em>STARTS HERE.</em></h2><p>Same you. A little stronger.<br>One good day at a time.</p></div><span class="bp-photo-foot">BODY. MIND. NO LIMITS.<span>01 / ∞</span></span></section>
    <section class="bp-login-form-wrap"><div class="bp-login-form-inner"><span class="eyebrow bp-form-eyebrow"><i class="status-dot"></i> YOUR NEXT REP STARTS HERE</span><h1>BACK FOR<br><span class="accent-text">MORE?</span></h1><p class="bp-form-intro">Your gym. Your people. Your next chapter.</p>
        <form class="bp-login-form" action="{{ route('dashboard') }}" method="GET" data-login-preview>
            <div class="bp-field"><label for="email">Email address</label><input type="email" id="email" autocomplete="username" placeholder="you@example.com" maxlength="254" aria-describedby="email-error"><small class="bp-field-error" id="email-error" role="alert" hidden>Enter a valid email address, or leave it blank to preview.</small></div>
            <div class="bp-field"><label for="password">Password</label><div class="bp-password-wrap"><input type="password" id="password" autocomplete="current-password" placeholder="Enter your password" maxlength="128"><button type="button" data-password-toggle aria-label="Show password" aria-pressed="false" hidden><svg class="icon"><use href="#bp-eye"/></svg></button></div></div>
            <div class="bp-login-options"><span class="bp-preview-inline"><i class="status-dot"></i> DESIGN PREVIEW</span><a href="{{ route('contact') }}#enquiry">Need help?</a></div>
            <button class="button button-primary bp-login-submit" type="submit"><span>Preview dashboard</span><svg class="icon"><use href="#bp-arrow"/></svg></button>
            <p class="bp-preview-caption">No account needed. Credentials are not submitted.</p>
        </form>
        <div class="bp-login-community"><span class="bp-community-icon"><svg class="icon"><use href="#bp-dumbbell"/></svg></span><p>New around here?<br><a href="{{ route('membership') }}">Find your kind of strong. <svg class="icon"><use href="#bp-external"/></svg></a></p></div>
    </div></section>
</main>
<footer class="bp-login-footer"><span>© {{ date('Y') }} BEAST MODE GYM</span><span>Designed &amp; Developed by <a href="https://anmolsaini.wuaze.com" target="_blank" rel="noopener noreferrer">Anmol Saini</a></span></footer>
@endsection
