<?php

namespace App\Http\Controllers\Captain;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaptainController extends Controller
{
    /**
     * Display the homepage.
     *
     * @return \Inertia\Response
     */

    public function index()
    {
        return Inertia::render('Captain/Dashboard');
    }
}
