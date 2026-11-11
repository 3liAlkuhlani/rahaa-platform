<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_number',
        'passenger_id',
        'driver_id',
        'pickup_name',
        'dropoff_name',
        'pickup_lat',
        'pickup_lng',
        'dropoff_lat',
        'dropoff_lng',
        'vehicle_type',
        'fare',
        'payment_method',
        'status',
        'cancellation_reason',
        'cancelled_by',
        'passenger_rating',
        'driver_rating',
        'review',
        'accepted_at',
        'started_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'fare' => 'float',
        'passenger_rating' => 'float',
        'driver_rating' => 'float',
        'pickup_lat' => 'float',
        'pickup_lng' => 'float',
        'dropoff_lat' => 'float',
        'dropoff_lng' => 'float',
        'accepted_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function passenger()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
