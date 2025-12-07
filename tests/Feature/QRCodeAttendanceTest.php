<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class QRCodeAttendanceTest extends TestCase
{
  use RefreshDatabase;

  protected $secretary;
  protected $resident;
  protected $event;
  protected $attendance;

  protected function setUp(): void
  {
    parent::setUp();

    // Create secretary user
    $this->secretary = User::factory()->create([
      'role' => 'secretary',
      'status' => 'approved'
    ]);

    // Create resident user
    $this->resident = User::factory()->create([
      'role' => 'resident',
      'status' => 'approved'
    ]);
  }

  /** @test */
  public function test_time_in_on_time_within_30_minutes()
  {
    // Event starts at 10:00 AM
    Carbon::setTestNow(Carbon::parse('2025-12-08 10:00:00'));

    $this->event = Event::factory()->create([
      'start_date' => '2025-12-08 10:00:00',
      'end_date' => '2025-12-08 12:00:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_001'
    ]);

    // Scan at 10:15 AM (15 minutes after start)
    Carbon::setTestNow(Carbon::parse('2025-12-08 10:15:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'TEST_QR_001'
      ]);

    $this->attendance->refresh();
    $this->assertEquals('On-Time', $this->attendance->time_in_label);
    $response->assertSessionHas('success');
    $this->assertStringContainsString('On-Time', session('success'));
  }

  /** @test */
  public function test_time_in_late_exactly_30_minutes()
  {
    // Event starts at 10:00 AM
    Carbon::setTestNow(Carbon::parse('2025-12-08 10:00:00'));

    $this->event = Event::factory()->create([
      'start_date' => '2025-12-08 10:00:00',
      'end_date' => '2025-12-08 12:00:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_002'
    ]);

    // Scan at 10:30 AM (exactly 30 minutes after start)
    Carbon::setTestNow(Carbon::parse('2025-12-08 10:30:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'TEST_QR_002'
      ]);

    $this->attendance->refresh();
    $this->assertEquals('On-Time', $this->attendance->time_in_label);
  }

  /** @test */
  public function test_time_in_late_after_30_minutes()
  {
    // Event starts at 10:00 AM
    Carbon::setTestNow(Carbon::parse('2025-12-08 10:00:00'));

    $this->event = Event::factory()->create([
      'start_date' => '2025-12-08 10:00:00',
      'end_date' => '2025-12-08 12:00:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_003'
    ]);

    // Scan at 10:31 AM (31 minutes after start)
    Carbon::setTestNow(Carbon::parse('2025-12-08 10:31:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'TEST_QR_003'
      ]);

    $this->attendance->refresh();
    $this->assertEquals('Late', $this->attendance->time_in_label);
    $response->assertSessionHas('success');
    $this->assertStringContainsString('Late', session('success'));
  }

  /** @test */
  public function test_time_in_late_1_hour_after_start()
  {
    // Event starts at 10:00 PM
    Carbon::setTestNow(Carbon::parse('2025-12-08 22:00:00'));

    $this->event = Event::factory()->create([
      'start_date' => '2025-12-08 22:00:00',
      'end_date' => '2025-12-08 23:30:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_004'
    ]);

    // Scan at 10:30 PM (30 minutes after start) - Should be On-Time
    Carbon::setTestNow(Carbon::parse('2025-12-08 22:30:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'TEST_QR_004'
      ]);

    $this->attendance->refresh();
    $this->assertEquals('On-Time', $this->attendance->time_in_label);
  }

  /** @test */
  public function test_time_in_late_after_30_minutes_night_event()
  {
    // Event starts at 10:00 PM
    Carbon::setTestNow(Carbon::parse('2025-12-08 22:00:00'));

    $this->event = Event::factory()->create([
      'start_date' => '2025-12-08 22:00:00',
      'end_date' => '2025-12-08 23:30:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_005'
    ]);

    // Scan at 10:31 PM (31 minutes after start) - Should be Late
    Carbon::setTestNow(Carbon::parse('2025-12-08 22:31:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'TEST_QR_005'
      ]);

    $this->attendance->refresh();
    $this->assertEquals('Late', $this->attendance->time_in_label);
  }

  /** @test */
  public function test_time_out_always_completed()
  {
    // Event starts at 1:00 PM and ends at 2:30 PM
    Carbon::setTestNow(Carbon::parse('2025-12-08 13:00:00'));

    $this->event = Event::factory()->create([
      'start_date' => '2025-12-08 13:00:00',
      'end_date' => '2025-12-08 14:30:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_006',
      'time_in' => '2025-12-08 13:10:00',
      'time_in_label' => 'On-Time'
    ]);

    // Scan time-out at 2:20 PM (within last 30 minutes)
    Carbon::setTestNow(Carbon::parse('2025-12-08 14:20:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'TEST_QR_006'
      ]);

    $this->attendance->refresh();
    $this->assertEquals('Completed', $this->attendance->time_out_label);
    $response->assertSessionHas('success');
    $this->assertStringContainsString('Completed', session('success'));
  }

  /** @test */
  public function test_time_out_early_still_completed()
  {
    // Event starts at 1:00 PM and ends at 2:30 PM
    Carbon::setTestNow(Carbon::parse('2025-12-08 13:00:00'));

    $this->event = Event::factory()->create([
      'start_date' => '2025-12-08 13:00:00',
      'end_date' => '2025-12-08 14:30:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_007',
      'time_in' => '2025-12-08 13:10:00',
      'time_in_label' => 'On-Time'
    ]);

    // Scan time-out at 1:30 PM (early departure - more than 30 min before end)
    Carbon::setTestNow(Carbon::parse('2025-12-08 13:30:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'TEST_QR_007'
      ]);

    $this->attendance->refresh();
    // Should still be "Completed" as per new simplified logic
    $this->assertEquals('Completed', $this->attendance->time_out_label);
  }

  /** @test */
  public function test_event_visibility_on_resident_attendance()
  {
    // Current time: 1:00 PM
    Carbon::setTestNow(Carbon::parse('2025-12-08 13:00:00'));

    // Create ongoing event (started but not ended)
    $ongoingEvent = Event::factory()->create([
      'start_date' => '2025-12-08 12:00:00',
      'end_date' => '2025-12-08 15:00:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    // Create future event
    $futureEvent = Event::factory()->create([
      'start_date' => '2025-12-09 10:00:00',
      'end_date' => '2025-12-09 12:00:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    // Create past event
    $pastEvent = Event::factory()->create([
      'start_date' => '2025-12-07 10:00:00',
      'end_date' => '2025-12-07 12:00:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    // Create attendances
    Attendance::create([
      'event_id' => $ongoingEvent->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'ONGOING_QR'
    ]);

    Attendance::create([
      'event_id' => $futureEvent->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'FUTURE_QR'
    ]);

    Attendance::create([
      'event_id' => $pastEvent->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'PAST_QR',
      'time_in' => '2025-12-07 10:10:00',
      'time_in_label' => 'On-Time'
    ]);

    $response = $this->actingAs($this->resident)
      ->get(route('resident.attendance'));

    $response->assertInertia(function ($page) {
      // Confirmed events should show ongoing and future events
      $confirmedEvents = collect($page['props']['confirmedEvents']);
      $this->assertEquals(2, $confirmedEvents->count());

      // Attendance history should show only past events
      $attendanceHistory = collect($page['props']['attendanceHistory']);
      $this->assertEquals(1, $attendanceHistory->count());
    });
  }

  /** @test */
  public function test_feedback_form_appears_after_completed_time_out()
  {
    // Create event
    Carbon::setTestNow(Carbon::parse('2025-12-08 13:00:00'));

    $event = Event::factory()->create([
      'start_date' => '2025-12-08 13:00:00',
      'end_date' => '2025-12-08 14:30:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $attendance = Attendance::create([
      'event_id' => $event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'TEST_QR_FEEDBACK',
      'time_in' => '2025-12-08 13:10:00',
      'time_in_label' => 'On-Time',
      'time_out' => '2025-12-08 14:20:00',
      'time_out_label' => 'Completed'
    ]);

    // Access feedback page
    $response = $this->actingAs($this->resident)
      ->get(route('resident.feedback'));

    $response->assertInertia(function ($page) use ($event) {
      $eventsNeedingFeedback = collect($page['props']['eventsNeedingFeedback']);
      $this->assertEquals(1, $eventsNeedingFeedback->count());
      $this->assertEquals($event->id, $eventsNeedingFeedback->first()['id']);
    });
  }

  /** @test */
  public function test_cannot_scan_expired_event()
  {
    // Event already ended
    $this->event = Event::factory()->create([
      'start_date' => '2025-12-07 10:00:00',
      'end_date' => '2025-12-07 12:00:00',
      'status' => 'approved',
      'created_by' => $this->secretary->id
    ]);

    $this->attendance = Attendance::create([
      'event_id' => $this->event->id,
      'user_id' => $this->resident->id,
      'status' => 'confirmed',
      'qr_code' => 'EXPIRED_QR'
    ]);

    Carbon::setTestNow(Carbon::parse('2025-12-08 13:00:00'));

    $response = $this->actingAs($this->secretary)
      ->post(route('secretary.scan-qr'), [
        'qr_code' => 'EXPIRED_QR'
      ]);

    $response->assertSessionHasErrors();
    $this->assertStringContainsString('expired', session('errors')->first('message'));
  }
}
