<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserStatusController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// User status routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users/{user}/status', [UserStatusController::class, 'getUserStatus']);
    Route::post('/users/status/bulk', [UserStatusController::class, 'getUsersStatus']);
    Route::post('/user/activity', [UserStatusController::class, 'updateActivity']);
    Route::get('/users/online/count', [UserStatusController::class, 'getOnlineUsersCount']);
});
