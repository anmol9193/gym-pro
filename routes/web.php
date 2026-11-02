<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LegacyPageController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Middleware\PreventCachedAuthPages;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');
Route::middleware(PreventCachedAuthPages::class)->group(function (): void {
    Route::view('/login', 'portal.login')->middleware('guest')->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('guest')->name('login.store');
    Route::post('/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('logout');
    Route::view('/dashboard', 'portal.dashboard')->middleware(['auth', 'can:access-super-admin'])->name('dashboard');
    Route::middleware(['auth', 'can:access-super-admin'])->group(function (): void {
        Route::view('/profile', 'portal.profile')->name('profile.edit');
        Route::get('/profile/photo', [ProfileController::class, 'photo'])->name('profile.photo');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::view('/change-password', 'portal.change-password')->name('password.edit');
        Route::put('/change-password', [ProfileController::class, 'updatePassword'])
            ->middleware('throttle:6,1')->name('password.update');
    });
});
Route::get('/our-approach', [PageController::class, 'approach'])->name('approach');
Route::get('/membership', [PageController::class, 'membership'])->name('membership');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/programs', [ProgramController::class, 'index'])->name('programs.index');
Route::get('/programs/{slug}', [ProgramController::class, 'show'])
    ->where('slug', '[a-z0-9-]+')->name('programs.show');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [ProductController::class, 'show'])
    ->where('slug', '[a-z0-9-]+')->name('products.show');
Route::get('/{legacy}.html', LegacyPageController::class)
    ->where('legacy', '[a-z0-9-]+')->name('legacy');
