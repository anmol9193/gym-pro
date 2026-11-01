<?php

use App\Http\Controllers\LegacyPageController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProgramController;
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
