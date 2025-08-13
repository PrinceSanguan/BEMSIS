<?php

namespace App\Http\Controllers\Secretary;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\Feedback;
use App\Models\Purok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

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

    public function users()
    {
        $pendingUsers = User::where('status', 'pending')
            ->with('purok')
            ->latest()
            ->get();

        return Inertia::render('Secretary/Users', [
            'pendingUsers' => $pendingUsers
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

    public function events()
    {
        $puroks = Purok::all();
        $events = Event::with(['creator', 'purok', 'attendances'])
            ->where('status', 'approved')
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
        ]);

        Event::create([
            'created_by' => Auth::id(),
            'purok_id' => $request->purok_id,
            'title' => $request->title,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'has_certificate' => $request->has_certificate ?? false,
            'status' => 'pending', // Requires captain approval
            'target_all_residents' => $request->input('target_all_residents', false),
        ]);

        return back()->with('success', 'Event created successfully! Awaiting captain approval.');
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
            ->with(['attendances' => function ($query) {
                $query->where('status', 'confirmed');
            }])
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
}
