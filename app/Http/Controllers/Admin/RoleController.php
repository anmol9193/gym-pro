<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\RolePermissionService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): View
    {
        return view('admin.roles', ['roles' => Role::with('permissions')->withCount('users')->orderBy('id')->get(), 'permissions' => UserRole::allPermissions()]);
    }

    public function update(Request $request, Role $role, RolePermissionService $permissions): RedirectResponse
    {
        $data = $request->validate(['permissions' => ['sometimes', 'array'], 'permissions.*' => ['string', Rule::in(UserRole::allPermissions())]]);
        $permissions->update($request->user(), $role, $data['permissions'] ?? [], $request->ip());

        return back()->with('status', 'Role permissions updated.');
    }
}
