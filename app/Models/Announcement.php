<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'title',
        'content',
        'target_puroks',
        'target_all_puroks',
    ];

    protected $casts = [
        'target_puroks' => 'array',
        'target_all_puroks' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function puroks()
    {
        return $this->belongsToMany(Purok::class, 'announcement_purok');
    }
}
