<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Purok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PartnerController extends Controller
{
    /**
     * Display the partner dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $stats = [
            'myEvents' => Event::where('created_by', Auth::id())->count(),
            'pendingEvents' => Event::where('created_by', Auth::id())->where('status', 'pending')->count(),
            'approvedEvents' => Event::where('created_by', Auth::id())->where('status', 'approved')->count(),
            'declinedEvents' => Event::where('created_by', Auth::id())->where('status', 'declined')->count(),
        ];

        return Inertia::render('Partner/Dashboard', [
            'stats' => $stats
        ]);
    }

    /**
     * Display events and allow creation/management.
     *
     * @return \Inertia\Response
     */
    public function events()
    {
        $puroks = Purok::all();
        $events = Event::where('created_by', Auth::id())
            ->with(['purok', 'attendances'])
            ->latest()
            ->get()
            ->map(function ($event) {
                $event->confirmed_attendees_count = $event->attendances()
                    ->where('status', 'confirmed')->count();
                return $event;
            });

        return Inertia::render('Partner/Events', [
            'events' => $events,
            'puroks' => $puroks
        ]);
    }

    /**
     * Create a new event.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function createEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'purok_id' => 'nullable|exists:puroks,id',
            'has_certificate' => 'boolean',
            'target_all_residents' => 'boolean',
        ]);

        Event::create([
            'created_by' => Auth::id(),
            'purok_id' => $request->purok_id,
            'title' => $request->title,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'has_certificate' => $request->has_certificate ?? false,
            'status' => $request->input('draft', false) ? 'pending' : 'pending', // Still requires approval but partner can create directly
            'target_all_residents' => $request->input('target_all_residents', false),
        ]);

        return back()->with('success', 'Event created successfully! Awaiting captain approval.');
    }

    /**
     * Display the partner profile.
     *
     * @return \Inertia\Response
     */
    public function profile()
    {
        return Inertia::render('Partner/Profile', [
            'user' => Auth::user()
        ]);
    }
}
