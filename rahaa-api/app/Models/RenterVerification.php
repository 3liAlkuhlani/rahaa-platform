<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RenterVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'personal_photo',
        'id_card_front',
        'id_card_back',
        'driving_license_front',
        'driving_license_back',
        'id_expires_at',
        'license_expires_at',
        'status',
        'rejection_reason',
        'approved_at',
    ];

    protected $casts = [
        'id_expires_at' => 'date',
        'license_expires_at' => 'date',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

