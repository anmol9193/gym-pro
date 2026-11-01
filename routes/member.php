<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/member/dashboard', [DashboardController::class, 'member'])->middleware('permission:member.dashboard')->name('member.dashboard');
