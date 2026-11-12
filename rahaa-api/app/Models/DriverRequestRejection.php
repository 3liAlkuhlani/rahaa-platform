<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverRequestRejection extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'request_type',
        'request_id',
        'reason',
    ];

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}

