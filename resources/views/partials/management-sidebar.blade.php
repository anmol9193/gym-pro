<aside class="mg-sidebar" id="management-sidebar" aria-label="Workspace navigation" x-ref="sidebar" :inert="isMobile && !sidebarOpen" :aria-hidden="(isMobile && !sidebarOpen).toString()" :role="isMobile && sidebarOpen ? 'dialog' : null" :aria-modal="isMobile && sidebarOpen ? 'true' : null">
    <div class="mg-sidebar-brand"><a class="mg-brand" href="{{ route('dashboard') }}"><span class="mg-brand-mark"><svg><use href="#mg-bolt"/></svg></span><span>GYM<span class="mg-accent">PRO</span><small>GYM MANAGEMENT</small></span></a><button class="mg-icon-button mg-menu-button" type="button" @click="closeSidebar()" aria-label="Close navigation"><svg><use href="#mg-close"/></svg></button></div>
    <div class="mg-workspace-label"><span class="mg-status-dot"></span> {{ auth()->user()->primaryRole()?->label() ?? 'Your account' }}</div>
    <nav class="mg-sidebar-nav"><span class="mg-nav-label">WORKSPACE</span>
        @foreach(['admin.dashboard' => ['Overview', 'mg-grid'], 'receptionist.dashboard' => ['Reception desk', 'mg-users'], 'trainer.dashboard' => ['Trainer workspace', 'mg-grid'], 'member.dashboard' => ['My workspace', 'mg-grid']] as $ability => [$label, $icon])
            @can($ability)<a href="{{ route($ability) }}" @if(request()->routeIs($ability)) aria-current="page" @endif><svg><use href="#{{ $icon }}"/></svg>{{ $label }}</a>@endcan
        @endforeach
        @can('users.view')<span class="mg-nav-label">ACCESS & ADMINISTRATION</span><a href="{{ route('admin.users.index') }}" @if(request()->routeIs('admin.users.*')) aria-current="page" @endif><svg><use href="#mg-users"/></svg>Accounts</a>@endcan
        @can('roles.view')<a href="{{ route('admin.roles.index') }}" @if(request()->routeIs('admin.roles.*')) aria-current="page" @endif><svg><use href="#mg-shield"/></svg>Roles & permissions</a>@endcan
        @can('settings.manage')<a href="{{ route('admin.settings') }}" @if(request()->routeIs('admin.settings')) aria-current="page" @endif><svg><use href="#mg-settings"/></svg>Configuration</a>@endcan
        <span class="mg-nav-label">YOUR ACCOUNT</span><a href="{{ route('account.edit') }}" @if(request()->routeIs('account.*')) aria-current="page" @endif><svg><use href="#mg-user"/></svg>Profile & security</a>
        <a href="{{ route('home') }}"><svg><use href="#mg-external"/></svg>Public website</a>
    </nav>
    <div class="mg-sidebar-bottom"><div class="mg-sidebar-note"><svg><use href="#mg-lock"/></svg><span>Signed in to your<br><strong>gym workspace.</strong></span></div><form method="POST" action="{{ route('logout') }}">@csrf<button class="mg-logout" type="submit"><svg><use href="#mg-logout"/></svg>Sign out</button></form></div>
</aside>
