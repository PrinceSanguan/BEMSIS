<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\GuestMiddleware;
use App\Http\Controllers\Captain\CaptainController;
use App\Http\Controllers\Secretary\SecretaryController;
use App\Http\Controllers\Partner\PartnerController;
use App\Http\Controllers\Resident\ResidentController;
use App\Http\Controllers\Auth\RegisterController;


/*
|--------------------------------------------------------------------------
| This controller handles the homepage and other public-facing pages that don't require authentication
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\HomeController;

Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| This controller handles Login Logic
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Auth\LoginController;

Route::get('login', [LoginController::class, 'index'])->middleware(GuestMiddleware::class)->name('auth.login');
Route::post('login', [LoginController::class, 'store'])->name('auth.login.store');
Route::get('logout', [LoginController::class, 'destroy'])->name('auth.logout');

/*
|--------------------------------------------------------------------------
| This controller handles Register Logic
|--------------------------------------------------------------------------
*/

Route::get('register', [RegisterController::class, 'index'])->middleware(GuestMiddleware::class)->name('auth.register');


/*
|--------------------------------------------------------------------------
| This controller handles Captain Logic
|--------------------------------------------------------------------------
*/

// Dashboard
Route::get('captain/dashboard', [CaptainController::class, 'index'])->name('captain.dashboard');

/*
|--------------------------------------------------------------------------
| This controller handles Secretary Logic
|--------------------------------------------------------------------------
*/

// Dashboard
Route::get('secretary/dashboard', [SecretaryController::class, 'index'])->name('secretary.dashboard');

// Users
Route::get('secretary/users', [SecretaryController::class, 'users'])->name('secretary.users');

// Events
Route::get('secretary/events', [SecretaryController::class, 'events'])->name('secretary.events');

// Attendance
Route::get('secretary/attendance', [SecretaryController::class, 'attendance'])->name('secretary.attendance');

// Content
Route::get('secretary/content', [SecretaryController::class, 'content'])->name('secretary.content');

/*
|--------------------------------------------------------------------------
| This controller handles Partner Logic
|--------------------------------------------------------------------------
*/

// Dashboard
Route::get('partner/dashboard', [PartnerController::class, 'index'])->name('partner.dashboard');

// Events
Route::get('partner/events', [PartnerController::class, 'events'])->name('partner.events');

// Profile
Route::get('partner/profile', [PartnerController::class, 'profile'])->name('partner.profile');

/*
|--------------------------------------------------------------------------
| This controller handles Resident Logic
|--------------------------------------------------------------------------
*/

// Dashboard
Route::get('resident/dashboard', [ResidentController::class, 'index'])->name('resident.dashboard');

// Events
Route::get('resident/events', [ResidentController::class, 'events'])->name('resident.events');

// Attendance
Route::get('resident/attendance', [ResidentController::class, 'attendance'])->name('resident.attendance');

// Certificate
Route::get('resident/certificates', [ResidentController::class, 'certificates'])->name('resident.certificates');

// Feedback
Route::get('resident/feedback', [ResidentController::class, 'feedback'])->name('resident.feedback');

// Profile
Route::get('resident/profile', [ResidentController::class, 'profile'])->name('resident.profile');
