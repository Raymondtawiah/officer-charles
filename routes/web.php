<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('welcome', ['messages' => []]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('visa-ai', 'visa-ai', ['messages' => []])->name('visa-ai');
    Route::inertia('credits/success', 'credits/success')->name('credits.success');
    Route::inertia('credits/cancel', 'credits/cancel')->name('credits.cancel');
});

require __DIR__.'/settings.php';
