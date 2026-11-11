<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_type',
        'vehicle_plate',
        'vehicle_model',
        'vehicle_color',
        'license_photo',
        'selfie_photo',
        'car_front_photo',
        'car_back_photo',
        'status',
        'rejection_reason',
        'rating',
        'total_trips',
        'wallet_balance',
        'is_online',
        'current_lat',
        'current_lng',
    ];

    protected $casts = [
        'rating' => 'float',
        'total_trips' => 'integer',
        'wallet_balance' => 'float',
        'is_online' => 'boolean',
        'current_lat' => 'float',
        'current_lng' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
