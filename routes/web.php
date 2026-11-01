<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LegacyPageController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProgramController;
use App\Http\Middleware\EnsureAccountActive;
use App\Http\Middleware\EnsurePasswordChanged;
use App\Http\Middleware\NoStorePrivateResponse;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');
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

Route::middleware(['auth', 'auth.session', EnsureAccountActive::class, NoStorePrivateResponse::class])->group(function (): void {
    Route::get('/account', [AccountController::class, 'edit'])->name('account.edit');
    Route::patch('/account', [AccountController::class, 'update'])->name('account.update');
    Route::patch('/account/password', [AccountController::class, 'password'])->middleware('throttle:6,1')->name('account.password');

    Route::middleware(EnsurePasswordChanged::class)->group(function (): void {
        Route::get('/dashboard', [DashboardController::class, 'redirect'])->name('dashboard');
        require __DIR__.'/admin.php';
        require __DIR__.'/receptionist.php';
        require __DIR__.'/trainer.php';
        require __DIR__.'/member.php';
    });
});
