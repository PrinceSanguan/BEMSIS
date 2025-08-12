<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'purok_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'has_certificate',
        'status',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function purok()
    {
        return $this->belongsTo(Purok::class);
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
}
