<?php

namespace App\Http\Controllers\Captain;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaptainController extends Controller
{
    /**
     * Display the captain dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $stats = [
            'pendingEvents' => Event::where('status', 'pending')->count(),
            'approvedEvents' => Event::where('status', 'approved')->count(),
            'declinedEvents' => Event::where('status', 'declined')->count(),
            'totalEvents' => Event::count(),
        ];

        return Inertia::render('Captain/Dashboard', [
            'stats' => $stats
        ]);
    }

    /**
     * Display pending events for approval.
     *
     * @return \Inertia\Response
     */
    public function events()
    {
        $pendingEvents = Event::where('status', 'pending')
            ->with(['creator', 'purok'])
            ->latest()
            ->get()
            ->map(function ($event) {
                $event->creator_role = $event->creator->role;
                return $event;
            });

        return Inertia::render('Captain/Events', [
            'pendingEvents' => $pendingEvents
        ]);
    }

    /**
     * Approve an event request.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $eventId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approveEvent(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        if ($event->status !== 'pending') {
            return back()->with('error', 'Event has already been processed.');
        }

        $event->update(['status' => 'approved']);

        return back()->with('success', "Event '{$event->title}' has been approved successfully!");
    }

    /**
     * Decline an event request.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $eventId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function declineEvent(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        if ($event->status !== 'pending') {
            return back()->with('error', 'Event has already been processed.');
        }

        $event->update(['status' => 'declined']);

        return back()->with('success', "Event '{$event->title}' has been declined.");
    }
}
