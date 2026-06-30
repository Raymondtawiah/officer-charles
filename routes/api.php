<?php

use App\Http\Controllers\AiMessageController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CreditController;
use App\Http\Controllers\Api\PaystackController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::prefix('credits')->group(function () {
        Route::get('/balance', [CreditController::class, 'balance']);
        Route::get('/history', [CreditController::class, 'history']);
        Route::post('/deduct', [CreditController::class, 'deduct']);
    });

    Route::prefix('stripe')->group(function () {
        Route::post('/purchase', [CreditController::class, 'purchase']);
    });

    Route::prefix('paystack')->group(function () {
        Route::post('/initialize', [PaystackController::class, 'initialize']);
        Route::get('/verify/{reference}', [PaystackController::class, 'verify']);
    });
});

Route::post('/stripe/webhook', [CreditController::class, 'webhook']);
Route::post('/paystack/webhook', [PaystackController::class, 'webhook']);

Route::get('/ai/messages', [AiMessageController::class, 'index']);
Route::post('/ai/messages', [AiMessageController::class, 'store']);
Route::post('/ai/restart', [AiMessageController::class, 'restart']);
Route::post('/ai/live-session', [AiMessageController::class, 'liveSession']);
