<button class="bp-sidebar-backdrop" data-menu-backdrop type="button" aria-label="Close navigation" hidden></button>
<aside class="bp-sidebar fh-sidebar" id="portal-sidebar" aria-label="Dashboard navigation">
<div class="bp-sidebar-top">@include('partials.portal-brand')<button class="icon-button bp-menu-toggle" data-menu-close type="button" aria-label="Close navigation" hidden><svg class="icon"><use href="#bp-close"/></svg></button></div>
<nav class="bp-sidebar-nav">
<a href="{{ request()->routeIs('dashboard') ? '#overview' : route('dashboard') }}" @if(request()->routeIs('dashboard')) aria-current="page" data-section-link @endif><svg class="icon"><use href="#bp-grid"/></svg>Dashboard</a>
<a href="{{ request()->routeIs('dashboard') ? '#activity' : route('dashboard').'#activity' }}" @if(request()->routeIs('dashboard')) data-section-link @endif><svg class="icon"><use href="#fh-run"/></svg>Workout Statistic</a>
<a href="{{ request()->routeIs('dashboard') ? '#plan' : route('dashboard').'#plan' }}" @if(request()->routeIs('dashboard')) data-section-link @endif><svg class="icon"><use href="#bp-dumbbell"/></svg>Workout Plan</a>
<a href="{{ route('programs.index') }}"><svg class="icon"><use href="#bp-trend"/></svg>Training Programs</a>
<a href="{{ request()->routeIs('dashboard') ? '#diet' : route('dashboard').'#diet' }}" @if(request()->routeIs('dashboard')) data-section-link @endif><svg class="icon"><use href="#fh-food"/></svg>Food Menu</a>
<a href="{{ request()->routeIs('dashboard') ? '#trainers' : route('dashboard').'#trainers' }}" @if(request()->routeIs('dashboard')) data-section-link @endif><svg class="icon"><use href="#bp-users"/></svg>Personal Trainers</a>
<a href="{{ request()->routeIs('dashboard') ? '#schedule' : route('dashboard').'#schedule' }}" @if(request()->routeIs('dashboard')) data-section-link @endif><svg class="icon"><use href="#bp-check"/></svg>Class Schedule</a>
<a href="{{ route('contact') }}"><svg class="icon"><use href="#fh-message"/></svg>Message</a>
<span class="bp-nav-label">Your Gym</span>
<a href="{{ route('home') }}"><svg class="icon"><use href="#bp-grid"/></svg>View Website</a>
<a href="{{ route('contact') }}#enquiry"><svg class="icon"><use href="#fh-message"/></svg>Contact</a>
<a href="{{ request()->routeIs('dashboard') ? '#schedule' : route('dashboard').'#schedule' }}" @if(request()->routeIs('dashboard')) data-section-link @endif><svg class="icon"><use href="#bp-calendar"/></svg>Calendar</a>
<a href="{{ route('products.index') }}"><svg class="icon"><use href="#fh-shop"/></svg>Shop</a>
</nav>
<div class="bp-sidebar-bottom"><div class="fh-account">@include('partials.account-avatar')<div><strong>{{ auth()->user()->name }}</strong><small>Super administrator</small></div><form action="{{ route('logout') }}" method="POST">@csrf<button class="bp-exit-link" type="submit" aria-label="Sign out" title="Sign out"><svg class="icon"><use href="#bp-exit"/></svg><span class="bp-sr-only">Sign out</span></button></form></div></div>
</aside>
