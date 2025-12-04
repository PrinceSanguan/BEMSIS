<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Purok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
            ->with(['attendances'])
            ->latest()
            ->get()
            ->map(function ($event) {
                $event->confirmed_attendees_count = $event->attendances()
                    ->where('status', 'confirmed')->count();

                // Handle purok information based on purok_ids
                if ($event->target_all_residents || empty($event->purok_ids)) {
                    $event->purok = null; // This will show "All Residents" in frontend
                } else {
                    // Get the first purok for display (or you can modify this logic)
                    $puroks = \App\Models\Purok::whereIn('id', $event->purok_ids)->get();
                    if ($puroks->count() === 1) {
                        $event->purok = $puroks->first();
                    } else {
                        // For multiple puroks, create a combined display object
                        $event->purok = (object) [
                            'name' => $puroks->pluck('name')->join(', ')
                        ];
                    }
                }

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
            'venue' => 'nullable|string|max:255',
            'start_date' => 'required|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'purok_ids' => 'nullable|array|max:3',
            'purok_ids.*' => 'exists:puroks,id',
            'has_certificate' => 'boolean',
            'target_all_residents' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $targetAllResidents = $request->input('target_all_residents', false);

        // Ensure only up to 3 puroks can be selected
        if (!$targetAllResidents && count($request->purok_ids ?? []) > 3) {
            return back()->withErrors(['purok_ids' => 'You can select up to 3 puroks only.']);
        }

        // Check for duplicate events (same venue, date/time, and participant type)
        $duplicateQuery = Event::where('start_date', $request->start_date)
            ->where('status', '!=', 'declined'); // Exclude declined events

        // Check venue match (handle nullable)
        if ($request->venue) {
            $duplicateQuery->where('venue', $request->venue);
        } else {
            $duplicateQuery->whereNull('venue');
        }

        // Check end_date match
        if ($request->end_date) {
            $duplicateQuery->where('end_date', $request->end_date);
        } else {
            $duplicateQuery->whereNull('end_date');
        }

        // Check participant type match
        if ($targetAllResidents) {
            $duplicateQuery->where('target_all_residents', true);
        } else {
            $duplicateQuery->where('target_all_residents', false)
                ->where(function ($query) use ($request) {
                    $purokIds = $request->purok_ids ?? [];
                    sort($purokIds);
                    $purokIdsJson = json_encode($purokIds);
                    $query->whereRaw('JSON_EXTRACT(purok_ids, "$") = ?', [$purokIdsJson]);
                });
        }

        if ($duplicateQuery->exists()) {
            return back()->withErrors(['duplicate' => 'An event with the same venue, date, time, and participant type already exists. Please modify the event details.']);
        }

        $eventData = [
            'created_by' => Auth::id(),
            'purok_ids' => $targetAllResidents ? null : (empty($request->purok_ids) ? null : $request->purok_ids),
            'title' => $request->title,
            'description' => $request->description,
            'venue' => $request->venue,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'has_certificate' => $request->has_certificate ?? false,
            'status' => 'pending',
            'target_all_residents' => $targetAllResidents,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events', 'public');
            $eventData['image_path'] = $imagePath;
        }

        Event::create($eventData);

        return back()->with('success', 'Event created successfully! Awaiting captain approval.');
    }

    public function editEvent($eventId)
    {
        $event = Event::where('id', $eventId)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        // Prevent editing approved or declined events
        if ($event->status === 'approved' || $event->status === 'declined') {
            return back()->with('error', 'Cannot edit approved or declined events.');
        }

        $puroks = Purok::all();

        return Inertia::render('Partner/EditEvent', [
            'event' => $event,
            'puroks' => $puroks
        ]);
    }

    public function updateEvent(Request $request, $eventId)
    {
        $event = Event::where('id', $eventId)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        // Prevent editing approved or declined events
        if ($event->status === 'approved' || $event->status === 'declined') {
            return back()->with('error', 'Cannot edit approved or declined events.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'venue' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'purok_ids' => 'nullable|array|max:3',
            'purok_ids.*' => 'exists:puroks,id',
            'has_certificate' => 'boolean',
            'target_all_residents' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $targetAllResidents = $request->input('target_all_residents', false);

        // Ensure only up to 3 puroks can be selected
        if (!$targetAllResidents && count($request->purok_ids ?? []) > 3) {
            return back()->withErrors(['purok_ids' => 'You can select up to 3 puroks only.']);
        }

        $updateData = [
            'purok_ids' => $targetAllResidents ? null : (empty($request->purok_ids) ? null : $request->purok_ids),
            'title' => $request->title,
            'description' => $request->description,
            'venue' => $request->venue,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'has_certificate' => $request->has_certificate ?? false,
            'target_all_residents' => $targetAllResidents,
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($event->image_path && Storage::disk('public')->exists($event->image_path)) {
                Storage::disk('public')->delete($event->image_path);
            }

            $imagePath = $request->file('image')->store('events', 'public');
            $updateData['image_path'] = $imagePath;
        }

        $event->update($updateData);

        return redirect()->route('partner.events')->with('success', 'Event updated successfully!');
    }

    public function deleteEvent($eventId)
    {
        $event = Event::where('id', $eventId)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        // Prevent deleting approved events
        if ($event->status === 'approved') {
            return back()->with('error', 'Cannot delete approved events.');
        }

        // Delete associated image if exists
        if ($event->image_path && Storage::disk('public')->exists($event->image_path)) {
            Storage::disk('public')->delete($event->image_path);
        }

        $event->delete();

        return back()->with('success', 'Event deleted successfully!');
    }

    /**
     * Display the partner profile.
     *
     * @return \Inertia\Response
     */
    public function profile()
    {
        $user = Auth::user();

        return Inertia::render('Partner/Profile', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status
            ]
        ]);
    }

    /**
     * Update partner profile.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'required|string|unique:users,phone,' . $user->id,
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Change partner password.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password changed successfully!');
    }
}
