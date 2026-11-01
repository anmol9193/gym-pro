<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ trim($__env->yieldContent('title', 'Workspace')) }} | GYM PRO</title>
    <script>try{const t=localStorage.getItem('beast-theme')||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');document.documentElement.dataset.bsTheme=t}catch(_){}</script>
    <link rel="stylesheet" href="{{ asset('assets/fonts/fonts.css') }}">
    @vite(['resources/css/management.css', 'resources/js/management.js'])
</head>
<body class="management-body" x-data="managementShell" :class="{'sidebar-open': sidebarOpen}" @keydown.escape.window="closeSidebar()" @keydown.tab="trapSidebar($event)">
@include('partials.management-icons')
<a class="mg-skip" href="#main-content">Skip to content</a>
@auth
    <button class="mg-backdrop" x-cloak x-show="sidebarOpen" @click="closeSidebar()" type="button" aria-label="Close navigation"></button>
    @include('partials.management-sidebar')
    <div class="mg-main-shell" :inert="isMobile && sidebarOpen">
        <header class="mg-topbar">
            <div class="d-flex align-items-center gap-3"><button class="mg-icon-button mg-menu-button" type="button" @click="toggleSidebar()" :aria-expanded="sidebarOpen.toString()" aria-controls="management-sidebar" aria-label="Open navigation"><svg><use href="#mg-menu"/></svg></button><span class="mg-topbar-label">YOUR GYM. CONNECTED.</span></div>
            <div class="d-flex align-items-center gap-3"><button class="mg-icon-button" type="button" @click="$store.theme.toggle()" :aria-label="$store.theme.label" title="Change theme"><svg><use href="#mg-sun"/></svg></button><a class="mg-user-chip" href="{{ route('account.edit') }}"><span class="mg-avatar">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 1)) }}</span><span><strong>{{ auth()->user()->name }}</strong><small>{{ auth()->user()->primaryRole()?->label() ?? 'Account' }}</small></span></a></div>
        </header>
        <main class="mg-content" id="main-content" tabindex="-1">@include('partials.management-alerts') @yield('content')</main>
        <footer class="mg-footer"><span>GYM PRO / ONE GYM. ONE TEAM.</span><a href="{{ route('home') }}">View public website <svg><use href="#mg-external"/></svg></a></footer>
    </div>
@else
    <header class="mg-auth-header"><a class="mg-brand" href="{{ route('home') }}"><span class="mg-brand-mark"><svg><use href="#mg-bolt"/></svg></span><span>GYM<span class="mg-accent">PRO</span><small>YOUR GYM. CONNECTED.</small></span></a><div class="d-flex align-items-center gap-3"><a class="mg-back-link" href="{{ route('home') }}">Back to website <svg><use href="#mg-external"/></svg></a><button class="mg-icon-button" type="button" @click="$store.theme.toggle()" :aria-label="$store.theme.label" title="Change theme"><svg><use href="#mg-sun"/></svg></button></div></header>
    <main class="mg-auth-main" id="main-content" tabindex="-1">@yield('content')</main>
@endauth
<noscript><style>.mg-menu-button,.mg-backdrop{display:none!important}@media(max-width:1000px){.mg-sidebar{position:static!important;transform:none!important;width:100%!important;max-height:none!important}.mg-main-shell{margin-left:0!important}}</style></noscript>
</body>
</html>
