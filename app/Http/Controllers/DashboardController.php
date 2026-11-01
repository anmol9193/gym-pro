<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        return redirect()->route($request->user()->dashboardRoute());
    }

    public function admin(): View
    {
        return view('admin.dashboard', [
            'stats' => ['accounts' => User::count(), 'active' => User::where('status', UserStatus::Active->value)->count(), 'roles' => Role::count(), 'products' => Product::count()],
            'recentAccounts' => User::with('roles')->latest('id')->limit(5)->get(),
            'activity' => AuditLog::with('actor')->latest('id')->limit(5)->get(),
        ]);
    }

    public function receptionist(): View
    {
        return view('workspace.dashboard', ['workspaceRole' => UserRole::Receptionist]);
    }

    public function trainer(): View
    {
        return view('workspace.dashboard', ['workspaceRole' => UserRole::Trainer]);
    }

    public function member(): View
    {
        return view('workspace.dashboard', ['workspaceRole' => UserRole::Member]);
    }
}
