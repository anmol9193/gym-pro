<?php

use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'admin'])->middleware('permission:admin.dashboard')->name('dashboard');
    Route::resource('users', UserController::class)->except(['show', 'destroy']);
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:roles.view')->name('roles.index');
    Route::patch('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:permissions.manage')->name('roles.update');
    Route::view('/settings', 'admin.settings')->middleware('permission:settings.manage')->name('settings');
});
