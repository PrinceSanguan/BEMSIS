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

  // Events Management
  Route::get('captain/events', [CaptainController::class, 'events'])->name('captain.events');
  Route::patch('captain/events/{event}/approve', [CaptainController::class, 'approveEvent'])->name('captain.events.approve');
  Route::patch('captain/events/{event}/decline', [CaptainController::class, 'declineEvent'])->name('captain.events.decline');
});

/*
|--------------------------------------------------------------------------
| This controller handles Secretary Logic
|--------------------------------------------------------------------------
*/

Route::middleware(SecretaryMiddleware::class)->group(function () {

  // Dashboard
  Route::get('secretary/dashboard', [SecretaryController::class, 'index'])->name('secretary.dashboard');

  // Users Management
  Route::get('secretary/users', [SecretaryController::class, 'users'])->name('secretary.users');
  Route::patch('secretary/users/{user}/approve', [SecretaryController::class, 'approveUser'])->name('secretary.users.approve');
  Route::patch('secretary/users/{user}/decline', [SecretaryController::class, 'declineUser'])->name('secretary.users.decline');

  // Events Management
  Route::get('secretary/events', [SecretaryController::class, 'events'])->name('secretary.events');
  Route::post('secretary/events', [SecretaryController::class, 'createEvent'])->name('secretary.events.create');
  Route::get('secretary/events/{event}/attendees', [SecretaryController::class, 'eventAttendees'])->name('secretary.events.attendees');
  Route::post('secretary/events/{event}/assign-qr', [SecretaryController::class, 'assignQrCodes'])->name('secretary.events.assign-qr');
  Route::post('secretary/events/{event}/assign-certificates', [SecretaryController::class, 'assignCertificates'])->name('secretary.events.assign-certificates');

  // QR Code Scanning
  Route::post('secretary/scan-qr', [SecretaryController::class, 'scanQrCode'])->name('secretary.scan-qr');

  // Attendance Management
  Route::get('secretary/attendance', [SecretaryController::class, 'attendance'])->name('secretary.attendance');

  // Feedback Review
  Route::get('secretary/feedback', [SecretaryController::class, 'feedback'])->name('secretary.feedback');

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

  // Events Management
  Route::get('partner/events', [PartnerController::class, 'events'])->name('partner.events');
  Route::post('partner/events', [PartnerController::class, 'createEvent'])->name('partner.events.create');

  // Profile
  Route::get('partner/profile', [PartnerController::class, 'profile'])->name('partner.profile');
  Route::put('partner/profile', [PartnerController::class, 'updateProfile'])->name('partner.profile.update');
  Route::post('partner/profile/password', [PartnerController::class, 'changePassword'])->name('partner.profile.password');
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
  Route::get('resident/certificates/{certificate}/download', [ResidentController::class, 'downloadCertificate'])->name('resident.certificates.download');

  // Feedback
  Route::get('resident/feedback', [ResidentController::class, 'feedback'])->name('resident.feedback');
  Route::post('resident/feedback', [ResidentController::class, 'submitFeedback'])->name('resident.feedback.submit');

  // Profile
  Route::get('resident/profile', [ResidentController::class, 'profile'])->name('resident.profile');
  Route::put('resident/profile', [ResidentController::class, 'updateProfile'])->name('resident.profile.update');
});
