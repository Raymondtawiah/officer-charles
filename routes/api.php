<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\AiMessageController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Middleware\AdminMiddleware;
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

    Route::middleware(AdminMiddleware::class)->prefix('admin')->group(function () {
        Route::get('/overview', [AdminController::class, 'overview']);

        Route::prefix('users')->group(function () {
            Route::get('/', [AdminController::class, 'users']);
            Route::get('/{userId}', [AdminController::class, 'userProfile']);
        });

        Route::prefix('credits')->group(function () {
            Route::get('/stats', [AdminController::class, 'creditStats']);
            Route::get('/transactions', [AdminController::class, 'creditTransactions']);
            Route::post('/add', [AdminController::class, 'addCredits']);
            Route::post('/remove', [AdminController::class, 'removeCredits']);
        });

        Route::prefix('payments')->group(function () {
            Route::get('/history', [AdminController::class, 'paymentHistory']);
            Route::get('/revenue', [AdminController::class, 'revenueStats']);
        });

        Route::prefix('interviews')->group(function () {
            Route::get('/stats', [AdminController::class, 'interviewStats']);
            Route::get('/performance', [AdminController::class, 'userPerformance']);
        });

        Route::prefix('ai-usage')->group(function () {
            Route::get('/stats', [AdminController::class, 'aiUsageStats']);
        });

        Route::prefix('settings')->group(function () {
            Route::get('/credit-packages', [AdminController::class, 'getCreditPackages']);
            Route::put('/credit-packages', [AdminController::class, 'updateCreditPackages']);
            Route::get('/credit-costs', [AdminController::class, 'getCreditCosts']);
            Route::put('/credit-costs', [AdminController::class, 'updateCreditCosts']);
            Route::get('/free-credits', [AdminController::class, 'getFreeCredits']);
            Route::put('/free-credits', [AdminController::class, 'updateFreeCredits']);
        });
    });
});

Route::post('/stripe/webhook', [CreditController::class, 'webhook']);
Route::post('/paystack/webhook', [PaystackController::class, 'webhook']);

Route::get('/ai/messages', [AiMessageController::class, 'index']);
Route::post('/ai/messages', [AiMessageController::class, 'store']);
Route::post('/ai/restart', [AiMessageController::class, 'restart']);
Route::post('/ai/live-session', [AiMessageController::class, 'liveSession']);
