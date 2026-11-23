<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    /**
     * Statuses considered active (passenger cannot create a new trip while one exists)
     * - requested   = Pending (waiting for driver)
     * - accepted    = Accepted by driver
     * - arrived     = Driver Arriving / Arrived at pickup
     * - in_progress = Trip in progress
     */
    public const ACTIVE_STATUSES = [
        'requested',
        'accepted',
        'arrived',
        'in_progress',
    ];

    public const TERMINAL_STATUSES = [
        'completed',
        'cancelled',
    ];

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
        'driver_lat',
        'driver_lng',
        'driver_location_updated_at',
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
        'driver_lat' => 'float',
        'driver_lng' => 'float',
        'driver_location_updated_at' => 'datetime',
        'accepted_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->whereIn('status', self::ACTIVE_STATUSES);
    }

    public function isActive(): bool
    {
        return in_array($this->status, self::ACTIVE_STATUSES, true);
    }

    public function passenger()
    {
        return $this->belongsTo(User::class, 'passenger_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
