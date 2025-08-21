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
        'purok_id',

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
}
