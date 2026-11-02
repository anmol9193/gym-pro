@extends('layouts.dashboard')
@section('body-class', 'bp-dashboard-page fh-dashboard fh-settings-page')
@section('workspace-title', 'Account settings')
@section('workspace-main-class', 'fh-settings-main')
@section('workspace-heading')
<nav class="fh-account-breadcrumb" aria-label="Breadcrumb"><a href="{{ route('dashboard') }}">Dashboard</a><span aria-hidden="true">/</span><h1 aria-current="page">Account settings</h1></nav>
@endsection
@push('styles')
<link rel="stylesheet" href="{{ asset('assets/account.css') }}">
@endpush
@section('workspace-content')
<div class="fh-settings-heading"><h2>@yield('account-heading')</h2><p>@yield('account-intro')</p></div>
@if(session('status'))<div class="fh-settings-toast" role="status" aria-atomic="true" data-flash-toast><span class="fh-toast-icon"><svg class="icon" aria-hidden="true"><use href="#bp-check"/></svg></span><p>{{ session('status') }}</p><button type="button" data-toast-dismiss aria-label="Dismiss notification" hidden><svg class="icon" aria-hidden="true"><use href="#bp-close"/></svg></button></div>@endif
<div class="fh-settings-grid">
    <aside class="fh-settings-overview" aria-label="Account summary">
        <div class="fh-settings-identity">@include('partials.account-avatar')<h3>{{ auth()->user()->name }}</h3><p>{{ auth()->user()->email }}</p><span class="fh-account-role"><i aria-hidden="true"></i>Super administrator</span></div>
        <nav class="fh-settings-tabs" aria-label="Account settings"><a href="{{ route('profile.edit') }}" @if(request()->routeIs('profile.*')) aria-current="page" @endif><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg><span>Personal profile</span><svg class="icon fh-settings-nav-arrow"><use href="#bp-arrow"/></svg></a><a href="{{ route('password.edit') }}" @if(request()->routeIs('password.*')) aria-current="page" @endif><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m4 5v2"/></svg><span>Password &amp; security</span><svg class="icon fh-settings-nav-arrow"><use href="#bp-arrow"/></svg></a></nav>
    </aside>
    <section class="fh-settings-card" aria-label="@yield('account-heading')">@yield('account-content')</section>
</div>
@endsection
