<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="#101211">
    <title>@yield('title') | BEAST MODE</title>
    @auth
    <script src="{{ asset('assets/auth-history.js') }}"></script>
    @endauth
    <script>try{document.documentElement.dataset.theme=localStorage.getItem('beast-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}catch(_){}</script>
    <link rel="stylesheet" href="{{ asset('assets/fonts/fonts.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/portal.css') }}">
    @stack('styles')
    <script src="{{ asset('assets/portal.js') }}" defer></script>
</head>
<body class="bp-body @yield('body-class')">
@include('partials.portal-icons')
<a class="skip-link" href="#main">Skip to content</a>
@yield('content')
<noscript><style>.bp-sidebar{transform:none!important;position:static!important;width:100%!important;height:auto!important}.bp-app{margin-left:0!important}.bp-sidebar-bottom{margin-top:20px!important}.bp-chart-bar{transition:none!important}</style></noscript>
</body>
</html>
