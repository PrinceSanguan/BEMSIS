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
            'pendingUsers' => $pendingUsers->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                    'is_active' => $user->is_active,
                    'purok' => $user->purok,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            }),
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

        // Send SMS notification to approved user
        $this->sendSmsNotificationToUser($user);

        return back()->with('success', 'User approved successfully!');
    }

    /**
     * Send SMS notification to specific user about approval
     */
    private function sendSmsNotificationToUser($user)
    {
        try {
            if (!$user->phone) {
                return;
            }

            $url = 'https://sms.iprogtech.com/api/v1/sms_messages';
            $message = sprintf(
                "Hello %s, your account is already approved.",
                $user->name
            );

            $data = [
                'api_token' => env('SMS_API_KEY'),
                'message' => $message,
                'phone_number' => $user->phone,
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/x-www-form-urlencoded'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            // Log SMS for record keeping
            \App\Models\SmsLog::create([
                'user_id' => $user->id,
                'phone' => $user->phone,
                'message' => $message,
                'direction' => 'outgoing',
            ]);

            \Log::info('SMS sent successfully to approved user', [
                'user_id' => $user->id,
                'phone' => $user->phone,
                'http_code' => $httpCode
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send SMS to approved user', [
                'user_id' => $user->id,
                'phone' => $user->phone,
                'error' => $e->getMessage()
            ]);
        }
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

    public function events(Request $request)
    {
        $puroks = Purok::all();

        // Build query with search and filter
        $eventsQuery = Event::with(['creator', 'attendances']);

        // Only show pending and approved events (exclude declined)
        $eventsQuery->whereIn('status', ['pending', 'approved']);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $eventsQuery->where(function ($query) use ($search) {
                $query->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        // Apply purok filter
        if ($request->filled('purok_id') && $request->get('purok_id') !== 'all') {
            $purokId = (int)$request->get('purok_id');

            $eventsQuery->where(function ($query) use ($purokId) {
                // Handle different ways purok_ids might be stored
                $query->whereJsonContains('purok_ids', $purokId)
                    ->orWhere('purok_ids', 'LIKE', '%"' . $purokId . '"%')
                    ->orWhere('purok_ids', 'LIKE', '%[' . $purokId . ']%')
                    ->orWhere('purok_ids', 'LIKE', '%[' . $purokId . ',%')
                    ->orWhere('purok_ids', 'LIKE', '%,' . $purokId . ']%')
                    ->orWhere('purok_ids', 'LIKE', '%,' . $purokId . ',%');
            });
        }

        $events = $eventsQuery->latest()
            ->get()
            ->map(function ($event) {
                $event->confirmed_attendees_count = $event->attendances()
                    ->where('status', 'confirmed')->count();

                // Load purok information for display
                if (is_null($event->purok_ids)) {
                    $event->purok_names = 'All Residents';
                    $event->puroks = collect();
                } elseif (!empty($event->purok_ids)) {
                    $puroks = \App\Models\Purok::whereIn('id', $event->purok_ids)->get();
                    $event->puroks = $puroks;
                    $event->purok_names = $puroks->pluck('name')->join(', ');
                } else {
                    $event->purok_names = 'No Purok Selected';
                    $event->puroks = collect();
                }

                return $event;
            });

        return Inertia::render('Secretary/Events', [
            'events' => $events,
            'puroks' => $puroks,
            'filters' => [
                'search' => $request->get('search', ''),
                'purok_id' => $request->get('purok_id', 'all')
            ]
        ]);
    }

    public function createEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'venue' => 'nullable|string|max:255',
            'start_date' => 'required|date|after:now',
            'end_date' => 'nullable|date|after:start_date',
            'purok_ids' => 'nullable|array',
            'purok_ids.*' => 'exists:puroks,id',
            'has_certificate' => 'boolean',
            'target_all_residents' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Determine if targeting all residents
        $targetAllResidents = $request->input('target_all_residents', false);

        // Normalize empty venue to null
        $normalizedVenue = trim($request->venue ?? '') !== '' ? trim($request->venue) : null;

        // Check for duplicate events (same venue, date/time, and participant type)
        $duplicateQuery = Event::where('start_date', $request->start_date)
            ->where('status', '!=', 'declined'); // Exclude declined events

        // Check venue match (handle both null and empty string)
        if ($normalizedVenue !== null) {
            $duplicateQuery->where(function ($q) use ($normalizedVenue) {
                $q->where('venue', $normalizedVenue)
                    ->orWhere('venue', '');
            });
        } else {
            $duplicateQuery->where(function ($q) {
                $q->whereNull('venue')
                    ->orWhere('venue', '');
            });
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

            if ($duplicateQuery->exists()) {
                return back()->withErrors(['duplicate' => 'An event with the same venue, date, time, and participant type already exists. Please modify the event details.']);
            }
        } else {
            // For specific puroks, get all potential duplicates and check in PHP
            $duplicateQuery->where('target_all_residents', false);
            $potentialDuplicates = $duplicateQuery->get();

            $requestPurokIds = $request->purok_ids ?? [];
            sort($requestPurokIds);

            foreach ($potentialDuplicates as $existingEvent) {
                $existingPurokIds = $existingEvent->purok_ids ?? [];
                sort($existingPurokIds);

                // Check if purok arrays match exactly
                if ($requestPurokIds == $existingPurokIds) {
                    return back()->withErrors(['duplicate' => 'An event with the same venue, date, time, and participant type already exists. Please modify the event details.']);
                }
            }
        }

        $eventData = [
            'created_by' => Auth::id(),
            'purok_ids' => $targetAllResidents ? null : (empty($request->purok_ids) ? null : $request->purok_ids),
            'title' => $request->title,
            'description' => $request->description,
            'venue' => $normalizedVenue,
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
            'venue' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'purok_ids' => 'nullable|array',
            'purok_ids.*' => 'exists:puroks,id',
            'has_certificate' => 'boolean',
            'target_all_residents' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $targetAllResidents = $request->input('target_all_residents', false);

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

        return redirect()->route('secretary.events')->with('success', 'Event updated successfully!');
    }

    public function deleteEvent($eventId)
    {
        $event = Event::findOrFail($eventId);

        // Check deletion permissions based on status and date
        if ($event->status === 'approved') {
            // For approved events, only allow deletion if event has ended
            $eventEndTime = $event->end_date ?: $event->start_date;
            if (new \DateTime($eventEndTime) >= new \DateTime()) {
                return back()->with('error', 'Cannot delete approved events that are still ongoing or upcoming.');
            }
        }

        // Delete all related records first to avoid foreign key constraint violations

        // Delete all attendances for this event
        Attendance::where('event_id', $eventId)->delete();

        // Delete all feedbacks for this event
        Feedback::where('event_id', $eventId)->delete();

        // Delete all certificates for this event
        Certificate::where('event_id', $eventId)->delete();

        // Delete associated image if exists
        if ($event->image_path && Storage::disk('public')->exists($event->image_path)) {
            Storage::disk('public')->delete($event->image_path);
        }

        // Now delete the event itself
        $event->delete();

        return back()->with('success', 'Event deleted successfully!');
    }

    public function eventAttendees($eventId)
    {
        $event = Event::with(['creator'])->findOrFail($eventId);

        $attendees = Attendance::where('event_id', $eventId)
            ->where('status', 'confirmed')
            ->with(['user.purok'])
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'user' => $attendance->user,
                    'qr_code' => $attendance->qr_code,
                    'time_in' => $attendance->time_in,
                    'time_in_label' => $attendance->time_in_label,
                    'time_out' => $attendance->time_out,
                    'time_out_label' => $attendance->time_out_label,
                ];
            });

        // Get eligible residents count (completed attendance + submitted feedback)
        $eligibleCount = Attendance::where('event_id', $eventId)
            ->where('status', 'confirmed')
            ->whereNotNull('time_out')
            ->where('time_out_label', 'Completed')
            ->whereHas('user.feedbacks', function ($query) use ($eventId) {
                $query->where('event_id', $eventId);
            })
            ->count();

        return Inertia::render('Secretary/EventAttendees', [
            'event' => $event,
            'attendees' => $attendees,
            'eligibleForPartnerResources' => $eligibleCount
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

        $attendance = Attendance::where('qr_code', $request->qr_code)
            ->with(['user', 'event'])
            ->first();

        if (!$attendance) {
            return back()->withErrors(['message' => 'Invalid QR code']);
        }

        $event = $attendance->event;
        $now = now();

        // Check if event has already ended
        $eventEndTime = $event->end_date ?: $event->start_date;
        if (\Carbon\Carbon::parse($eventEndTime)->lt(now())) {
            return back()->withErrors(['message' => 'The event is already expired']);
        }

        // Determine if this is time-in or time-out
        if (!$attendance->time_in) {
            // TIME-IN LOGIC
            $startTime = \Carbon\Carbon::parse($event->start_date);
            $minutesAfterStart = $startTime->diffInMinutes($now, false);

            // Label: On-Time (within 30 min after start) or Late (more than 30 min after start)
            $timeInLabel = ($minutesAfterStart >= 0 && $minutesAfterStart <= 30) ? 'On-Time' : 'Late';

            $attendance->update([
                'time_in' => $now,
                'time_in_label' => $timeInLabel
            ]);

            $message = $timeInLabel === 'On-Time'
                ? "✅ Time-In recorded for {$attendance->user->name} - On-Time!"
                : "⏰ Time-In recorded for {$attendance->user->name} - Late arrival";

            return back()->with('success', $message);
        } elseif (!$attendance->time_out) {
            // TIME-OUT LOGIC - Simplified: Always mark as "Completed"
            $attendance->update([
                'time_out' => $now,
                'time_out_label' => 'Completed'
            ]);

            return back()->with('success', "✅ Time-Out recorded for {$attendance->user->name} - Event Completed! You can now submit feedback.");
        } else {
            return back()->withErrors(['message' => 'Attendance already fully recorded (Time-In & Time-Out)']);
        }
    }

    public function attendance()
    {
        $events = Event::where('status', 'approved')
            ->with([
                'attendances' => function ($query) {
                    $query->where('status', 'confirmed');
                },
                'creator'
            ])
            ->latest()
            ->get()
            ->map(function ($event) {
                $event->total_confirmed = $event->attendances->count();
                $event->total_scanned = $event->attendances->whereNotNull('time_in')->count();
                $event->completed_count = $event->attendances->where('time_out_label', 'Completed')->count();
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
        $event = Event::where('id', $eventId)
            ->where('created_by', Auth::id())
            ->firstOrFail();

        if (!$event->has_certificate) {
            return back()->with('error', 'This event does not offer certificates.');
        }

        // Get attendees who attended and don't have certificates yet
        $attendees = Attendance::where('event_id', $eventId)
            ->where('status', 'confirmed')
            ->whereNotNull('time_in')
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
        // Get events that have feedback, with feedback counts
        $events = Event::whereHas('feedbacks')
            ->with(['creator'])
            ->withCount('feedbacks')
            ->latest()
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'start_date' => $event->start_date,
                    'end_date' => $event->end_date,
                    'creator' => $event->creator,
                    'feedbacks_count' => $event->feedbacks_count,
                    'status' => $event->status,
                ];
            });

        return Inertia::render('Secretary/Feedback', [
            'events' => $events
        ]);
    }

    public function getEventFeedback($eventId)
    {
        $event = Event::with('creator')->findOrFail($eventId);

        $feedbacks = Feedback::where('event_id', $eventId)
            ->with(['user'])
            ->latest()
            ->get()
            ->map(function ($feedback) {
                return [
                    'id' => $feedback->id,
                    'comments' => $feedback->comments,
                    'rating' => $feedback->rating ?? null,
                    'created_at' => $feedback->created_at,
                    'user' => [
                        'id' => $feedback->user->id,
                        'name' => $feedback->user->name,
                        'email' => $feedback->user->email,
                        'role' => $feedback->user->role,
                    ]
                ];
            });

        return response()->json([
            'event' => $event,
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
            'target_puroks' => 'nullable|array',
            'target_puroks.*' => 'exists:puroks,id',
            'target_all_puroks' => 'boolean',
        ]);

        $announcement = Announcement::create([
            'created_by' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'target_puroks' => $request->target_all_puroks ? null : ($request->target_puroks ?? []),
            'target_all_puroks' => $request->target_all_puroks ?? false,
        ]);

        // Send SMS notifications to targeted residents
        $this->sendAnnouncementSms($announcement);

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
            'target_puroks' => 'nullable|array',
            'target_puroks.*' => 'exists:puroks,id',
            'target_all_puroks' => 'boolean',
        ]);

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

    public function activateUser(User $user)
    {
        $user->update(['is_active' => true]);

        return redirect()->back()->with('success', 'User account has been activated successfully.');
    }

    public function deactivateUser(User $user)
    {
        $user->update(['is_active' => false]);

        return redirect()->back()->with('success', 'User account has been deactivated successfully.');
    }

    /**
     * Send SMS notification for announcement to targeted residents
     */
    private function sendAnnouncementSms($announcement)
    {
        try {
            // Build query for residents based on announcement targeting
            $residentsQuery = User::where('role', 'resident')
                ->where('status', 'approved')
                ->whereNotNull('phone');

            // Apply purok filtering based on announcement settings
            if ($announcement->target_all_puroks) {
                // Send to all residents
                $residents = $residentsQuery->get();
            } else if (!empty($announcement->target_puroks)) {
                // Send only to residents in specified puroks
                $residents = $residentsQuery->whereIn('purok_id', $announcement->target_puroks)->get();
            } else {
                // If no specific targeting, send to all
                $residents = $residentsQuery->get();
            }

            foreach ($residents as $resident) {
                $this->sendAnnouncementSmsToResident($resident, $announcement);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send SMS notifications for announcement', [
                'announcement_id' => $announcement->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send individual announcement SMS to resident
     */
    private function sendAnnouncementSmsToResident($resident, $announcement)
    {
        try {
            $url = 'https://sms.iprogtech.com/api/v1/sms_messages';

            // Format date
            $date = \Carbon\Carbon::parse($announcement->created_at)->format('M d, Y');

            // Build message
            $message = sprintf(
                "Hi %s! Announcement: %s. Date: %s. %s",
                explode(' ', $resident->name)[0], // First name
                $announcement->title,
                $date,
                $announcement->content
            );

            $data = [
                'api_token' => env('SMS_API_KEY'),
                'message' => $message,
                'phone_number' => $resident->phone,
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/x-www-form-urlencoded'
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            // Log SMS
            \App\Models\SmsLog::create([
                'user_id' => $resident->id,
                'phone' => $resident->phone,
                'message' => $message,
                'direction' => 'outgoing',
            ]);

            \Log::info('Announcement SMS sent successfully', [
                'user_id' => $resident->id,
                'announcement_id' => $announcement->id,
                'http_code' => $httpCode
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send announcement SMS to resident', [
                'user_id' => $resident->id,
                'announcement_id' => $announcement->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    public function uploadPartnerResources(Request $request, $eventId)
    {
        $event = Event::findOrFail($eventId);

        $request->validate([
            'partner_feedback_link' => 'nullable|url|max:500',
            'partner_certificate' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $updateData = [];

        // Update feedback link if provided
        if ($request->filled('partner_feedback_link')) {
            $updateData['partner_feedback_link'] = $request->partner_feedback_link;
        }

        // Handle certificate file upload
        if ($request->hasFile('partner_certificate')) {
            // Delete old certificate if exists
            if ($event->partner_certificate_path && Storage::disk('public')->exists($event->partner_certificate_path)) {
                Storage::disk('public')->delete($event->partner_certificate_path);
            }

            $certificatePath = $request->file('partner_certificate')->store('partner_certificates', 'public');
            $updateData['partner_certificate_path'] = $certificatePath;
        }

        if (!empty($updateData)) {
            $event->update($updateData);
            return back()->with('success', 'Partner resources updated successfully!');
        }

        return back()->with('error', 'No resources were provided to update.');
    }

    public function removePartnerFeedbackLink($eventId)
    {
        $event = Event::findOrFail($eventId);
        $event->update(['partner_feedback_link' => null]);

        return back()->with('success', 'Partner feedback link removed successfully!');
    }

    public function removePartnerCertificate($eventId)
    {
        $event = Event::findOrFail($eventId);

        // Delete file if exists
        if ($event->partner_certificate_path && Storage::disk('public')->exists($event->partner_certificate_path)) {
            Storage::disk('public')->delete($event->partner_certificate_path);
        }

        $event->update(['partner_certificate_path' => null]);

        return back()->with('success', 'Partner certificate removed successfully!');
    }
}
