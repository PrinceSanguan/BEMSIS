<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purok extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
