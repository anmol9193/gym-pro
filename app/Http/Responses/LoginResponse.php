<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $destination = $request->user()->must_change_password
            ? route('account.edit')
            : route($request->user()->dashboardRoute());

        return $request->wantsJson()
            ? response()->json(['redirect' => $destination])
            : redirect()->to($destination);
    }
}
