<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\Feedback;
use App\Models\Purok;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SecretaryController extends Controller
{
    public function index()
    {
        $stats = [
            'pendingUsers' => User::where('status', 'pending')->count(),
            'pendingEvents' => Event::where('status', 'pending')->count(),
            'totalAttendees' => Attendance::where('status', 'confirmed')->count(),
            'certificatesIssued' => Certificate::count(),
        ];

        return Inertia::render('Secretary/Dashboard', [
            'stats' => $stats
        ]);
    }

    public function users(Request $request)
    {
        $pendingUsers = User::where('status', 'pending')
            ->with('purok')
            ->latest()
            ->get();

        // Build query for approved users (residents) with search and filter
        $approvedUsersQuery = User::where('status', 'approved')
            ->where('role', 'resident')
            ->with('purok');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $approvedUsersQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%');
            });
        }

        // Apply purok filter
        if ($request->filled('purok_id') && $request->get('purok_id') !== 'all') {
            $approvedUsersQuery->where('purok_id', $request->get('purok_id'));
        }

        $approvedUsers = $approvedUsersQuery->paginate(10, ['*'], 'users_page')
            ->appends($request->only(['search', 'purok_id']));

        $approvedPartners = User::where('status', 'approved')
            ->where('role', 'partner_agency')
            ->with('purok')
            ->paginate(10, ['*'], 'partners_page');

        // Get all puroks for filter dropdown
        $puroks = Purok::orderBy('name')->get();

        return Inertia::render('Secretary/Users', [
            'pendingUsers' => $pendingUsers,
            'approvedUsers' => $approvedUsers,
            'approvedPartners' => $approvedPartners,
            'puroks' => $puroks,
            'filters' => [
                'search' => $request->get('search', ''),
                'purok_id' => $request->get('purok_id', 'all')
            ]
        ]);
    }

    public function approveUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['status' => 'approved']);

        return back()->with('success', 'User approved successfully!');
    }

    public function declineUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['status' => 'declined']);

        return back()->with('success', 'User declined successfully!');
    }

    public function userDetail($userId)
    {
        $user = User::with('purok')->findOrFail($userId);

        return Inertia::render('Secretary/UserDetail', [
            'user' => $user
        ]);
    }

    public function events()
    {
        $puroks = Purok::all();
        $events = Event::with(['creator', 'purok', 'attendances'])
            ->latest()
            ->get()
            ->map(function ($event) {
                $event->confirmed_attendees_count = $event->attendances()
                    ->where('status', 'confirmed')->count();
                return $event;
            });

        return Inertia::render('Secretary/Events', [
            'events' => $events,
            'puroks' => $puroks
        ]);
    }

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

        return Inertia::render('Secretary/EditEvent', [
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

        return redirect()->route('secretary.events')->with('success', 'Event updated successfully!');
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

    public function eventAttendees($eventId)
    {
        $event = Event::with(['purok', 'creator'])->findOrFail($eventId);

        $attendees = Attendance::where('event_id', $eventId)
            ->where('status', 'confirmed')
            ->with(['user.purok'])
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'user' => $attendance->user,
                    'qr_code' => $attendance->qr_code,
                    'scanned' => $attendance->scanned,
                    'scanned_at' => $attendance->updated_at,
                ];
            });

        return Inertia::render('Secretary/EventAttendees', [
            'event' => $event,
            'attendees' => $attendees
        ]);
    }

    public function assignQrCodes($eventId)
    {
        $attendances = Attendance::where('event_id', $eventId)
            ->where('status', 'confirmed')
            ->whereNull('qr_code')
            ->get();

        foreach ($attendances as $attendance) {
            $qrCodeData = 'EVENT_' . $eventId . '_USER_' . $attendance->user_id . '_' . time();
            $attendance->update(['qr_code' => $qrCodeData]);
        }

        return back()->with('success', 'QR codes assigned successfully to ' . $attendances->count() . ' attendees!');
    }

    public function scanQrCode(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        $attendance = Attendance::where('qr_code', $request->qr_code)->first();

        if (!$attendance) {
            return response()->json(['error' => 'Invalid QR code'], 404);
        }

        if ($attendance->scanned) {
            return response()->json(['error' => 'QR code already scanned'], 400);
        }

        $attendance->update(['scanned' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Attendance recorded successfully!',
            'attendee' => $attendance->load('user', 'event')
        ]);
    }

    public function attendance()
    {
        $events = Event::where('status', 'approved')
            ->with([
                'attendances' => function ($query) {
                    $query->where('status', 'confirmed');
                },
                'purok',
                'creator'
            ])
            ->latest()
            ->get()
            ->map(function ($event) {
                $event->total_confirmed = $event->attendances->count();
                $event->total_scanned = $event->attendances->where('scanned', true)->count();
                $event->attendance_rate = $event->total_confirmed > 0
                    ? round(($event->total_scanned / $event->total_confirmed) * 100, 2)
                    : 0;
                return $event;
            });

        return Inertia::render('Secretary/Attendance', [
            'events' => $events
        ]);
    }

    public function assignCertificates($eventId)
    {
        $event = Event::findOrFail($eventId);

        if (!$event->has_certificate) {
            return back()->with('error', 'This event does not offer certificates.');
        }

        // Get attendees who attended and don't have certificates yet
        $attendees = Attendance::where('event_id', $eventId)
            ->where('status', 'confirmed')
            ->where('scanned', true)
            ->whereDoesntHave('user.certificates', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->with('user')
            ->get();

        $certificatesCreated = 0;

        foreach ($attendees as $attendance) {
            // Create certificate record (file generation would be handled separately)
            Certificate::create([
                'event_id' => $eventId,
                'user_id' => $attendance->user_id,
                'file_path' => 'certificates/' . $eventId . '_' . $attendance->user_id . '.pdf', // Placeholder path
            ]);
            $certificatesCreated++;
        }

        return back()->with('success', "Certificates assigned to {$certificatesCreated} attendees!");
    }

    public function feedback()
    {
        $feedbacks = Feedback::with(['event', 'user'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Secretary/Feedback', [
            'feedbacks' => $feedbacks
        ]);
    }

    public function content()
    {
        return Inertia::render('Secretary/Content');
    }

    public function announcements()
    {
        $announcements = Announcement::with('creator')
            ->latest()
            ->get()
            ->map(function ($announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'content' => $announcement->content,
                    'target_puroks' => $announcement->target_puroks,
                    'target_all_puroks' => $announcement->target_all_puroks,
                    'created_by' => $announcement->creator->name,
                    'created_at' => $announcement->created_at->format('M d, Y H:i'),
                ];
            });

        $puroks = Purok::all();

        return Inertia::render('Secretary/Announcements', [
            'announcements' => $announcements,
            'puroks' => $puroks
        ]);
    }

    public function createAnnouncement(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'target_puroks' => 'nullable|array|max:3',
            'target_puroks.*' => 'exists:puroks,id',
            'target_all_puroks' => 'boolean',
        ]);

        // Ensure only up to 3 puroks can be selected
        if (!$request->target_all_puroks && count($request->target_puroks ?? []) > 3) {
            return back()->withErrors(['target_puroks' => 'You can select up to 3 puroks only.']);
        }

        Announcement::create([
            'created_by' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'target_puroks' => $request->target_all_puroks ? null : ($request->target_puroks ?? []),
            'target_all_puroks' => $request->target_all_puroks ?? false,
        ]);

        return back()->with('success', 'Announcement created successfully!');
    }

    public function editAnnouncement($announcementId)
    {
        $announcement = Announcement::findOrFail($announcementId);
        $puroks = Purok::all();

        return Inertia::render('Secretary/EditAnnouncement', [
            'announcement' => $announcement,
            'puroks' => $puroks
        ]);
    }

    public function updateAnnouncement(Request $request, $announcementId)
    {
        $announcement = Announcement::findOrFail($announcementId);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'target_puroks' => 'nullable|array|max:3',
            'target_puroks.*' => 'exists:puroks,id',
            'target_all_puroks' => 'boolean',
        ]);

        // Ensure only up to 3 puroks can be selected
        if (!$request->target_all_puroks && count($request->target_puroks ?? []) > 3) {
            return back()->withErrors(['target_puroks' => 'You can select up to 3 puroks only.']);
        }

        $announcement->update([
            'title' => $request->title,
            'content' => $request->content,
            'target_puroks' => $request->target_all_puroks ? null : ($request->target_puroks ?? []),
            'target_all_puroks' => $request->target_all_puroks ?? false,
        ]);

        return redirect()->route('secretary.announcements')->with('success', 'Announcement updated successfully!');
    }

    public function deleteAnnouncement($announcementId)
    {
        $announcement = Announcement::findOrFail($announcementId);
        $announcement->delete();

        return back()->with('success', 'Announcement deleted successfully!');
    }
}
