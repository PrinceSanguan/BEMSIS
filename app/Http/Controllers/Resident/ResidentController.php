<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

class ResidentController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get dashboard stats
        $stats = [
            'eventsAttended' => Attendance::where('user_id', $user->id)
                ->where('scanned', true)->count(),
            'qrCodesGenerated' => Attendance::where('user_id', $user->id)
                ->where('status', 'confirmed')
                ->whereNotNull('qr_code')->count(),
            'certificatesEarned' => Certificate::where('user_id', $user->id)->count(),
            'feedbackSubmitted' => Feedback::where('user_id', $user->id)->count(),
        ];

        // Get upcoming events
        $upcomingEvents = Event::where('status', 'approved')
            ->where('start_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->take(5)
            ->with(['attendances' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($event) {
                $userAttendance = $event->attendances->first();
                $event->registration_status = $userAttendance ? $userAttendance->status : 'available';
                return $event;
            });

        return Inertia::render('Resident/Dashboard', [
            'stats' => $stats,
            'upcomingEvents' => $upcomingEvents
        ]);
    }

    public function events()
    {
        $user = Auth::user();

        $events = Event::where('status', 'approved')
            ->where('start_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->with(['creator', 'purok', 'attendances' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->get()
            ->map(function ($event) {
                $userAttendance = $event->attendances->first();
                $event->user_registered = $userAttendance ? true : false;
                $event->registration_status = $userAttendance ? $userAttendance->status : null;
                $event->current_attendees = $event->attendances()->where('status', 'confirmed')->count();
                return $event;
            });

        return Inertia::render('Resident/Events', [
            'events' => $events
        ]);
    }

    public function registerForEvent(Request $request, $eventId)
    {
        $user = Auth::user();

        // Check if already registered
        $existingAttendance = Attendance::where('event_id', $eventId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingAttendance) {
            return back()->with('error', 'You are already registered for this event.');
        }

        // Create attendance record
        Attendance::create([
            'event_id' => $eventId,
            'user_id' => $user->id,
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'Successfully registered for the event!');
    }

    public function unregisterFromEvent(Request $request, $eventId)
    {
        $user = Auth::user();

        Attendance::where('event_id', $eventId)
            ->where('user_id', $user->id)
            ->delete();

        return back()->with('success', 'Successfully unregistered from the event!');
    }

    public function attendance()
    {
        $user = Auth::user();

        // Get confirmed events (upcoming)
        $confirmedEvents = Attendance::where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->with(['event' => function ($query) {
                $query->where('start_date', '>=', now());
            }])
            ->get()
            ->filter(function ($attendance) {
                return $attendance->event !== null;
            })
            ->map(function ($attendance) {
                // Generate QR code if not exists
                if (!$attendance->qr_code) {
                    $qrCodeData = 'EVENT_' . $attendance->event_id . '_USER_' . $attendance->user_id . '_' . time();
                    $attendance->qr_code = $qrCodeData;
                    $attendance->save();
                }

                return [
                    'id' => $attendance->id,
                    'event' => $attendance->event,
                    'qr_code' => $attendance->qr_code,
                    'has_qr' => true
                ];
            });

        // Get attendance history
        $attendanceHistory = Attendance::where('user_id', $user->id)
            ->with(['event' => function ($query) {
                $query->where('start_date', '<', now());
            }])
            ->get()
            ->filter(function ($attendance) {
                return $attendance->event !== null;
            })
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'event' => $attendance->event,
                    'status' => $attendance->scanned ? 'attended' : 'missed',
                    'scanned_at' => $attendance->updated_at
                ];
            });

        return Inertia::render('Resident/Attendance', [
            'confirmedEvents' => $confirmedEvents,
            'attendanceHistory' => $attendanceHistory
        ]);
    }

    public function certificates()
    {
        $user = Auth::user();

        $certificates = Certificate::where('user_id', $user->id)
            ->with('event')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'event_name' => $certificate->event->title,
                    'date_earned' => $certificate->created_at->format('Y-m-d'),
                    'type' => 'Completion Certificate',
                    'status' => 'available',
                    'file_path' => $certificate->file_path
                ];
            });

        return Inertia::render('Resident/Certificates', [
            'certificates' => $certificates
        ]);
    }

    public function feedback()
    {
        $user = Auth::user();

        // Events that need feedback (attended but no feedback yet)
        $eventsNeedingFeedback = Attendance::where('user_id', $user->id)
            ->where('scanned', true)
            ->whereDoesntHave('event.feedbacks', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with('event')
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->event->id,
                    'event_name' => $attendance->event->title,
                    'date' => $attendance->event->start_date,
                    'has_certificate' => $attendance->event->has_certificate
                ];
            });

        // Feedback history
        $feedbackHistory = Feedback::where('user_id', $user->id)
            ->with('event')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($feedback) {
                return [
                    'id' => $feedback->id,
                    'event_name' => $feedback->event->title,
                    'date' => $feedback->event->start_date,
                    'comment' => $feedback->comments,
                    'submitted_date' => $feedback->created_at->format('Y-m-d'),
                    'rating' => 5 // Add rating field to feedback table if needed
                ];
            });

        return Inertia::render('Resident/Feedback', [
            'eventsNeedingFeedback' => $eventsNeedingFeedback,
            'feedbackHistory' => $feedbackHistory
        ]);
    }

    public function submitFeedback(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'comments' => 'required|string|max:1000',
        ]);

        Feedback::create([
            'event_id' => $request->event_id,
            'user_id' => Auth::id(),
            'comments' => $request->comments,
        ]);

        return back()->with('success', 'Feedback submitted successfully!');
    }

    public function profile()
    {
        $user = Auth::user();

        return Inertia::render('Resident/Profile', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status
            ]
        ]);
    }

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

    public function generateQRCode($attendanceId)
    {
        $attendance = Attendance::where('id', $attendanceId)
            ->where('user_id', Auth::id())
            ->where('status', 'confirmed')
            ->first();

        if (!$attendance) {
            return response()->json(['error' => 'Attendance record not found'], 404);
        }

        // Generate QR code if not exists
        if (!$attendance->qr_code) {
            $qrCodeData = 'EVENT_' . $attendance->event_id . '_USER_' . $attendance->user_id . '_' . time();
            $attendance->qr_code = $qrCodeData;
            $attendance->save();
        }

        // Generate QR code SVG
        $qrCodeSvg = QrCode::format('svg')
            ->size(200)
            ->generate($attendance->qr_code);

        return response()->json([
            'qr_code' => $attendance->qr_code,
            'qr_svg' => $qrCodeSvg
        ]);
    }
}
