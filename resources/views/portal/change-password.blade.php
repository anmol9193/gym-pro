@extends('layouts.account')
@section('title', 'Change password')
@section('account-heading', 'Change password')
@section('account-intro', 'Choose a new password for your account.')
@section('account-content')
<header class="fh-settings-card-heading"><span class="fh-settings-section-icon"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m4 5v2"/></svg></span><div><h3>Password &amp; security</h3><p>Update the password that protects your account.</p></div></header>
<form action="{{ route('password.update') }}" method="POST" class="fh-settings-form">
    @csrf @method('PUT')
    <div class="bp-field"><label for="current_password">Current password</label><input id="current_password" name="current_password" type="password" required maxlength="128" autocomplete="current-password" @error('current_password') aria-invalid="true" aria-describedby="current-password-error" @enderror>@error('current_password')<small class="bp-field-error" id="current-password-error" role="alert">{{ $message }}</small>@enderror</div>
    <div class="bp-field"><label for="password">New password</label><input id="password" name="password" type="password" required minlength="8" maxlength="128" autocomplete="new-password" aria-describedby="new-password-hint @error('password') new-password-error @enderror" @error('password') aria-invalid="true" @enderror><small class="fh-settings-hint" id="new-password-hint">Use at least 8 characters and choose a different password.</small>@error('password')<small class="bp-field-error" id="new-password-error" role="alert">{{ $message }}</small>@enderror</div>
    <div class="bp-field"><label for="password_confirmation">Confirm new password</label><input id="password_confirmation" name="password_confirmation" type="password" required minlength="8" maxlength="128" autocomplete="new-password"></div>
    <div class="fh-settings-actions"><button class="button button-primary" type="submit">Change password <svg class="icon"><use href="#bp-check"/></svg></button><a href="{{ route('dashboard') }}" class="text-link">Cancel</a></div>
</form>
@endsection
