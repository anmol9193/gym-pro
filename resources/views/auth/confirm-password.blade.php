@extends('layouts.management')
@section('title', 'Confirm your password')
@section('content')
<section class="mg-auth-card"><span class="mg-eyebrow mg-accent">ACCOUNT SECURITY</span><h1>Confirm it's you.</h1><p class="mg-lead">Enter your current password to continue.</p><form method="POST" action="{{ route('password.confirm') }}" class="mg-form-fields">@csrf<x-password-field /><button class="btn mg-btn-primary" type="submit">Confirm password</button></form></section>
@endsection
