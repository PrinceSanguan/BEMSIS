<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    // Show the registration form
    public function index()
    {
        $puroks = \App\Models\Purok::all();
        return Inertia::render('Auth/Register', [
            'puroks' => $puroks
        ]);
    }

    // Store registration data
    public function store(Request $request)
    {
        // Comprehensive validation
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone|regex:/^09\d{9}$/',
            'password' => 'required|min:6|confirmed',
            'role' => 'required|in:resident,partner_agency,secretary,captain',
            'purok_id' => 'required_if:role,resident|nullable|exists:puroks,id',
        ]);

        // Create a new user
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'pending', // Requires approval
            'purok_id' => $request->role === 'resident' ? $request->purok_id : null,
        ]);

        // Redirect to login or dashboard
        return redirect()->route('auth.login')->with('success', 'Account created successfully! Please wait for approval from the administrator.');
    }
}
