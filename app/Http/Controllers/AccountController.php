<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Services\AccountService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    public function edit(Request $request): View
    {
        return view('account.edit', ['user' => $request->user()]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[+0-9\s().-]+$/'],
        ]);
        $request->user()->forceFill($data)->save();

        return back()->with('status', 'Your account details have been updated.');
    }

    public function password(ChangePasswordRequest $request, AccountService $accounts): RedirectResponse
    {
        $accounts->changePassword($request->user(), $request->validated('password'), $request->ip());
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('status', 'Your password has been updated. Sign in with your new password.');
    }
}
