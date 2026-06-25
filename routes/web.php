<?php

use Illuminate\Support\Facades\Route;

<<<<<<< HEAD
Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('visa-ai', 'VisaAi')->name('visa-ai');
});
=======
Route::get('/', function () {
    return inertia('welcome', ['messages' => []]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('visa-ai', 'visa-ai', ['messages' => []])->name('visa-ai');
});

require __DIR__.'/settings.php';
>>>>>>> origin/development
