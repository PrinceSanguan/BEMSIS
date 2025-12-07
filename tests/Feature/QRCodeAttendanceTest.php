<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Event;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class QRCodeAttendanceTest extends TestCase
{
  use RefreshDatabase;

  protected function createSecretary()
  {
    return User::create([
      'name' => 'Test Secretary',
      'email' => 'secretary@test.com',
      'phone' => '09123456789',
      'password' => bcrypt('password'),
      'role' => 'secretary',
      'status' => 'active',
    ]);
  }

  protected function createResident()
  {
    return User::create([
      'name' => 'Test Resident',
      'email' => 'resident@test.com',
      'phone' => '09987654321',
      'password' => bcrypt('password'),
      'role' => 'resident',
      'status' => 'active',
    ]);
  }

  protected function createEvent($startDate, $endDate = null)
  {
    $secretary = $this->createSecretary();

    return Event::create([
      'created_by' => $secretary->id,
      'title' => 'Test Event',
      'description' => 'Test Description',
      'venue' => 'Test Venue',
      'start_date' => $startDate,
      'end_date' => $endDate,
      'has_certificate' => false,
      'status' => 'approved',
      'target_all_residents' => true,
    ]);
  }

  protected function createAttendance($event, $user)
  {
    return Attendance::create([
      'event_id' => $event->id,
      'user_id' => $user->id,
      'status' => 'confirmed',
      'qr_code' => 'EVENT_' . $event->id . '_USER_' . $user->id . '_' . time(),
    ]);
  }

  public function test_time_in_is_labeled_on_time_within_30_minutes()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 10:15:00');

    $event = $this->createEvent('2024-12-07 10:00:00', '2024-12-07 12:00:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $response = $this->from('/test-referer')->post(route('secretary.scan-qr'), [
      'qr_code' => $attendance->qr_code,
    ]);

    $response->assertRedirect('/test-referer');
    $response->assertSessionHasNoErrors();

    $attendance->refresh();
    $this->assertEquals('On-Time', $attendance->time_in_label);
    $this->assertNotNull($attendance->time_in);
  }

  public function test_time_in_is_labeled_late_after_30_minutes()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 10:31:00');

    $event = $this->createEvent('2024-12-07 10:00:00', '2024-12-07 12:00:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $response = $this->from('/test-referer')->post(route('secretary.scan-qr'), [
      'qr_code' => $attendance->qr_code,
    ]);

    $response->assertRedirect('/test-referer');
    $response->assertSessionHasNoErrors();

    $attendance->refresh();
    $this->assertEquals('Late', $attendance->time_in_label);
    $this->assertNotNull($attendance->time_in);
  }

  public function test_time_in_exactly_30_minutes_is_on_time()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 10:30:00');

    $event = $this->createEvent('2024-12-07 10:00:00', '2024-12-07 12:00:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $response = $this->from('/test-referer')->post(route('secretary.scan-qr'), [
      'qr_code' => $attendance->qr_code,
    ]);

    $response->assertRedirect('/test-referer');
    $response->assertSessionHasNoErrors();

    $attendance->refresh();
    $this->assertEquals('On-Time', $attendance->time_in_label);
  }

  public function test_night_event_time_in_on_time()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 22:15:00');

    $event = $this->createEvent('2024-12-07 22:00:00', '2024-12-07 23:30:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $response = $this->from('/test-referer')->post(route('secretary.scan-qr'), [
      'qr_code' => $attendance->qr_code,
    ]);

    $response->assertRedirect('/test-referer');
    $response->assertSessionHasNoErrors();

    $attendance->refresh();
    $this->assertEquals('On-Time', $attendance->time_in_label);
  }

  public function test_night_event_time_in_late()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 22:31:00');

    $event = $this->createEvent('2024-12-07 22:00:00', '2024-12-07 23:30:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $response = $this->from('/test-referer')->post(route('secretary.scan-qr'), [
      'qr_code' => $attendance->qr_code,
    ]);

    $response->assertRedirect('/test-referer');
    $response->assertSessionHasNoErrors();

    $attendance->refresh();
    $this->assertEquals('Late', $attendance->time_in_label);
  }

  public function test_time_out_always_labeled_completed()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 10:00:00');

    $event = $this->createEvent('2024-12-07 10:00:00', '2024-12-07 12:00:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $attendance->update(['time_in' => now(), 'time_in_label' => 'On-Time']);

    Carbon::setTestNow('2024-12-07 10:45:00');

    $response = $this->from('/test-referer')->post(route('secretary.scan-qr'), [
      'qr_code' => $attendance->qr_code,
    ]);

    $response->assertRedirect('/test-referer');
    $response->assertSessionHasNoErrors();

    $attendance->refresh();
    $this->assertEquals('Completed', $attendance->time_out_label);
    $this->assertNotNull($attendance->time_out);
  }

  public function test_ongoing_event_visible_on_resident_dashboard()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 11:00:00');

    $event = $this->createEvent('2024-12-07 10:00:00', '2024-12-07 12:00:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $this->actingAs($resident);

    $response = $this->get(route('resident.attendance'));

    $response->assertInertia(
      fn($page) =>
      $page->has('confirmedEvents', 1)
    );
  }

  public function test_past_event_not_visible_on_resident_dashboard()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 13:00:00');

    $event = $this->createEvent('2024-12-07 10:00:00', '2024-12-07 12:00:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $this->actingAs($resident);

    $response = $this->get(route('resident.attendance'));

    $response->assertInertia(
      fn($page) =>
      $page->has('attendanceHistory', 1)
        ->missing('confirmedEvents.0')
    );
  }

  public function test_cannot_scan_expired_event()
  {
    $this->withoutMiddleware();

    Carbon::setTestNow('2024-12-07 13:00:00');

    $event = $this->createEvent('2024-12-07 10:00:00', '2024-12-07 12:00:00');
    $resident = $this->createResident();
    $attendance = $this->createAttendance($event, $resident);

    $response = $this->from('/test-referer')->post(route('secretary.scan-qr'), [
      'qr_code' => $attendance->qr_code,
    ]);

    $response->assertRedirect('/test-referer');
    $response->assertSessionHasErrors(['message' => 'The event is already expired']);

    $attendance->refresh();
    $this->assertNull($attendance->time_in);
  }
}
