<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartnerController extends Controller
{
    public function index()
    {
        return Inertia::render('Partner/Dashboard');
    }

    public function events()
    {
        return Inertia::render('Partner/Events');
    }

    public function profile()
    {
        return Inertia::render('Partner/Profile');
    }
}
