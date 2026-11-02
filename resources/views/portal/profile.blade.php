@extends('layouts.account')
@section('title', 'Your profile')
@section('account-heading', 'Your profile')
@section('account-intro', 'Keep your account details up to date.')
@section('account-content')
<header class="fh-settings-card-heading"><span class="fh-settings-section-icon"><svg class="icon" aria-hidden="true"><use href="#bp-users"/></svg></span><div><h3>Personal information</h3><p>Manage the details you use to sign in.</p></div></header>
<form action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data" class="fh-settings-form">
    @csrf @method('PATCH')
    <div class="fh-photo-upload">
        <div class="fh-photo-preview" data-avatar-preview>@include('partials.account-avatar')</div>
        <div class="fh-photo-controls"><strong>Profile photo</strong><p id="avatar-hint">JPG, PNG or WebP. Maximum 2 MB.</p><label class="button button-outline fh-photo-picker" for="avatar"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5"/></svg>Upload photo</label><input class="bp-sr-only" type="file" id="avatar" name="avatar" accept="image/jpeg,image/png,image/webp" aria-describedby="avatar-hint avatar-status @error('avatar') avatar-error @enderror" @error('avatar') aria-invalid="true" @enderror><span id="avatar-status" class="fh-photo-status" role="status"></span>
        @if(auth()->user()->avatar_path)<label class="fh-photo-remove"><input type="checkbox" name="remove_avatar" value="1" @checked(old('remove_avatar'))>Remove current photo</label>@endif
        @error('avatar')<small class="bp-field-error" id="avatar-error" role="alert">{{ $message }}</small>@enderror
        </div>
    </div>
    <div class="bp-field"><label for="name">Full name</label><input id="name" name="name" type="text" value="{{ old('name', auth()->user()->name) }}" required maxlength="80" autocomplete="name" @error('name') aria-invalid="true" aria-describedby="name-error" @enderror>@error('name')<small class="bp-field-error" id="name-error" role="alert">{{ $message }}</small>@enderror</div>
    <div class="bp-field"><label for="email">Email address</label><input id="email" name="email" type="email" value="{{ old('email', auth()->user()->email) }}" required maxlength="254" autocomplete="email" @error('email') aria-invalid="true" aria-describedby="email-error" @enderror>@error('email')<small class="bp-field-error" id="email-error" role="alert">{{ $message }}</small>@enderror</div>
    <div class="fh-settings-actions"><button class="button button-primary" type="submit">Save profile <svg class="icon"><use href="#bp-check"/></svg></button><a href="{{ route('dashboard') }}" class="text-link">Cancel</a></div>
</form>
@endsection
