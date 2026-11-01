@extends('layouts.management')
@section('title', 'Access restricted')
@section('content')
<section class="mg-auth-card"><span class="mg-auth-emblem"><svg><use href="#mg-shield"/></svg></span><span class="mg-eyebrow mg-accent">403 / ACCESS RESTRICTED</span><h1>A different workspace.</h1><p class="mg-lead">Your account does not have permission for this action. Return to your workspace or ask your gym administrator about your role.</p><a class="btn mg-btn-primary mt-4" href="{{ auth()->check()?route('dashboard'):route('login') }}">{{ auth()->check()?'My workspace':'Sign in' }} <svg><use href="#mg-arrow"/></svg></a></section>
@endsection
