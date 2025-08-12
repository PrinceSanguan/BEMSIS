<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecretaryController extends Controller
{
    public function index()
    {
        return Inertia::render('Secretary/Dashboard');
    }

    public function users()
    {
        return Inertia::render('Secretary/Users');
    }

    public function events()
    {
        return Inertia::render('Secretary/Events');
    }

    public function attendance()
    {
        return Inertia::render('Secretary/Attendance');
    }

    public function content()
    {
        return Inertia::render('Secretary/Content');
    }
}
