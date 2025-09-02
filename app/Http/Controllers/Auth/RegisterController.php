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
        // Complete Globe/TM valid prefixes
        $globeTMPrefixes = [
            // Globe prefixes
            '275', // Added missing Globe prefix
            '670',
            '671',
            '672',
            '673',
            '674',
            '808',
            '809',
            '810',
            '811',
            '813',
            '816',
            '817',
            '900',
            '901',
            '902',
            '903',
            '904',
            '905',
            '906',
            '907',
            '908',
            '912',
            '913',
            '915',
            '916',
            '917',
            '918',
            '919',
            '920',
            '921',
            '922',
            '923',
            '924',
            '925',
            '926',
            '927',
            '928',
            '929',
            '930',
            '931',
            '932',
            '933',
            '934',
            '935',
            '936',
            '938',
            '939',
            '945',
            '946',
            '947',
            '948',
            '949',
            '950',
            '951',
            '952',
            '953',
            '954',
            '955',
            '956',
            '957',
            '958',
            '959',
            '965',
            '966',
            '967',
            '968',
            '969',
            '970',
            '973',
            '974',
            '975',
            '976',
            '977',
            '978',
            '979',
            '992',
            '993',
            '994',
            '995',
            '996',
            '997',
            '998',
            // TM (Touch Mobile) prefixes  
            '351',
            '352',
            '353',
            '354',
            '355',
            '356',
            '357',
            '893',
            '894',
            '999'
        ];

        // Password policy validation rules
        $passwordRules = [
            'required',
            'string',
            'min:8',
            'max:12',
            'confirmed',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]).*$/',
        ];

        // Base validation rules
        $baseRules = [
            'email' => 'required|email|unique:users,email',
            'password' => $passwordRules,
            'role' => 'required|in:resident,partner_agency',
        ];

        // Phone validation function
        $phoneValidation = function ($attribute, $value, $fail) use ($globeTMPrefixes) {
            // Check basic format first
            if (!preg_match('/^639\d{9}$/', $value)) {
                $fail('Phone number must be in format 639XXXXXXXXX.');
                return;
            }

            // Extract the mobile number part (remove 639 prefix)
            $mobileNumber = substr($value, 3);
            $prefix = substr($mobileNumber, 0, 3);

            if (!in_array($prefix, $globeTMPrefixes)) {
                $fail('Only Globe and TM numbers are accepted.');
                return;
            }

            // Check if phone number already exists
            if (\App\Models\User::where('phone', $value)->exists()) {
                $fail('This phone number is already registered in the system.');
                return;
            }
        };

        // Role-specific validation
        if ($request->role === 'resident') {
            $rules = array_merge($baseRules, [
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'last_name' => 'required|string|max:255',
                'extension' => 'nullable|string|max:10',
                'place_of_birth' => 'required|string|max:255',
                'date_of_birth' => 'required|date|before:' . now()->subYears(13)->format('Y-m-d'),
                'age' => 'required|integer|min:13|max:120',
                'sex' => 'required|in:Male,Female',
                'civil_status' => 'required|string|max:255',
                'citizenship' => 'required|string|max:255',
                'occupation' => 'required|string|max:255',
                'special_notes' => 'nullable|string',
                'purok_id' => 'required|exists:puroks,id',
                'phone' => ['required', 'string', $phoneValidation],
                'valid_id' => 'required|file|mimes:jpeg,jpg,png,pdf|max:5120', // 5MB max
            ]);
        } else { // partner_agency
            $rules = array_merge($baseRules, [
                'agency_name' => 'required|string|max:255',
                'representative_first_name' => 'required|string|max:255',
                'representative_last_name' => 'required|string|max:255',
                'agency_address' => 'nullable|string|max:500',
                'agency_phone' => ['required', 'string', $phoneValidation],
                'agency_valid_id' => 'required|file|mimes:jpeg,jpg,png,pdf|max:5120', // 5MB max
            ]);
        }

        $validated = $request->validate($rules, [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'date_of_birth.before' => 'You must be at least 13 years old to register.',
            'age.min' => 'You must be at least 13 years old to register.',
        ]);

        // Handle file uploads
        $validIdPath = null;
        $agencyValidIdPath = null;

        if ($request->role === 'resident' && $request->hasFile('valid_id')) {
            $validIdPath = $request->file('valid_id')->store('resident_ids', 'public');
        } elseif ($request->role === 'partner_agency' && $request->hasFile('agency_valid_id')) {
            $agencyValidIdPath = $request->file('agency_valid_id')->store('agency_ids', 'public');
        }

        // Prepare user data based on role
        $userData = [
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'pending',
        ];

        if ($validated['role'] === 'resident') {
            $userData = array_merge($userData, [
                'name' => trim($validated['first_name'] . ' ' . ($validated['middle_name'] ?? '') . ' ' . $validated['last_name'] . ' ' . ($validated['extension'] === 'none' ? '' : ($validated['extension'] ?? ''))),
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name' => $validated['last_name'],
                'extension' => $validated['extension'] === 'none' ? null : $validated['extension'],
                'place_of_birth' => $validated['place_of_birth'],
                'date_of_birth' => $validated['date_of_birth'],
                'age' => $validated['age'],
                'sex' => $validated['sex'],
                'civil_status' => $validated['civil_status'],
                'citizenship' => $validated['citizenship'],
                'occupation' => $validated['occupation'],
                'special_notes' => $validated['special_notes'],
                'purok_id' => $validated['purok_id'],
                'phone' => $validated['phone'],
                'valid_id_path' => $validIdPath,
            ]);
        } else { // partner_agency
            $userData = array_merge($userData, [
                'name' => $validated['agency_name'],
                'agency_name' => $validated['agency_name'],
                'representative_first_name' => $validated['representative_first_name'],
                'representative_last_name' => $validated['representative_last_name'],
                'agency_address' => $validated['agency_address'],
                'phone' => $validated['agency_phone'],
                'agency_valid_id_path' => $agencyValidIdPath,
            ]);
        }

        User::create($userData);

        // Redirect to login or dashboard
        return redirect()->route('auth.login')->with('success', 'Account created successfully! Please wait for approval from the Secretary.');
    }
}
