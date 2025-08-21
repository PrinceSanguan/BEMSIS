<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Models\UserDevice;
use App\Mail\LoginNotificationEmail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    /**
     * Display the Login Page
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle the incoming authentication request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Find user by email to check lockout status
        /** @var \App\Models\User|null $user */
        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if ($user) {
            // Check if account is locked
            if ($user->isLocked()) {
                $remainingTime = $user->getRemainingLockoutTime();
                throw ValidationException::withMessages([
                    'auth' => "Account is locked due to too many failed login attempts. Please try again in {$remainingTime} minutes.",
                ]);
            }
        }

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Reset failed attempts on successful login
            /** @var \App\Models\User $user */
            $user->resetFailedAttempts();

            // Handle device tracking and notifications
            $this->handleDeviceTracking($request, $user);


            // Check if user account is approved.
            if ($user->status !== 'approved') {
                Auth::logout();

                $statusMessage = match ($user->status) {
                    'pending' => 'Your account is pending approval from the administrator. Please wait for confirmation.',
                    'declined' => 'Your account has been declined. Please contact the administrator for more information.',
                    default => 'Your account status is not valid. Please contact the administrator.'
                };

                throw ValidationException::withMessages([
                    'auth' => $statusMessage,
                ]);
            }

            $request->session()->regenerate();

            // Check user role and redirect accordingly
            switch ($user->role) {
                case 'captain':
                    return redirect()->route('captain.dashboard');
                case 'secretary':
                    return redirect()->route('secretary.dashboard');
                case 'partner_agency':
                    return redirect()->route('partner.dashboard');
                case 'resident':
                    return redirect()->route('resident.dashboard');
                default:
                    return redirect()->route('home');
            }
        }

        // Authentication failed - increment failed attempts if user exists
        if ($user) {
            $user->incrementFailedAttempts();

            // Check if account is now locked
            if ($user->isLocked()) {
                throw ValidationException::withMessages([
                    'auth' => 'Too many failed login attempts. Your account has been locked for 15 minutes.',
                ]);
            }

            $attemptsLeft = 5 - $user->failed_login_attempts;
            throw ValidationException::withMessages([
                'auth' => "Invalid credentials. {$attemptsLeft} attempts remaining before account lockout.",
            ]);
        }

        // User not found
        throw ValidationException::withMessages([
            'auth' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Destroy an authenticated session.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'You have been logged out successfully.');
    }

    /**
     * Handle device tracking and login notifications
     */
    private function handleDeviceTracking(Request $request, $user)
    {
        $userAgent = $request->userAgent();
        $ipAddress = $request->ip();
        $deviceHash = UserDevice::generateDeviceHash($userAgent, $ipAddress);

        // Check if this device exists
        $device = UserDevice::where('user_id', $user->id)
            ->where('device_hash', $deviceHash)
            ->first();

        if ($device) {
            // Device exists - update last used time
            $device->update(['last_used_at' => now()]);

            // If device is not trusted, send notification again
            if (!$device->is_trusted) {
                $this->sendLoginNotification($user, $device);
            }
        } else {
            // New device detected
            $parsedAgent = UserDevice::parseUserAgent($userAgent);
            $deviceName = $this->generateDeviceName($parsedAgent['platform'], $parsedAgent['browser'], $ipAddress);

            $device = UserDevice::create([
                'user_id' => $user->id,
                'device_hash' => $deviceHash,
                'device_name' => $deviceName,
                'user_agent' => $userAgent,
                'ip_address' => $ipAddress,
                'platform' => $parsedAgent['platform'],
                'browser' => $parsedAgent['browser'],
                'is_trusted' => false,
                'first_used_at' => now(),
                'last_used_at' => now(),
            ]);

            // Check if user has any trusted devices
            $hasTrustedDevices = $user->trustedDevices()->exists();

            if ($hasTrustedDevices) {
                // User has trusted devices, so this is a new device - send notification
                $this->sendLoginNotification($user, $device);
            } else {
                // First device - automatically trust it
                $device->markAsTrusted();
                Log::info('First device automatically trusted', [
                    'user_id' => $user->id,
                    'device_id' => $device->id
                ]);
            }
        }
    }

    /**
     * Send login notification email
     */
    private function sendLoginNotification($user, $device)
    {
        try {
            $verificationToken = $device->generateVerificationToken();

            Mail::to($user->email)->send(new LoginNotificationEmail($user, $device, $verificationToken));

            Log::info('Login notification sent', [
                'user_id' => $user->id,
                'device_id' => $device->id,
                'email' => $user->email
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send login notification', [
                'user_id' => $user->id,
                'device_id' => $device->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Generate a human-readable device name
     */
    private function generateDeviceName($platform, $browser, $ipAddress)
    {
        $platformName = $platform !== 'Unknown' ? $platform : 'Unknown Device';
        $browserName = $browser !== 'Unknown' ? " ($browser)" : '';

        return $platformName . $browserName;
    }
}
