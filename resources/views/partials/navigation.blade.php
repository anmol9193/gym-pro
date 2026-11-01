<nav class="navbar" aria-label="Main navigation">
  <div class="nav-shell">
    <a class="brand" href="{{ route('home') }}#home" aria-label="Beast Mode home"><span class="brand-mark"><svg class="icon" aria-hidden="true"><use href="#icon-bolt"/></svg></span><span>BEAST<span class="accent-text">MODE</span><small>YOUR POTENTIAL. UNLEASHED.</small></span></a>
    <ul class="nav-links" id="nav-links">
      <li><a href="{{ route('home') }}#home" @if(request()->routeIs('home')) aria-current="page" @endif>Home</a></li>
      <li><a href="{{ route('programs.index') }}" @if(request()->routeIs('programs.*')) aria-current="page" @endif>Programs</a></li>
      <li><a href="{{ route('products.index') }}" @if(request()->routeIs('products.*')) aria-current="page" @endif>Products</a></li>
      <li><a href="{{ route('approach') }}" @if(request()->routeIs('approach')) aria-current="page" @endif>Our approach</a></li>
      <li><a href="{{ route('membership') }}" @if(request()->routeIs('membership')) aria-current="page" @endif>Membership</a></li>

      <li class="mobile-join"><a class="button button-primary" href="{{ route('contact') }}#enquiry">Start free trial <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></a></li>
      <li class="mobile-account"><a href="{{ route('login') }}">Account preview</a></li>
    </ul>
    <div class="nav-actions">
      <a class="icon-button nav-account" href="{{ route('login') }}" aria-label="Account preview"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg></a>
      <button class="icon-button theme-toggle" type="button" aria-label="Switch to light theme" title="Switch to light theme"><svg class="icon sun" aria-hidden="true"><use href="#icon-sun"/></svg><svg class="icon moon" aria-hidden="true"><use href="#icon-moon"/></svg></button>
      <a class="button button-primary nav-trial" href="{{ route('contact') }}#enquiry">Contact <svg class="icon" aria-hidden="true"><use href="#icon-up-right"/></svg></a>
      <button class="icon-button menu-toggle" id="menu-toggle" type="button" aria-label="Open menu" aria-controls="nav-links" aria-expanded="false"><span></span><span></span></button>
    </div>
  </div>
</nav>
