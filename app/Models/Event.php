<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'purok_ids',
        'title',
        'description',
        'image_path',
        'start_date',
        'end_date',
        'has_certificate',
        'status',
        'target_all_residents',
    ];

    protected $casts = [
        'purok_ids' => 'array',
        'target_all_residents' => 'boolean',
        'has_certificate' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
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
