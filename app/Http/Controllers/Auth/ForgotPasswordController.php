<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Mail\OtpMail;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    public function index()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendOtp(Request $request)
    {
        Log::info('Forgot password request initiated', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->with('error', 'There is no registered account with this email address.');
        }

        if ($user->status !== 'approved') {
            $statusMessage = match ($user->status) {
                'pending' => 'Your email is not yet approved by the secretary. Please wait for approval.',
                'declined' => 'Your account has been declined. Please contact the administrator.',
                default => 'Your account status is not valid. Please contact the administrator.'
            };

            return back()->with('error', $statusMessage);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Clean old OTPs for this email
        DB::table('otp_tokens')->where('email', $request->email)->delete();

        // Store OTP with 10-minute expiration
        try {
            DB::table('otp_tokens')->insert([
                'email' => $request->email,
                'otp' => $otp,
                'expires_at' => now()->addMinutes(10),
                'created_at' => now(),
            ]);

            Log::info('OTP stored in database successfully', [
                'email' => $request->email,
                'otp' => $otp,
                'expires_at' => now()->addMinutes(10)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store OTP in database', [
                'email' => $request->email,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Database error occurred. Please try again.');
        }

        // Send OTP email
        try {
            Log::info('Attempting to send OTP email', [
                'email' => $request->email,
                'otp' => $otp,
                'user_name' => $user->name
            ]);

            Mail::to($request->email)->send(new OtpMail($otp, $user->name));

            Log::info('OTP email sent successfully', [
                'email' => $request->email
            ]);

            return redirect()->route('auth.verify-otp')->with([
                'success' => 'OTP sent successfully! Please check your email.',
                'email' => $request->email
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email', [
                'email' => $request->email,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine()
            ]);

            return back()->with('error', 'Failed to send OTP. Please try again. Error: ' . $e->getMessage());
        }
    }

    public function showVerifyOtp(Request $request)
    {
        $email = session('email') ?? $request->email;

        if (!$email) {
            return redirect()->route('auth.forgot-password')->with('error', 'Session expired. Please start again.');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $email
        ]);
    }

    public function verifyOtp(Request $request)
    {
        Log::info('OTP verification attempt', [
            'email' => $request->email,
            'otp' => $request->otp,
            'ip' => $request->ip()
        ]);

        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $otpRecord = DB::table('otp_tokens')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$otpRecord) {
            throw ValidationException::withMessages([
                'otp' => 'Invalid OTP code.',
            ]);
        }

        if (now()->isAfter($otpRecord->expires_at)) {
            // Clean expired OTP
            DB::table('otp_tokens')->where('email', $request->email)->delete();

            throw ValidationException::withMessages([
                'otp' => 'OTP has expired. Please request a new one.',
            ]);
        }

        // OTP is valid, clean it and proceed to password reset
        DB::table('otp_tokens')->where('email', $request->email)->delete();

        return redirect()->route('auth.reset-password')->with([
            'success' => 'OTP verified successfully!',
            'email' => $request->email
        ]);
    }

    public function showResetPassword(Request $request)
    {
        $email = session('email') ?? $request->email;

        if (!$email) {
            return redirect()->route('auth.forgot-password')->with('error', 'Session expired. Please start again.');
        }

        return Inertia::render('Auth/ResetPassword', [
            'email' => $email
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:12',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/',
                'confirmed'
            ],
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return redirect()->route('auth.forgot-password')->with('error', 'User not found.');
        }

        // Update password
        try {
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            Log::info('Password updated successfully', [
                'email' => $request->email,
                'user_id' => $user->id
            ]);

            return redirect()->route('auth.login')->with('success', 'Password updated successfully! You can now login with your new password.');
        } catch (\Exception $e) {
            Log::error('Failed to update password', [
                'email' => $request->email,
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to update password. Please try again.');
        }
    }
}
