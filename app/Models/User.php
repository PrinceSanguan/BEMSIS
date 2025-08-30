<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'is_active',
        'purok_id',
        'failed_login_attempts',
        'locked_until',
        'last_seen_at',
        'is_online',

        // Resident fields
        'first_name',
        'middle_name',
        'last_name',
        'extension',
        'place_of_birth',
        'date_of_birth',
        'age',
        'sex',
        'civil_status',
        'citizenship',
        'occupation',
        'special_notes',
        'contact_number',
        'valid_id_path',

        // Partner Agency fields
        'agency_name',
        'representative_first_name',
        'representative_last_name',
        'agency_address',
        'agency_contact_number',
        'agency_valid_id_path',
        'agency_endorsement_path',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'age' => 'integer',
        'failed_login_attempts' => 'integer',
        'locked_until' => 'datetime',
        'is_active' => 'boolean',
        'last_seen_at' => 'datetime',
        'is_online' => 'boolean',
    ];

    // Relationships
    public function eventsCreated()
    {
        return $this->hasMany(Event::class, 'created_by');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function purok()
    {
        return $this->belongsTo(Purok::class);
    }

    /**
     * Get user's devices
     */
    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    /**
     * Get user's trusted devices
     */
    public function trustedDevices()
    {
        return $this->hasMany(UserDevice::class)->where('is_trusted', true);
    }

    /**
     * Check if account is locked
     */
    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    /**
     * Increment failed login attempts and lock if necessary
     */
    public function incrementFailedAttempts(): void
    {
        $this->increment('failed_login_attempts');

        if ($this->failed_login_attempts >= 5) {
            $this->update([
                'locked_until' => now()->addMinutes(15)
            ]);
        }
    }

    /**
     * Reset failed login attempts
     */
    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_login_attempts' => 0,
            'locked_until' => null
        ]);
    }

    /**
     * Get remaining lockout time in minutes
     */
    public function getRemainingLockoutTime(): int
    {
        if (!$this->isLocked()) {
            return 0;
        }

        return $this->locked_until->diffInMinutes(now());
    }

    /**
     * Update user's last seen timestamp and mark as online
     */
    public function updateLastSeen(): void
    {
        $this->update([
            'last_seen_at' => now(),
            'is_online' => true
        ]);
    }

    /**
     * Check if user is currently considered online
     */
    public function isCurrentlyOnline(): bool
    {
        if (!$this->is_online || !$this->last_seen_at) {
            return false;
        }

        // Consider offline if last seen more than 5 minutes ago
        return $this->last_seen_at->isAfter(now()->subMinutes(5));
    }

    /**
     * Mark user as offline
     */
    public function markOffline(): void
    {
        $this->update(['is_online' => false]);
    }

    /**
     * Get formatted last seen time
     */
    public function getLastSeenAttribute($value): ?string
    {
        if (!$value) return null;

        $lastSeen = \Carbon\Carbon::parse($value);
        $now = now();

        if ($lastSeen->isToday()) {
            return $lastSeen->format('g:i A');
        } elseif ($lastSeen->isYesterday()) {
            return 'Yesterday at ' . $lastSeen->format('g:i A');
        } else {
            return $lastSeen->format('M j, Y g:i A');
        }
    }
}
