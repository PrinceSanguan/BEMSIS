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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Determine if targeting all residents
        $targetAllResidents = $request->input('target_all_residents', false) || is_null($request->purok_id);

        $eventData = [
            'created_by' => Auth::id(),
            'purok_id' => $targetAllResidents ? null : $request->purok_id,
            'title' => $request->title,
            'description' => $request->description,
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
            ->with(['purok'])
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
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'purok_id' => 'nullable|exists:puroks,id',
            'has_certificate' => 'boolean',
            'target_all_residents' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $targetAllResidents = $request->input('target_all_residents', false) || is_null($request->purok_id);

        $updateData = [
            'purok_id' => $targetAllResidents ? null : $request->purok_id,
            'title' => $request->title,
            'description' => $request->description,
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
