<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/receptionist/dashboard', [DashboardController::class, 'receptionist'])->middleware('permission:receptionist.dashboard')->name('receptionist.dashboard');
