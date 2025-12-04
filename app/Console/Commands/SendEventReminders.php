<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use App\Models\User;
use App\Models\SmsLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendEventReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'events:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send SMS reminders for events happening tomorrow';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for events happening tomorrow...');

        // Get tomorrow's date
        $tomorrow = Carbon::tomorrow()->toDateString();

        // Find approved events happening tomorrow that haven't had reminders sent
        $events = Event::where('status', 'approved')
            ->where('reminder_sent', false)
            ->whereDate('start_date', $tomorrow)
            ->get();

        if ($events->count() === 0) {
            $this->info('No events found for tomorrow that need reminders.');
            return;
        }

        $this->info("Found {$events->count()} event(s) for tomorrow. Sending reminders...");

        foreach ($events as $event) {
            $this->sendEventReminder($event);
        }

        $this->info('Event reminders sent successfully!');
    }

    /**
     * Send reminder SMS for a specific event
     */
    private function sendEventReminder($event)
    {
        try {
            $this->info("Processing event: {$event->title}");

            // Build the query for residents based on event targeting
            $residentsQuery = User::where('role', 'resident')
                ->where('status', 'approved')
                ->where('is_active', true)
                ->whereNotNull('phone');

            // Apply purok filtering based on event settings
            if ($event->target_all_residents) {
                // Send to all residents
                $residents = $residentsQuery->get();
            } else if (!empty($event->purok_ids)) {
                // Send only to residents in specified puroks
                $residents = $residentsQuery->whereIn('purok_id', $event->purok_ids)->get();
            } else {
                // If no specific targeting, send to all
                $residents = $residentsQuery->get();
            }

            $sentCount = 0;
            foreach ($residents as $resident) {
                if ($this->sendReminderSms($resident, $event)) {
                    $sentCount++;
                }
            }

            // Mark event as reminder sent
            $event->update([
                'reminder_sent' => true,
                'reminder_sent_at' => now()
            ]);

            $this->info("✅ Event '{$event->title}': Sent {$sentCount} reminder(s) to residents");

            Log::info('Event reminder sent successfully', [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'residents_count' => $sentCount
            ]);
        } catch (\Exception $e) {
            $this->error("❌ Failed to send reminders for event '{$event->title}': {$e->getMessage()}");

            Log::error('Failed to send event reminder', [
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send individual reminder SMS to resident
     */
    private function sendReminderSms($resident, $event)
    {
        try {
            $url = 'https://sms.iprogtech.com/api/v1/sms_messages';

            // Format dates
            $startDate = Carbon::parse($event->start_date)->format('M d, Y h:i A');
            $endDate = $event->end_date ? ' to ' . Carbon::parse($event->end_date)->format('M d, Y h:i A') : '';

            // Build reminder message with full 5Ws
            $venue = $event->venue ? " Where: {$event->venue}." : "";
            $description = $event->description ? " Why: {$event->description}." : "";

            $message = sprintf(
                "🔔 REMINDER: Hi %s! What: %s. When: %s%s.%s%s Approved by Hon. Maristela T. Ubalde.",
                explode(' ', $resident->name)[0], // Who (First name)
                $event->title, // What
                $startDate, // When
                $endDate,
                $venue, // Where
                $description // Why
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
            SmsLog::create([
                'user_id' => $resident->id,
                'phone' => $resident->phone,
                'message' => $message,
                'direction' => 'outgoing',
            ]);

            return $httpCode >= 200 && $httpCode < 300;
        } catch (\Exception $e) {
            Log::error('Failed to send reminder SMS to resident', [
                'user_id' => $resident->id,
                'phone' => $resident->phone,
                'event_id' => $event->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
