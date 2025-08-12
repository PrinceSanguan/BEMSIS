<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResidentController extends Controller
{
    public function index()
    {
        return Inertia::render('Resident/Dashboard');
    }

    public function events()
    {
        return Inertia::render('Resident/Events');
    }

    public function attendance()
    {
        return Inertia::render('Resident/Attendance');
    }

    public function certificates()
    {
        return Inertia::render('Resident/Certificates');
    }

    public function feedback()
    {
        return Inertia::render('Resident/Feedback');
    }

    public function profile()
    {
        return Inertia::render('Resident/Profile');
    }
}
