<?php

use App\Models\AiMessage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $messages = AiMessage::orderBy('created_at', 'asc')
        ->get(['id', 'role', 'content', 'agent_id', 'created_at']);

    return inertia('welcome', ['messages' => $messages]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';