<?php

use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Captain\CaptainController;
use App\Http\Controllers\Secretary\SecretaryController;
use App\Http\Controllers\Partner\PartnerController;
use App\Http\Controllers\Resident\ResidentController;
use App\Http\Controllers\Auth\RegisterController;

// Middleware
use App\Http\Middleware\CaptainMiddleware;
use App\Http\Middleware\SecretaryMiddleware;
use App\Http\Middleware\PartnerMiddleware;
use App\Http\Middleware\ResidentMiddleware;


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

Route::get('login', [LoginController::class, 'index'])->name('auth.login');
Route::post('login', [LoginController::class, 'store'])->name('auth.login.store');
Route::get('logout', [LoginController::class, 'destroy'])->name('auth.logout');


/*
|--------------------------------------------------------------------------
| This controller handles Register Logic
|--------------------------------------------------------------------------
*/

Route::get('register', [RegisterController::class, 'index'])->name('auth.register');
Route::post('register', [RegisterController::class, 'store'])->name('auth.register.store');


/*
|--------------------------------------------------------------------------
| This controller handles Captain Logic
|--------------------------------------------------------------------------
*/

Route::middleware(CaptainMiddleware::class)->group(function () {
  // Dashboard
  Route::get('captain/dashboard', [CaptainController::class, 'index'])->name('captain.dashboard');
});

/*
|--------------------------------------------------------------------------
| This controller handles Secretary Logic
|--------------------------------------------------------------------------
*/

Route::middleware(SecretaryMiddleware::class)->group(function () {

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
});
/*
|--------------------------------------------------------------------------
| This controller handles Partner Logic
|--------------------------------------------------------------------------
*/

Route::middleware(PartnerMiddleware::class)->group(function () {
  // Dashboard
  Route::get('partner/dashboard', [PartnerController::class, 'index'])->name('partner.dashboard');

  // Events
  Route::get('partner/events', [PartnerController::class, 'events'])->name('partner.events');

  // Profile
  Route::get('partner/profile', [PartnerController::class, 'profile'])->name('partner.profile');
});

/*
|--------------------------------------------------------------------------
| This controller handles Resident Logic
|--------------------------------------------------------------------------
*/

Route::middleware(ResidentMiddleware::class)->group(function () {
  // Dashboard
  Route::get('resident/dashboard', [ResidentController::class, 'index'])->name('resident.dashboard');

  // Events
  Route::get('resident/events', [ResidentController::class, 'events'])->name('resident.events');
  Route::post('resident/events/{event}/register', [ResidentController::class, 'registerForEvent'])->name('resident.events.register');
  Route::delete('resident/events/{event}/unregister', [ResidentController::class, 'unregisterFromEvent'])->name('resident.events.unregister');

  // Attendance
  Route::get('resident/attendance', [ResidentController::class, 'attendance'])->name('resident.attendance');
  Route::get('resident/attendance/{attendance}/qr-code', [ResidentController::class, 'generateQRCode'])->name('resident.attendance.qr');

  // Certificate
  Route::get('resident/certificates', [ResidentController::class, 'certificates'])->name('resident.certificates');

  // Feedback
  Route::get('resident/feedback', [ResidentController::class, 'feedback'])->name('resident.feedback');
  Route::post('resident/feedback', [ResidentController::class, 'submitFeedback'])->name('resident.feedback.submit');

  // Profile
  Route::get('resident/profile', [ResidentController::class, 'profile'])->name('resident.profile');
  Route::put('resident/profile', [ResidentController::class, 'updateProfile'])->name('resident.profile.update');
});
