<?php

use App\Http\Controllers\AiMessageController;
use Illuminate\Support\Facades\Route;

Route::get('/ai/messages', [AiMessageController::class, 'index']);
Route::post('/ai/messages', [AiMessageController::class, 'store']);
