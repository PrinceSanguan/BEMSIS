<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

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

        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Check if user account is approved
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

        // Authentication failed
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
}
