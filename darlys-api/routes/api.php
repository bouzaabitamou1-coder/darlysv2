<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\OperaController;
use App\Http\Controllers\Api\AdminBootstrapController;
use App\Http\Controllers\Api\RefundController;

// Public
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{slug}', [RoomController::class, 'show']);

Route::post('/bookings', [BookingController::class, 'store']);
Route::post('/availability', [AvailabilityController::class, 'check']);
Route::post('/checkout', [CheckoutController::class, 'create']);
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

Route::post('/contact', [ContactController::class, 'store']);

Route::post('/admin/bootstrap', [AdminBootstrapController::class, 'run']);

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Authenticated booking views
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);

    // Admin only (gate-checked inside controllers)
    Route::patch('/bookings/{id}', [BookingController::class, 'update']);
    Route::post('/bookings/{id}/refund', [RefundController::class, 'process']);

    Route::post('/rooms', [RoomController::class, 'store']);
    Route::patch('/rooms/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

    Route::get('/contact', [ContactController::class, 'index']);
    Route::patch('/contact/{id}', [ContactController::class, 'update']);

    Route::get('/admin/opera-logs', [OperaController::class, 'logs']);
    Route::post('/admin/opera-sync', [OperaController::class, 'sync']);
});
