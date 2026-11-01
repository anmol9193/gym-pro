<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/trainer/dashboard', [DashboardController::class, 'trainer'])->middleware('permission:trainer.dashboard')->name('trainer.dashboard');
