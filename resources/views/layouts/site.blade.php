<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#101211">
  <meta name="description" content="{{ trim($__env->yieldContent('description', '')) }}">
  <title>{{ trim($__env->yieldContent('title', 'BEAST MODE Gym')) }}</title>
  <script>
    try { document.documentElement.dataset.theme = localStorage.getItem('beast-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'); } catch (_) {}
    (() => {
      const root = document.documentElement;
      root.classList.add('is-loading');
      const state = window.beastPageLoader = { startedAt: performance.now(), finished: false };
      let timeout;
      state.finish = () => {
        if (state.finished) return;
        state.finished = true;
        clearTimeout(timeout);
        root.classList.remove('is-loading');
        root.classList.add('is-loaded');
        document.getElementById('page-loader')?.setAttribute('aria-hidden', 'true');
      };
      // Always release the page, even if a script or asset cannot load.
      timeout = setTimeout(state.finish, 4000);
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(event => {
        addEventListener(event, state.finish, { once: true, passive: true });
      });
    })();
  </script>
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <link rel="stylesheet" href="{{ asset('assets/fonts/fonts.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/styles.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/typography.css') }}">
  <link rel="stylesheet" href="{{ asset('assets/loader.css') }}">
  @stack('styles')
  <link rel="stylesheet" href="{{ asset('assets/responsive.css') }}">
  @stack('vendor-scripts')
  <script src="{{ asset('assets/app.js') }}" defer></script>
  @stack('scripts')
</head>
<body class="@yield('body-class')">
<div class="page-loader" id="page-loader" role="status" aria-live="polite" aria-label="Loading Beast Mode" hidden>
  <div class="loader-content">
    <div class="loader-orbit" aria-hidden="true"><span class="loader-emblem"><svg viewBox="0 0 32 32"><path d="m19 2-14 17h10l-2 11L28 12H18l1-10Z" fill="currentColor"/></svg></span></div>
    <div class="loader-wordmark" aria-hidden="true">BEAST<span>MODE</span></div>
    <p class="loader-caption">WARMING UP YOUR NEXT CHAPTER.</p>
    <div class="loader-track" aria-hidden="true"><span></span></div>
    <span class="loader-note" aria-hidden="true">SHOW UP. LEVEL UP.</span>
  </div>
</div>
<script>if (document.documentElement.classList.contains('is-loading')) document.getElementById('page-loader').hidden = false;</script>
<a class="skip-link" href="#main">Skip to content</a>
<svg class="svg-defs" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <symbol id="icon-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol>
    <symbol id="icon-up-right" viewBox="0 0 24 24"><path d="M6 18 18 6M6 6h12v12"/></symbol>
    <symbol id="icon-bolt" viewBox="0 0 32 32"><path d="m19 2-14 17h10l-2 11L28 12H18l1-10Z" fill="currentColor" stroke="none"/></symbol>
    <symbol id="icon-check" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></symbol>
    <symbol id="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></symbol>
    <symbol id="icon-moon" viewBox="0 0 24 24"><path d="M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z"/></symbol>
    <symbol id="icon-dumbbell" viewBox="0 0 24 24"><path d="m6.5 6.5 11 11M4 10l6-6M14 20l6-6M2 8l6-6M16 22l6-6"/></symbol>
  </defs>
</svg>
<div class="scroll-progress" aria-hidden="true"></div>

@include('partials.navigation')
@yield('content')
@include('partials.footer')
</body>
</html>
