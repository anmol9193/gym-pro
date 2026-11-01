<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountAccessRequest;
use App\Models\User;
use App\Services\AccountService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): View
    {
        Gate::authorize('viewAny', User::class);
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:80'], 'role' => ['nullable', Rule::enum(UserRole::class)], 'status' => ['nullable', Rule::enum(UserStatus::class)]]);
        $users = User::with('roles')
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($q) => $q->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%')))
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->role($role))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest('id')->paginate(12)->withQueryString();

        return view('admin.users.index', ['users' => $users, 'filters' => $filters]);
    }

    public function create(Request $request): View
    {
        Gate::authorize('create', User::class);

        return view('admin.users.create', ['roles' => $this->assignableRoles($request->user())]);
    }

    public function store(StoreAccountRequest $request, AccountService $accounts): RedirectResponse
    {
        $accounts->create($request->user(), $request->validated(), $request->ip());

        return redirect()->route('admin.users.index')->with('status', 'Account created. Share the initial password privately; a password change is required at first sign-in.');
    }

    public function edit(Request $request, User $user): View
    {
        Gate::authorize('update', $user);

        return view('admin.users.edit', ['target' => $user->load('roles'), 'roles' => $this->assignableRoles($request->user())]);
    }

    public function update(UpdateAccountAccessRequest $request, User $user, AccountService $accounts): RedirectResponse
    {
        $accounts->updateAccess($request->user(), $user, $request->validated(), $request->ip());

        return redirect()->route('admin.users.index')->with('status', 'Account access updated. Existing database sessions have been revoked.');
    }

    private function assignableRoles(User $actor): array
    {
        return array_filter(UserRole::cases(), fn (UserRole $role): bool => $role !== UserRole::SuperAdmin || $actor->hasRole(UserRole::SuperAdmin->value));
    }
}
