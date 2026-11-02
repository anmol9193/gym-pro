@extends('layouts.portal')
@section('body-class', 'bp-dashboard-page fh-dashboard')
@push('styles')
<link rel="stylesheet" href="{{ asset('assets/fit-dashboard.css') }}">
<script src="{{ asset('assets/fit-dashboard.js') }}" defer></script>
@endpush
@section('content')
@include('partials.dashboard-icons')
@include('partials.dashboard-sidebar')
<div class="bp-app" data-dashboard-main>
    @include('partials.dashboard-topbar')
    <main class="bp-dashboard-main @yield('workspace-main-class')" id="main">
        @yield('workspace-content')
        @include('partials.dashboard-footer')
    </main>
</div>
@endsection
