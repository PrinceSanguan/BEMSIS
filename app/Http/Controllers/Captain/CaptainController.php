<?php

namespace App\Http\Controllers\Captain;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Purok;

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

        $approvedEvents = Event::where('status', 'approved')
            ->with(['creator'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($event) {
                $event->creator_role = $event->creator->role;
                return $event;
            });

        return Inertia::render('Captain/Dashboard', [
            'stats' => $stats,
            'approvedEvents' => $approvedEvents
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
            ->with(['creator'])
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

        // Send SMS notifications to all residents
        // Commented out to avoid sending SMS notifications to residents
        $this->sendSmsNotificationToResidents($event);

        return back()->with('success', "Event '{$event->title}' has been approved successfully!");
    }

    /**
     * Send SMS notification to all residents about approved event
     */
    private function sendSmsNotificationToResidents($event)
    {
        try {
            // Get all users with role 'resident'
            $residents = User::where('role', 'resident')
                ->where('status', 'approved')
                ->whereNotNull('phone')
                ->get();

            foreach ($residents as $resident) {
                $this->sendSms($resident, $event);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send SMS notifications for event approval', [
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send individual SMS to resident
     */
    private function sendSms($resident, $event)
    {
        try {
            $url = 'https://sms.iprogtech.com/api/v1/sms_messages';
            $message = sprintf(
                "Hi! %s, reminder: %s.",
                explode(' ', $resident->name)[0], // First name
                $event->title
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

            // Log SMS for record keeping
            \App\Models\SmsLog::create([
                'user_id' => $resident->id,
                'phone' => $resident->phone,
                'message' => $message,
                'direction' => 'outgoing',
            ]);

            \Log::info('SMS sent successfully', [
                'user_id' => $resident->id,
                'phone' => $resident->phone,
                'event_id' => $event->id,
                'http_code' => $httpCode
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send SMS to resident', [
                'user_id' => $resident->id,
                'phone' => $resident->phone,
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
        }
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

    /**
     * Display users with pagination.
     *
     * @return \Inertia\Response
     */
    public function users(Request $request)
    {
        // Build query for residents with search and filter
        $residentsQuery = User::where('role', 'resident')
            ->where('status', 'approved')
            ->with('purok');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $residentsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('first_name', 'like', '%' . $search . '%')
                    ->orWhere('last_name', 'like', '%' . $search . '%');
            });
        }

        // Apply purok filter
        if ($request->filled('purok_id') && $request->get('purok_id') !== 'all') {
            $residentsQuery->where('purok_id', $request->get('purok_id'));
        }

        $residents = $residentsQuery->latest()
            ->paginate(10, ['*'], 'residents_page')
            ->appends($request->only(['search', 'purok_id']));

        $partners = User::where('role', 'partner_agency')
            ->where('status', 'approved')
            ->latest()
            ->paginate(10, ['*'], 'partners_page');

        // Get all puroks for filter dropdown
        $puroks = Purok::orderBy('name')->get();

        return Inertia::render('Captain/Users', [
            'residents' => $residents,
            'partners' => $partners,
            'puroks' => $puroks,
            'filters' => [
                'search' => $request->get('search', ''),
                'purok_id' => $request->get('purok_id', 'all')
            ]
        ]);
    }

    /**
     * Display user details.
     *
     * @param int $userId
     * @return \Inertia\Response
     */
    public function userDetail($userId)
    {
        $user = User::with('purok')->findOrFail($userId);

        return Inertia::render('Captain/UserDetails', [
            'user' => $user
        ]);
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
}
