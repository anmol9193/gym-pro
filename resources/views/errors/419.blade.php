@extends('layouts.management')
@section('title', 'Session expired')
@section('content')
<section class="mg-auth-card"><span class="mg-eyebrow mg-accent">419 / SESSION EXPIRED</span><h1>Let's start again.</h1><p class="mg-lead">This form session has expired. Open the page again before submitting. Your password has not been included in this response.</p><a class="btn mg-btn-primary mt-4" href="{{ auth()->check()?route('account.edit'):route('login') }}">Open a fresh session</a></section>
@endsection
